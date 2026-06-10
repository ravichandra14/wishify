import express from 'express';
import { generateGeminiWish } from '../wishHelper.js';

const router = express.Router();

router.post('/generate', async (req, res) => {
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

export default router;
