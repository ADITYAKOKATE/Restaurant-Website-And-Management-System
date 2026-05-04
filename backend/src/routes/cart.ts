import { Router, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/authMiddleware';
import Cart from '../models/Cart';

const router = Router();

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private
router.get('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    let cart = await Cart.findOne({ user: userId }).populate('items.menuItem');
    
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }
    
    res.json(cart);
  } catch (err: any) {
    console.error('Cart fetch error:', err);
    res.status(500).json({ error: 'Server error while fetching cart' });
  }
});

// @route   POST /api/cart
// @desc    Add item to cart or update quantity
// @access  Private
router.post('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { menuItemId, quantity = 1 } = req.body;

    if (!menuItemId) {
      res.status(400).json({ error: 'menuItemId is required' });
      return;
    }

    let cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const itemIndex = cart.items.findIndex((item) => item.menuItem.toString() === menuItemId);

    if (itemIndex > -1) {
      // Item exists, update quantity
      cart.items[itemIndex].quantity += quantity;
      
      // If quantity is 0 or less, remove the item
      if (cart.items[itemIndex].quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      }
    } else if (quantity > 0) {
      // New item
      cart.items.push({ menuItem: menuItemId, quantity });
    }

    await cart.save();
    
    // Return populated cart
    const populatedCart = await Cart.findById(cart._id).populate('items.menuItem');
    res.json(populatedCart);
  } catch (err: any) {
    console.error('Cart update error:', err);
    res.status(500).json({ error: 'Server error while updating cart' });
  }
});

// @route   DELETE /api/cart/:menuItemId
// @desc    Remove an item entirely from cart
// @access  Private
router.delete('/:menuItemId', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { menuItemId } = req.params;

    const cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      res.status(404).json({ error: 'Cart not found' });
      return;
    }

    cart.items = cart.items.filter((item) => item.menuItem.toString() !== menuItemId) as any;
    
    await cart.save();
    
    const populatedCart = await Cart.findById(cart._id).populate('items.menuItem');
    res.json(populatedCart);
  } catch (err: any) {
    console.error('Cart delete error:', err);
    res.status(500).json({ error: 'Server error while removing item from cart' });
  }
});

export default router;
