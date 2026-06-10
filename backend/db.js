import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Default Database Structure
const DEFAULT_DB = {
  users: [],
  contacts: [
    {
      id: '1',
      name: 'Rahul Sharma',
      birthday: '2026-06-15',
      relationship: 'Friend',
      email: 'rahul.sharma@example.com',
      phone: '+91 98765 43210',
      interests: 'Football, Gaming, Coffee',
      notes: 'Met at college, loves FIFA and dark roast coffee.'
    },
    {
      id: '2',
      name: 'Priya Patel',
      birthday: '2026-06-18',
      relationship: 'Sister',
      email: 'priya.patel@example.com',
      phone: '+91 87654 32109',
      interests: 'Photography, Traveling, Reading',
      notes: 'Loves capturing sunsets and reading fantasy novels.'
    },
    {
      id: '3',
      name: 'Amit Verma',
      birthday: '2026-06-25',
      relationship: 'Colleague',
      email: 'amit.verma@company.com',
      phone: '+91 76543 21098',
      interests: 'Coding, Stock Market, Cycling',
      notes: 'Senior tech lead, avid morning cyclist.'
    }
  ],
  scheduledWishes: [
    {
      id: 's1',
      recipientId: '1',
      recipientName: 'Rahul Sharma',
      wishType: 'AI Wish',
      channel: 'Message',
      date: '2026-06-15',
      time: '09:00',
      timezone: 'Asia/Kolkata (GMT+5:30)',
      status: 'Scheduled',
      messageContent: 'Happy Birthday Rahul! 🎂 Hope you score some amazing goals today both in FIFA and real life. Let\'s catch up soon for some coffee!'
    },
    {
      id: 's2',
      recipientId: '2',
      recipientName: 'Priya Patel',
      wishType: 'Greeting Card',
      channel: 'Email',
      date: '2026-06-18',
      time: '00:00',
      timezone: 'Asia/Kolkata (GMT+5:30)',
      status: 'Scheduled',
      messageContent: 'Happy Birthday, Sis! 🌸 Hope you capture many beautiful sunsets this year. Love you!',
      cardConfig: {
        template: 'Floral',
        bgColor: '#FFF5F7',
        textColor: '#FF4F9A',
        sticker: '🌸',
        fontFamily: 'Playfair Display',
        heading: 'Happy Birthday Sis!',
        body: 'May your year be filled with adventures, books, and beautiful photography!'
      }
    },
    {
      id: 's3',
      recipientId: '3',
      recipientName: 'Amit Verma',
      wishType: 'AI Wish',
      channel: 'Message',
      date: '2026-06-25',
      time: '11:00',
      timezone: 'Asia/Kolkata (GMT+5:30)',
      status: 'Scheduled',
      messageContent: 'Happy Birthday Amit! 🚀 Wishing you massive success in the stock market and coding this year. Have a great ride!'
    }
  ],
  history: [
    {
      id: 'h1',
      recipientName: 'Suresh Kumar',
      wishType: 'AI Wish',
      channel: 'Message',
      date: '2026-06-05',
      content: 'Wishing you a very happy birthday, Suresh! May your year be filled with prosperity, good health, and success.'
    },
    {
      id: 'h2',
      recipientName: 'Neha Sen',
      wishType: 'Greeting Card',
      channel: 'Email',
      date: '2026-06-08',
      content: 'Happy Birthday Neha! 🥳 Cheers to another wonderful year of growth and laughter.',
      cardConfig: {
        template: 'Party',
        bgColor: '#FFFBEB',
        textColor: '#FF8A3D',
        sticker: '🎉',
        fontFamily: 'Outfit',
        heading: 'Cheers to Neha!',
        body: 'Wishing you a day as bright and beautiful as you are!'
      }
    }
  ],
  deliveryLogs: [],
  settings: {
    emailNotifications: true,
    browserNotifications: true,
    reminderDayOf: true,
    reminderOneDayBefore: true,
    reminderThreeDaysBefore: false,
    timezone: 'Asia/Kolkata (GMT+5:30)',
    userName: 'User Profile',
    userEmail: 'user@wishify.app'
  }
};

// Initialize database file
export function initDb() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2), 'utf-8');
    console.log('Database initialized with default data structures.');
  }
}

// Read database
export function readDb() {
  initDb();
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to read database, returning default fallback:', error);
    return DEFAULT_DB;
  }
}

// Write database
export function writeDb(data) {
  initDb();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Failed to write to database:', error);
    return false;
  }
}

// Helper query operations
export const db = {
  get: (table) => {
    const data = readDb();
    return data[table] || [];
  },

  set: (table, records) => {
    const data = readDb();
    data[table] = records;
    writeDb(data);
  },

  findOne: (table, predicate) => {
    const records = db.get(table);
    if (!Array.isArray(records)) return records; // for objects like settings
    return records.find(predicate);
  },

  insert: (table, record) => {
    const records = db.get(table);
    records.push(record);
    db.set(table, records);
    return record;
  },

  update: (table, id, updatedFields) => {
    if (table === 'settings') {
      const settings = db.get('settings');
      const newSettings = { ...settings, ...updatedFields };
      const fullData = readDb();
      fullData.settings = newSettings;
      writeDb(fullData);
      return newSettings;
    }
    const records = db.get(table);
    let updatedRecord = null;
    const newRecords = records.map(r => {
      if (r.id === id) {
        updatedRecord = { ...r, ...updatedFields };
        return updatedRecord;
      }
      return r;
    });
    db.set(table, newRecords);
    return updatedRecord;
  },

  delete: (table, id) => {
    const records = db.get(table);
    const filtered = records.filter(r => r.id !== id);
    db.set(table, filtered);
    return true;
  }
};
