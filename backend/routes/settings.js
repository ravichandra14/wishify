import express from 'express';
import { db } from '../db.js';

const router = express.Router();

router.get('/', (req, res) => {
  const settings = db.get('settings');
  res.json(settings);
});

router.put('/', (req, res) => {
  const updatedFields = req.body;
  const newSettings = db.update('settings', null, updatedFields);
  res.json(newSettings);
});

export default router;
