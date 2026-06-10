import express from 'express';
import { db } from '../db.js';

const router = express.Router();

router.get('/', (req, res) => {
  const contacts = db.get('contacts');
  res.json(contacts);
});

// Returns upcoming birthdays (within next 7 days) and days remaining
router.get('/upcoming', (req, res) => {
  const contacts = db.get('contacts');
  
  const getDaysRemaining = (birthdayStr) => {
    if (!birthdayStr) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const bdate = new Date(birthdayStr);
    const birthMonth = bdate.getMonth();
    const birthDay = bdate.getDate();

    let targetYear = today.getFullYear();
    let nextBirthday = new Date(targetYear, birthMonth, birthDay);

    if (nextBirthday.getTime() < today.getTime()) {
      nextBirthday.setFullYear(targetYear + 1);
    }

    const diffTime = nextBirthday.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const upcoming = contacts.map(c => ({
    ...c,
    daysRemaining: getDaysRemaining(c.birthday)
  })).filter(c => c.daysRemaining > 0 && c.daysRemaining <= 7)
     .sort((a, b) => a.daysRemaining - b.daysRemaining);

  res.json(upcoming);
});

router.post('/', (req, res) => {
  const { name, birthday, relationship, email, phone, interests, notes } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required.' });
  }

  const newContact = {
    id: `c_${Date.now()}`,
    name,
    birthday: birthday || '',
    relationship: relationship || 'Friend',
    email: email || '',
    phone: phone || '',
    interests: interests || '',
    notes: notes || ''
  };

  db.insert('contacts', newContact);
  res.status(201).json(newContact);
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const updatedFields = req.body;
  
  const contact = db.findOne('contacts', c => c.id === id);
  if (!contact) {
    return res.status(404).json({ error: 'Contact not found' });
  }

  const updatedContact = db.update('contacts', id, updatedFields);
  res.json(updatedContact);
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const contact = db.findOne('contacts', c => c.id === id);
  if (!contact) {
    return res.status(404).json({ error: 'Contact not found' });
  }

  db.delete('contacts', id);
  res.json({ message: 'Contact successfully deleted.' });
});

// --- CSV IMPORT / EXPORT ROUTES ---

router.get('/export', (req, res) => {
  const contacts = db.get('contacts');
  const headers = 'id,name,birthday,relationship,email,phone,interests,notes\n';
  
  const rows = contacts.map(c => [
    c.id,
    `"${(c.name || '').replace(/"/g, '""')}"`,
    c.birthday || '',
    c.relationship || '',
    c.email || '',
    c.phone || '',
    `"${(c.interests || '').replace(/"/g, '""')}"`,
    `"${(c.notes || '').replace(/"/g, '""')}"`
  ].join(',')).join('\n');
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=wishify_contacts.csv');
  res.send(headers + rows);
});

router.post('/import', (req, res) => {
  const { csv } = req.body;
  if (!csv) {
    return res.status(400).json({ error: 'CSV data string required in request body.' });
  }

  try {
    const lines = csv.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length < 2) {
      return res.status(400).json({ error: 'CSV must contain at least headers and one data row.' });
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
    const contacts = db.get('contacts');
    const imported = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      let currentVal = '';
      let inQuotes = false;
      const row = [];

      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          row.push(currentVal.trim());
          currentVal = '';
        } else {
          currentVal += char;
        }
      }
      row.push(currentVal.trim());

      const contactObj = {};
      headers.forEach((h, index) => {
        let val = row[index] || '';
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.substring(1, val.length - 1);
        }
        contactObj[h] = val;
      });

      if (contactObj.name) {
        const id = contactObj.id || `c_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const exists = contacts.some(c => c.id === id);
        const uniqueId = exists ? `c_${Date.now()}_${Math.floor(Math.random() * 1000)}` : id;

        const newC = {
          id: uniqueId,
          name: contactObj.name,
          birthday: contactObj.birthday || '',
          relationship: contactObj.relationship || 'Friend',
          email: contactObj.email || '',
          phone: contactObj.phone || '',
          interests: contactObj.interests || '',
          notes: contactObj.notes || ''
        };
        
        contacts.unshift(newC);
        imported.push(newC);
      }
    }

    db.set('contacts', contacts);
    res.json({ message: `Successfully imported ${imported.length} contacts!`, contacts: imported });
  } catch (error) {
    console.error('CSV import parsing failed:', error);
    res.status(500).json({ error: 'Failed to parse CSV payload. Ensure standard format.' });
  }
});

export default router;
