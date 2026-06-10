import express from 'express';
import { db } from '../db.js';

const router = express.Router();

router.get('/', (req, res) => {
  const scheduled = db.get('scheduledWishes');
  res.json(scheduled);
});

router.post('/', (req, res) => {
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

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const updatedFields = req.body;

  const scheduled = db.findOne('scheduledWishes', w => w.id === id);
  if (!scheduled) {
    return res.status(404).json({ error: 'Scheduled wish not found.' });
  }

  if (updatedFields.date || updatedFields.time) {
    updatedFields.status = 'Scheduled';
  }

  const updated = db.update('scheduledWishes', id, updatedFields);
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const scheduled = db.findOne('scheduledWishes', w => w.id === id);
  if (!scheduled) {
    return res.status(404).json({ error: 'Scheduled wish not found.' });
  }

  db.delete('scheduledWishes', id);
  res.json({ message: 'Scheduled wish successfully deleted.' });
});

export default router;
