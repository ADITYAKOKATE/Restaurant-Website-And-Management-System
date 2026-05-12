import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { signToken, verifyToken, cookieOptions } from '../lib/auth';
import { requireAuth, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

// ─────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone } = req.body;

    // Validation
    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Name, email, and password are required' });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
      return;
    }

    // Check for existing user
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(409).json({ success: false, message: 'An account with this email already exists' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone || '',
    });

    // Generate token & set cookie
    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    });

    res.cookie('auth_token', token, cookieOptions);
    res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to Premacha Wada!',
      user: {
        userId: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// ─────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    });

    res.cookie('auth_token', token, cookieOptions);
    res.status(200).json({
      success: true,
      message: 'Login successful! Welcome back!',
      user: {
        userId: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// ─────────────────────────────────────────────
// POST /api/auth/logout
// ─────────────────────────────────────────────
router.post('/logout', (_req: Request, res: Response): void => {
  res.clearCookie('auth_token', { path: '/' });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

// ─────────────────────────────────────────────
// GET /api/auth/me  — verify current session
// ─────────────────────────────────────────────
router.get('/me', requireAuth, (req: AuthRequest, res: Response): void => {
  res.status(200).json({ success: true, user: req.user });
});

// ─────────────────────────────────────────────
// GET /api/auth/profile  — get full user profile
// ─────────────────────────────────────────────
router.get('/profile', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.userId).select('-password');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }
    res.json({ success: true, user });
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─────────────────────────────────────────────
// PATCH /api/auth/profile  — update user profile
// ─────────────────────────────────────────────
router.patch('/profile', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, phone, address } = req.body;
    const updateData: any = {};
    if (name?.trim()) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone.trim();
    if (address !== undefined) updateData.address = address.trim();

    const user = await User.findByIdAndUpdate(
      req.user?.userId,
      updateData,
      { new: true, select: '-password' }
    );

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    // Re-issue JWT with updated name
    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    });
    res.cookie('auth_token', token, cookieOptions);

    res.json({ success: true, message: 'Profile updated successfully!', user });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

export default router;
