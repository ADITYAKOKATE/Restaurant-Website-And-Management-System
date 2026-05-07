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

// @route   GET /api/menu/admin/all
// @desc    Get all menu items (including unavailable) - Admin only
// @access  Private/Admin
router.get('/admin/all', async (req: Request, res: Response) => {
  try {
    const items = await MenuItem.find().sort({ category: 1, name: 1 });
    res.json(items);
  } catch (err: any) {
    console.error('Admin menu fetch error:', err);
    res.status(500).json({ error: 'Server error while fetching menu' });
  }
});

// @route   POST /api/menu
// @desc    Create new menu item - Admin only
// @access  Private/Admin
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      name,
      category,
      subCategory,
      price,
      description,
      image,
      isVeg,
      isAvailable,
      isBestseller,
      promotionLabel,
      comboGroup,
    } = req.body;

    // Validation
    if (!name || !category || !price) {
      res.status(400).json({ error: 'Name, category, and price are required' });
      return;
    }

    const newItem = await MenuItem.create({
      name: name.trim(),
      category: category.trim(),
      subCategory: subCategory?.trim() || '',
      price: Number(price),
      description: description?.trim() || '',
      image: image || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
      isVeg: isVeg !== false,
      isAvailable: isAvailable !== false,
      isBestseller: Boolean(isBestseller),
      promotionLabel: promotionLabel?.trim() || '',
      comboGroup: comboGroup?.trim() || '',
    });

    res.status(201).json({ success: true, item: newItem });
  } catch (err: any) {
    console.error('Create menu item error:', err);
    res.status(500).json({ error: 'Failed to create menu item' });
  }
});

// @route   PATCH /api/menu/:id
// @desc    Update menu item - Admin only
// @access  Private/Admin
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Sanitize input
    const sanitized: any = {};
    if (updateData.name) sanitized.name = updateData.name.trim();
    if (updateData.category) sanitized.category = updateData.category.trim();
    if (updateData.subCategory) sanitized.subCategory = updateData.subCategory.trim();
    if (updateData.price) sanitized.price = Number(updateData.price);
    if (updateData.description) sanitized.description = updateData.description.trim();
    if (updateData.image) sanitized.image = updateData.image;
    if (updateData.isVeg !== undefined) sanitized.isVeg = Boolean(updateData.isVeg);
    if (updateData.isAvailable !== undefined) sanitized.isAvailable = Boolean(updateData.isAvailable);
    if (updateData.isBestseller !== undefined) sanitized.isBestseller = Boolean(updateData.isBestseller);
    if (updateData.promotionLabel !== undefined) sanitized.promotionLabel = updateData.promotionLabel.trim();
    if (updateData.comboGroup !== undefined) sanitized.comboGroup = updateData.comboGroup.trim();

    const updatedItem = await MenuItem.findByIdAndUpdate(id, sanitized, { new: true });

    if (!updatedItem) {
      res.status(404).json({ error: 'Menu item not found' });
      return;
    }

    res.json({ success: true, item: updatedItem });
  } catch (err: any) {
    console.error('Update menu item error:', err);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

// @route   DELETE /api/menu/:id
// @desc    Delete menu item - Admin only
// @access  Private/Admin
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedItem = await MenuItem.findByIdAndDelete(id);

    if (!deletedItem) {
      res.status(404).json({ error: 'Menu item not found' });
      return;
    }

    res.json({ success: true, message: 'Menu item deleted' });
  } catch (err: any) {
    console.error('Delete menu item error:', err);
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
});

export default router;
