import { Router, Request, Response } from 'express';
import MenuItem from '../models/MenuItem';

const router = Router();

// @route   GET /api/menu
// @desc    Get all menu items
// @access  Public
router.get('/', async (req: Request, res: Response) => {
  try {
    const items = await MenuItem.find({ isAvailable: true }).sort({ category: 1 });
    res.json(items);
  } catch (err: any) {
    console.error('Menu fetch error:', err);
    res.status(500).json({ error: 'Server error while fetching menu' });
  }
});

export default router;
