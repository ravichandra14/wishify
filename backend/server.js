import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb } from './db.js';
import { startWorker } from './worker.js';

// Import modular routers
import authRouter from './routes/auth.js';
import contactsRouter from './routes/contacts.js';
import wishesRouter from './routes/wishes.js';
import scheduledRouter from './routes/scheduled.js';
import historyRouter from './routes/history.js';
import settingsRouter from './routes/settings.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and body parsing
app.use(cors());
app.use(express.json());

// Initialize Database & Background Worker
initDb();
startWorker();

// Register modular routers
app.use('/api/auth', authRouter);
app.use('/api/contacts', contactsRouter);
app.use('/api/wishes', wishesRouter);
app.use('/api/scheduled', scheduledRouter);
app.use('/api/history', historyRouter);
app.use('/api/settings', settingsRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error Handler]', err);
  res.status(500).json({ error: 'An unexpected server error occurred.' });
});

// Start Express app listening
app.listen(PORT, () => {
  console.log(`[Express] Wishify Backend API server running at http://localhost:${PORT}`);
});
