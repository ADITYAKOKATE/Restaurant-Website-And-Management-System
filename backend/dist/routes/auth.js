"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = __importDefault(require("../models/User"));
const auth_1 = require("../lib/auth");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// ─────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────
router.post('/register', async (req, res) => {
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
        const existingUser = await User_1.default.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            res.status(409).json({ success: false, message: 'An account with this email already exists' });
            return;
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        // Create user
        const user = await User_1.default.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            phone: phone || '',
        });
        // Generate token & set cookie
        const token = (0, auth_1.signToken)({
            userId: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
        });
        res.cookie('auth_token', token, auth_1.cookieOptions);
        res.status(201).json({
            success: true,
            message: 'Account created successfully! Welcome to Premacha Vada!',
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
});
// ─────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ success: false, message: 'Email and password are required' });
            return;
        }
        const user = await User_1.default.findOne({ email: email.toLowerCase() });
        if (!user) {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
            return;
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
            return;
        }
        const token = (0, auth_1.signToken)({
            userId: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
        });
        res.cookie('auth_token', token, auth_1.cookieOptions);
        res.status(200).json({
            success: true,
            message: 'Login successful! Welcome back!',
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
});
// ─────────────────────────────────────────────
// POST /api/auth/logout
// ─────────────────────────────────────────────
router.post('/logout', (_req, res) => {
    res.clearCookie('auth_token', { path: '/' });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
});
// ─────────────────────────────────────────────
// GET /api/auth/me  — verify current session
// ─────────────────────────────────────────────
router.get('/me', authMiddleware_1.requireAuth, (req, res) => {
    res.status(200).json({ success: true, user: req.user });
});
// ─────────────────────────────────────────────
// GET /api/auth/profile  — get full user profile
// ─────────────────────────────────────────────
router.get('/profile', authMiddleware_1.requireAuth, async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user?.userId).select('-password');
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found.' });
            return;
        }
        res.json({ success: true, user });
    }
    catch (err) {
        console.error('Profile fetch error:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});
// ─────────────────────────────────────────────
// PATCH /api/auth/profile  — update user profile
// ─────────────────────────────────────────────
router.patch('/profile', authMiddleware_1.requireAuth, async (req, res) => {
    try {
        const { name, phone, address } = req.body;
        const updateData = {};
        if (name?.trim())
            updateData.name = name.trim();
        if (phone !== undefined)
            updateData.phone = phone.trim();
        if (address !== undefined)
            updateData.address = address.trim();
        const user = await User_1.default.findByIdAndUpdate(req.user?.userId, updateData, { new: true, select: '-password' });
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found.' });
            return;
        }
        // Re-issue JWT with updated name
        const token = (0, auth_1.signToken)({
            userId: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
        });
        res.cookie('auth_token', token, auth_1.cookieOptions);
        res.json({ success: true, message: 'Profile updated successfully!', user });
    }
    catch (err) {
        console.error('Profile update error:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});
exports.default = router;
