import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db, initDb } from './db.js';
import { generateGeminiWish } from './wishHelper.js';
import { startWorker, getScheduledTimestamp } from './worker.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and body parsing
app.use(cors());
app.use(express.json());

// Initialize Database & Background Worker
initDb();
startWorker();

// --- AUTHENTICATION ROUTES ---

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required fields.' });
  }

  const existing = db.findOne('users', u => u.email === email);
  if (existing) {
    return res.status(400).json({ error: 'A user with this email already exists.' });
  }

  const newUser = { id: `u_${Date.now()}`, name, email, password };
  db.insert('users', newUser);

  // Sync profile details into settings
  db.update('settings', null, { userName: name, userEmail: email });

  res.status(201).json({ message: 'User registered successfully!', user: { name, email } });
});

app.post('/api/auth/login', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  const user = db.findOne('users', u => u.email === email);
  if (!user) {
    // For convenience in this development version, auto-create the user if they don't exist
    const defaultName = email.split('@')[0];
    const newUser = { id: `u_${Date.now()}`, name: defaultName, email };
    db.insert('users', newUser);
    db.update('settings', null, { userName: defaultName, userEmail: email });
    return res.json({ message: 'New user registered and logged in!', user: newUser });
  }

  // Update settings user profile just in case
  db.update('settings', null, { userName: user.name, userEmail: user.email });

  res.json({ message: 'Logged in successfully!', user });
});

app.get('/api/auth/profile', (req, res) => {
  const settings = db.get('settings');
  res.json({ name: settings.userName, email: settings.userEmail });
});


// --- CONTACTS CRUD ROUTES ---

app.get('/api/contacts', (req, res) => {
  const contacts = db.get('contacts');
  res.json(contacts);
});

// Returns upcoming birthdays (within next 7 days) and days remaining
app.get('/api/contacts/upcoming', (req, res) => {
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

app.post('/api/contacts', (req, res) => {
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

app.put('/api/contacts/:id', (req, res) => {
  const { id } = req.params;
  const updatedFields = req.body;
  
  const contact = db.findOne('contacts', c => c.id === id);
  if (!contact) {
    return res.status(404).json({ error: 'Contact not found' });
  }

  const updatedContact = db.update('contacts', id, updatedFields);
  res.json(updatedContact);
});

app.delete('/api/contacts/:id', (req, res) => {
  const { id } = req.params;
  const contact = db.findOne('contacts', c => c.id === id);
  if (!contact) {
    return res.status(404).json({ error: 'Contact not found' });
  }

  db.delete('contacts', id);
  res.json({ message: 'Contact successfully deleted.' });
});


// --- CSV IMPORT / EXPORT ROUTES ---

app.get('/api/contacts/export', (req, res) => {
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

app.post('/api/contacts/import', (req, res) => {
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
        
        // Avoid duplicate ID collision
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


// --- WISH GENERATION ROUTE ---

app.post('/api/wishes/generate', async (req, res) => {
  const { name, relationship, interests, tone, length } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Recipient name is required.' });
  }

  try {
    const wish = await generateGeminiWish(
      name,
      relationship || 'Friend',
      interests || '',
      tone || 'Funny',
      length || 'Medium'
    );
    res.json({ wish });
  } catch (error) {
    res.status(500).json({ error: 'Error occurred during AI wish generation.' });
  }
});


// --- SCHEDULED WISHES CRUD ROUTES ---

app.get('/api/scheduled', (req, res) => {
  const scheduled = db.get('scheduledWishes');
  res.json(scheduled);
});

app.post('/api/scheduled', (req, res) => {
  const { recipientId, recipientName, wishType, channel, date, time, timezone, messageContent, cardConfig } = req.body;
  if (!recipientName || !date || !time) {
    return res.status(400).json({ error: 'Recipient name, date, and time are required fields.' });
  }

  const newSchedule = {
    id: `s_${Date.now()}`,
    recipientId: recipientId || '',
    recipientName,
    wishType: wishType || 'AI Wish',
    channel: channel || 'Email',
    date,
    time,
    timezone: timezone || 'Asia/Kolkata (GMT+5:30)',
    status: 'Scheduled',
    messageContent: messageContent || '',
    cardConfig
  };

  db.insert('scheduledWishes', newSchedule);
  res.status(201).json(newSchedule);
});

app.put('/api/scheduled/:id', (req, res) => {
  const { id } = req.params;
  const updatedFields = req.body;

  const scheduled = db.findOne('scheduledWishes', w => w.id === id);
  if (!scheduled) {
    return res.status(404).json({ error: 'Scheduled wish not found.' });
  }

  // Force status back to Scheduled if date/time are edited and it was Sent/Failed
  if (updatedFields.date || updatedFields.time) {
    updatedFields.status = 'Scheduled';
  }

  const updated = db.update('scheduledWishes', id, updatedFields);
  res.json(updated);
});

app.delete('/api/scheduled/:id', (req, res) => {
  const { id } = req.params;
  const scheduled = db.findOne('scheduledWishes', w => w.id === id);
  if (!scheduled) {
    return res.status(404).json({ error: 'Scheduled wish not found.' });
  }

  db.delete('scheduledWishes', id);
  res.json({ message: 'Scheduled wish successfully deleted.' });
});


// --- HISTORY & LOGS ROUTES ---

app.get('/api/history', (req, res) => {
  const history = db.get('history');
  const logs = db.get('deliveryLogs');
  res.json({ history, logs });
});

app.post('/api/history', (req, res) => {
  const { recipientName, wishType, channel, date, content, cardConfig } = req.body;
  if (!recipientName || !content) {
    return res.status(400).json({ error: 'Recipient name and wish content are required.' });
  }

  const historyItem = {
    id: `h_${Date.now()}`,
    recipientName,
    wishType: wishType || 'AI Wish',
    channel: channel || 'Email',
    date: date || new Date().toISOString().split('T')[0],
    content,
    cardConfig
  };

  db.insert('history', historyItem);
  res.status(201).json(historyItem);
});

app.delete('/api/history', (req, res) => {
  db.set('history', []);
  res.json({ message: 'Archive history log cleared successfully.' });
});


// --- SETTINGS ROUTES ---

app.get('/api/settings', (req, res) => {
  const settings = db.get('settings');
  res.json(settings);
});

app.put('/api/settings', (req, res) => {
  const updatedFields = req.body;
  const newSettings = db.update('settings', null, updatedFields);
  res.json(newSettings);
});


// Start Express app listening
app.listen(PORT, () => {
  console.log(`[Express] Wishify Backend API server running at http://localhost:${PORT}`);
});
