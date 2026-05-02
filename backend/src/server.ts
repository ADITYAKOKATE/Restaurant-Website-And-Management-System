import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDB from './lib/db';
import authRoutes from './routes/auth';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// ─────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true, // Allow cookies to pass through
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─────────────────────────────────────────────
// Connect to Database
// ─────────────────────────────────────────────
connectDB();

// ─────────────────────────────────────────────
// API Routes
// ─────────────────────────────────────────────
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: '🍛 Premacha Vada Backend is running!' });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Premacha Vada Backend running at http://localhost:${PORT}`);
  console.log(`📡 Accepting requests from ${FRONTEND_URL}\n`);
});

export default app;
