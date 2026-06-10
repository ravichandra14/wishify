import express from 'express';
import { db } from '../db.js';

const router = express.Router();

router.get('/', (req, res) => {
  const history = db.get('history');
  const logs = db.get('deliveryLogs');
  res.json({ history, logs });
});

router.post('/', (req, res) => {
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

router.delete('/', (req, res) => {
  db.set('history', []);
  res.json({ message: 'Archive history log cleared successfully.' });
});

export default router;
