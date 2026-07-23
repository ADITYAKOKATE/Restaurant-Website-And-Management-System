import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDB from './lib/db';
import authRoutes from './routes/auth';
import menuRoutes from './routes/menu';
import cartRoutes from './routes/cart';
import orderRoutes from './routes/order';
import usersRoutes from './routes/users';
import settingsRoutes from './routes/settings';
import offersRoutes from './routes/offers';
import reservationRoutes from './routes/reservationRoutes';
import billingRoutes from './routes/billingRoutes';
import reviewRoutes from './routes/reviewRoutes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Support comma-separated list of allowed origins
const envOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim().replace(/\/$/, '')) // Remove trailing slash if any
  .filter(Boolean);

// Add known production domains as fallback to prevent CORS 500 errors via Next.js proxy
const defaultProdOrigins = [
  'https://premachawada.in',
  'https://www.premachawada.in',
  'https://premacha-wada-website.vercel.app'
];

const allowedOrigins = Array.from(new Set([...envOrigins, ...defaultProdOrigins]));

// ─────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. Render health checks, mobile)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(null, false); // By passing false, it will fail CORS without throwing a 500 error
  },
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
app.use('/api/menu', menuRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/offers', offersRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/reviews', reviewRoutes);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: '🍛 Premacha Wada Backend is running!' });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Premacha Wada Backend running at http://localhost:${PORT}`);
  console.log(`📡 Accepting requests from: ${allowedOrigins.join(', ')}\n`);
});

export default app;
