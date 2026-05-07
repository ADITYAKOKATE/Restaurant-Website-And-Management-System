import { Router, Response } from 'express';
import User from '../models/User';
import { requireAdmin, AuthRequest } from '../middleware/authMiddleware';

const router = Router();

const VALID_ROLES = ['user', 'admin', 'kitchen', 'delivery'] as const;

// @route   GET /api/users
// @desc    Get all users — Admin only
// @access  Private/Admin
router.get('/', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    const formattedUsers = users.map((user: any) => ({
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      createdAt: user.createdAt,
      lastLoginAt: user.updatedAt,
      isBlocked: user.isBlocked || false,
    }));

    res.json(formattedUsers);
  } catch (err: any) {
    console.error('Users fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// @route   GET /api/users/:id
// @desc    Get single user — Admin only
// @access  Private/Admin
router.get('/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(user);
  } catch (err: any) {
    console.error('User fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// @route   PUT /api/users/:id/role
// @desc    Update user role (user | admin | kitchen | delivery) — Admin only
// @access  Private/Admin
router.put('/:id/role', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !VALID_ROLES.includes(role)) {
      res.status(400).json({ error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}` });
      return;
    }

    // Prevent admin from changing their own role
    if (id === req.user?.userId && role !== 'admin') {
      res.status(400).json({ error: 'You cannot change your own admin role.' });
      return;
    }

    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-password');
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ success: true, user });
  } catch (err: any) {
    console.error('Role update error:', err);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// @route   PUT /api/users/:id/block
// @desc    Block/unblock user — Admin only
// @access  Private/Admin
router.put('/:id/block', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { isBlocked } = req.body;

    if (isBlocked === undefined) {
      res.status(400).json({ error: 'isBlocked field is required' });
      return;
    }

    if (id === req.user?.userId) {
      res.status(400).json({ error: 'You cannot block your own account.' });
      return;
    }

    const user = await User.findByIdAndUpdate(
      id,
      { isBlocked: Boolean(isBlocked) },
      { new: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ success: true, user });
  } catch (err: any) {
    console.error('Block user error:', err);
    res.status(500).json({ error: 'Failed to update user block status' });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user — Admin only
// @access  Private/Admin
router.delete('/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (id === req.user?.userId) {
      res.status(400).json({ error: 'You cannot delete your own account.' });
      return;
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ success: true, message: 'User deleted' });
  } catch (err: any) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
