import express from 'express';
import { db } from '../db.js';

const router = express.Router();

router.post('/register', (req, res) => {
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

router.post('/login', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  const user = db.findOne('users', u => u.email === email);
  if (!user) {
    const defaultName = email.split('@')[0];
    const newUser = { id: `u_${Date.now()}`, name: defaultName, email };
    db.insert('users', newUser);
    db.update('settings', null, { userName: defaultName, userEmail: email });
    return res.json({ message: 'New user registered and logged in!', user: newUser });
  }

  db.update('settings', null, { userName: user.name, userEmail: user.email });
  res.json({ message: 'Logged in successfully!', user });
});

router.get('/profile', (req, res) => {
  const settings = db.get('settings');
  res.json({ name: settings.userName, email: settings.userEmail });
});

export default router;
