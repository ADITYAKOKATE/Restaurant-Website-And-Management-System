import { Router, Response } from 'express';
import mongoose from 'mongoose';
import { requireAuth, requireAdmin, requireKitchen, requireDelivery, AuthRequest } from '../middleware/authMiddleware';
import Order from '../models/Order';
import Cart from '../models/Cart';
import Offer from '../models/Offer';
import { getOrCreateSettings } from '../models/Settings';
import MenuItem from '../models/MenuItem';
import Reservation from '../models/Reservation';

const router = Router();

/** Generates a unique sequential token number */
async function generateTokenNumber(): Promise<number> {
  const lastOrder = await Order.findOne(
    {},
    { tokenNumber: 1 },
    { sort: { tokenNumber: -1 } }
  );

  return lastOrder ? lastOrder.tokenNumber + 1 : 101;
}

async function createOrderWithUniqueToken(orderData: Record<string, unknown>) {
  const maxAttempts = 5;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const tokenNumber = await generateTokenNumber();
      return await Order.create({
        ...orderData,
        tokenNumber,
      });
    } catch (error) {
      const isDuplicateToken =
        error instanceof mongoose.Error &&
        'code' in error &&
        (error as any).code === 11000 &&
        (error as any).keyPattern?.tokenNumber;

      if (!isDuplicateToken || attempt === maxAttempts) {
        throw error;
      }
    }
  }

  throw new Error('Failed to generate unique token number.');
}

// ─────────────────────────────────────────────
// POST /api/orders  — Place an order (checkout)
// ─────────────────────────────────────────────
router.post('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { paymentMethod, deliveryAddress, phone, specialInstructions, promoCode, paymentReferenceId } = req.body;

    if (!paymentMethod) {
      res.status(400).json({ success: false, message: 'paymentMethod is required.' });
      return;
    }

    if (!deliveryAddress) {
      res.status(400).json({ success: false, message: 'Delivery address is required.' });
      return;
    }

    const cart = await Cart.findOne({ user: userId }).populate('items.menuItem');
    if (!cart || cart.items.length === 0) {
      res.status(400).json({ success: false, message: 'Your cart is empty.' });
      return;
    }

    const validItems = cart.items.filter((item: any) => item.menuItem != null);
    if (validItems.length === 0) {
      res.status(400).json({ success: false, message: 'No valid items in cart.' });
      return;
    }

    const settings = await getOrCreateSettings();

    // 1. Check if store is open
    if (!settings.storeOpen) {
      res.status(400).json({ success: false, message: 'Restaurant is currently closed for new orders.' });
      return;
    }

    const subtotal = validItems.reduce((sum: number, item: any) => sum + (item.menuItem.price * item.quantity), 0);

    // 2. Check minimum order amount
    if (subtotal < settings.minimumOrder) {
      res.status(400).json({ success: false, message: `Minimum order amount is ₹${settings.minimumOrder}.` });
      return;
    }

    // 3. Check online payments enabled
    if (paymentMethod === 'online' && !settings.onlinePaymentsEnabled) {
      res.status(400).json({ success: false, message: 'Online payments are currently disabled. Please choose Cash on Delivery.' });
      return;
    }

    const taxAmount = Math.round(subtotal * (settings.taxRate / 100));
    const deliveryFee = settings.deliveryCharge;
    
    let discountAmount = 0;
    let appliedPromoCode = '';

    if (promoCode) {
      const offer = await Offer.findOne({ discountCode: promoCode.toUpperCase(), isActive: true });
      if (!offer) {
        res.status(400).json({ success: false, message: 'Invalid or expired promo code.' });
        return;
      }
      if (offer.minimumOrderValue > 0 && subtotal < offer.minimumOrderValue) {
        res.status(400).json({ success: false, message: `Minimum order value for this code is ₹${offer.minimumOrderValue}` });
        return;
      }
      if (offer.discountType === 'percentage') {
        discountAmount = Math.round(subtotal * (offer.discountValue / 100));
      } else {
        discountAmount = offer.discountValue;
      }
      // Discount can't be more than subtotal
      discountAmount = Math.min(discountAmount, subtotal);
      appliedPromoCode = offer.discountCode || promoCode;
    }

    const totalAmount = subtotal + taxAmount + deliveryFee - discountAmount;

    const paymentStatus = paymentMethod === 'online' ? 'pending_verification' : 'pending';
    // All orders start as pending, waiting for Admin approval
    const status = 'pending';

    const orderItems = validItems.map((item: any) => ({
      menuItem: item.menuItem._id,
      name: item.menuItem.name,
      price: item.menuItem.price,
      quantity: item.quantity,
      image: item.menuItem.image || '',
    }));

    const order = await createOrderWithUniqueToken({
      user: userId,
      items: orderItems,
      totalAmount,
      taxAmount,
      deliveryFee,
      discountAmount,
      appliedPromoCode,
      orderType: 'delivery',
      paymentMethod,
      paymentStatus,
      paymentReferenceId: paymentReferenceId || '',
      status,
      deliveryAddress,
      phone: phone || '',
      specialInstructions: specialInstructions || '',
      statusHistory: [{ status: 'pending', changedBy: userId }]
    });

    // Clear cart
    cart.items = [] as any;
    await cart.save();

    res.status(201).json({
      success: true,
      message: paymentMethod === 'online'
        ? 'Payment successful! Order placed.'
        : 'Order placed successfully! Pay on delivery.',
      order: {
        _id: order._id,
        tokenNumber: order.tokenNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        totalAmount: order.totalAmount,
        orderType: order.orderType,
        paymentMethod: order.paymentMethod,
        createdAt: order.createdAt,
      },
    });
  } catch (err: any) {
    console.error('Checkout error:', err);
    res.status(500).json({ success: false, message: 'Server error during checkout.' });
  }
});

// ─────────────────────────────────────────────
// GET /api/orders  — Get authenticated user's order history
// ─────────────────────────────────────────────
router.get('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 }).populate('assignedTo', 'name phone').populate('reservation');
    res.json(orders);
  } catch (err: any) {
    console.error('Fetch orders error:', err);
    res.status(500).json({ success: false, message: 'Server error while fetching orders.' });
  }
});

// ─────────────────────────────────────────────
// GET /api/orders/:id  — Get a single order by ID
// ─────────────────────────────────────────────
router.get('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const order = await Order.findOne({ _id: req.params.id, user: userId }).populate('assignedTo', 'name phone').populate('reservation');
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }
    res.json(order);
  } catch (err: any) {
    console.error('Fetch order error:', err);
    res.status(500).json({ success: false, message: 'Server error while fetching order.' });
  }
});

// ─────────────────────────────────────────────
// ADMIN ENDPOINTS
// ─────────────────────────────────────────────

// GET /api/orders/admin/all — Get all orders (admin only)
router.get('/admin/all', requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, paymentMethod, orderType, date } = req.query;
    const filter: any = {};
    if (status) filter.status = status;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (orderType) filter.orderType = orderType;
    if (date) {
      const startOfDay = new Date(date as string);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date as string);
      endOfDay.setHours(23, 59, 59, 999);
      filter.createdAt = { $gte: startOfDay, $lte: endOfDay };
    }
    const orders = await Order.find(filter)
      .populate('user', 'name email phone')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err: any) {
    console.error('Admin fetch orders error:', err);
    res.status(500).json({ success: false, message: 'Server error while fetching orders.' });
  }
});

// POST /api/orders/admin/create — Admin manually creates a POS order
router.post('/admin/create', requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const adminId = req.user?.userId;
    const { items, paymentMethod, tableNumber, specialInstructions, discountAmount } = req.body;

    if (!items || items.length === 0) {
      res.status(400).json({ success: false, message: 'Items are required.' });
      return;
    }

    const settings = await getOrCreateSettings();

    // Validate items and calculate subtotal
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItemId);
      if (menuItem) {
        orderItems.push({
          menuItem: menuItem._id,
          name: menuItem.name,
          price: menuItem.price,
          quantity: item.quantity,
          image: menuItem.image || '',
        });
        subtotal += menuItem.price * item.quantity;
      }
    }

    if (orderItems.length === 0) {
      res.status(400).json({ success: false, message: 'No valid items found.' });
      return;
    }

    const taxAmount = Math.round(subtotal * (settings.taxRate / 100));
    const deliveryFee = 0; // POS dine-in has no delivery fee
    const finalDiscount = discountAmount ? Number(discountAmount) : 0;
    
    const totalAmount = subtotal + taxAmount + deliveryFee - finalDiscount;

    // For POS orders, we can mark them as paid and delivered immediately if paid by cash/online
    const paymentStatus = 'paid';
    const status = 'delivered';

    let orderUserId = adminId;
    let linkedReservationId = null;

    if (tableNumber) {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      // Find active reservation for this table today
      const activeReservation = await Reservation.findOne({
        tableNumber: Number(tableNumber),
        date: { $gte: startOfDay, $lte: endOfDay },
        status: { $in: ['pending', 'confirmed'] }
      }).sort({ timeSlot: 1 });

      if (activeReservation) {
        orderUserId = activeReservation.user.toString();
        linkedReservationId = activeReservation._id;
        
        activeReservation.status = 'completed';
        await activeReservation.save();
      }
    }

    const order = await createOrderWithUniqueToken({
      user: orderUserId,
      reservation: linkedReservationId,
      items: orderItems,
      totalAmount,
      taxAmount,
      deliveryFee,
      discountAmount: finalDiscount,
      orderType: 'dine_in',
      tableNumber: tableNumber || null,
      paymentMethod,
      paymentStatus,
      status,
      deliveryAddress: 'Dine In POS',
      specialInstructions: specialInstructions || '',
      statusHistory: [
        { status: 'pending', changedBy: adminId },
        { status: 'delivered', changedBy: adminId, note: 'POS Order Auto Completed' }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'POS Order created successfully!',
      order
    });
  } catch (err: any) {
    console.error('POS Checkout error:', err);
    res.status(500).json({ success: false, message: 'Server error during POS checkout.' });
  }
});

// PATCH /api/orders/admin/:id/accept — Admin accepts pending order
router.patch('/admin/:id/accept', requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }
    if (order.status !== 'pending') {
      res.status(400).json({ success: false, message: 'Only pending orders can be accepted.' });
      return;
    }

    order.status = 'confirmed';
    order.statusHistory.push({
      status: 'confirmed',
      changedBy: new mongoose.Types.ObjectId(req.user!.userId),
      changedAt: new Date()
    });

    await order.save();
    res.json({ success: true, order });
  } catch (err: any) {
    console.error('Accept order error:', err);
    res.status(500).json({ success: false, message: 'Server error while accepting order.' });
  }
});

// PATCH /api/orders/admin/:id/cancel — Admin cancels order
router.patch('/admin/:id/cancel', requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { reason } = req.body;
    if (!reason) {
      res.status(400).json({ success: false, message: 'Cancellation reason is required.' });
      return;
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }

    order.status = 'cancelled';
    order.cancellationReason = reason;
    order.statusHistory.push({
      status: 'cancelled',
      changedBy: new mongoose.Types.ObjectId(req.user!.userId),
      changedAt: new Date(),
      note: reason
    });

    await order.save();
    res.json({ success: true, order });
  } catch (err: any) {
    console.error('Cancel order error:', err);
    res.status(500).json({ success: false, message: 'Server error while cancelling order.' });
  }
});
 
// PATCH /api/orders/admin/:id/verify-payment — Admin verifies online payment
router.patch('/admin/:id/verify-payment', requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { action } = req.body;
    if (!['approve', 'reject'].includes(action)) {
      res.status(400).json({ success: false, message: 'Invalid action. Use approve or reject.' });
      return;
    }
 
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }
 
    if (order.paymentStatus !== 'pending_verification') {
      res.status(400).json({ success: false, message: 'Order is not in pending_verification state.' });
      return;
    }
 
    if (action === 'approve') {
      order.paymentStatus = 'paid';
      order.statusHistory.push({
        status: order.status,
        changedBy: new mongoose.Types.ObjectId(req.user!.userId),
        changedAt: new Date(),
        note: 'Payment verified by Admin'
      });
    } else {
      order.paymentStatus = 'failed';
      order.status = 'cancelled';
      order.cancellationReason = 'Payment verification failed';
      order.statusHistory.push({
        status: 'cancelled',
        changedBy: new mongoose.Types.ObjectId(req.user!.userId),
        changedAt: new Date(),
        note: 'Payment verification failed by Admin'
      });
    }
 
    await order.save();
    res.json({ success: true, order });
  } catch (err: any) {
    console.error('Verify payment error:', err);
    res.status(500).json({ success: false, message: 'Server error while verifying payment.' });
  }
});

// ─────────────────────────────────────────────
// KITCHEN ENDPOINTS
// ─────────────────────────────────────────────

// GET /api/orders/kitchen/active
router.get('/kitchen/active', requireKitchen, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orders = await Order.find({ status: { $in: ['confirmed', 'preparing', 'ready'] } })
      .populate('user', 'name phone')
      .sort({ createdAt: 1 });
    res.json(orders);
  } catch (err: any) {
    console.error('Kitchen fetch active orders error:', err);
    res.status(500).json({ success: false, message: 'Server error while fetching kitchen orders.' });
  }
});

// PATCH /api/orders/kitchen/:id/status
router.patch('/kitchen/:id/status', requireKitchen, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    if (!['preparing', 'ready'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status update for kitchen.' });
      return;
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }

    if (status === 'preparing' && order.status !== 'confirmed') {
      res.status(400).json({ success: false, message: 'Can only start preparing confirmed orders.' });
      return;
    }
    if (status === 'ready' && order.status !== 'preparing') {
      res.status(400).json({ success: false, message: 'Can only mark preparing orders as ready.' });
      return;
    }

    order.status = status;
    order.statusHistory.push({
      status,
      changedBy: new mongoose.Types.ObjectId(req.user!.userId),
      changedAt: new Date()
    });

    if (status === 'ready') {
      // Optional: estimate 30 mins delivery time from ready
      const estimatedTime = new Date();
      estimatedTime.setMinutes(estimatedTime.getMinutes() + 30);
      order.estimatedDeliveryTime = estimatedTime;
    }

    await order.save();
    res.json({ success: true, order });
  } catch (err: any) {
    console.error('Kitchen update order status error:', err);
    res.status(500).json({ success: false, message: 'Server error while updating order.' });
  }
});

// ─────────────────────────────────────────────
// DELIVERY ENDPOINTS
// ─────────────────────────────────────────────

// GET /api/orders/delivery/active
router.get('/delivery/active', requireDelivery, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Delivery staff can see ready orders (to pick up) and orders out for delivery that are assigned to them
    const orders = await Order.find({
      $or: [
        { status: 'ready' },
        { status: 'out_for_delivery', assignedTo: req.user!.userId }
      ]
    })
      .populate('user', 'name phone')
      .sort({ createdAt: 1 });
    res.json(orders);
  } catch (err: any) {
    console.error('Delivery fetch active orders error:', err);
    res.status(500).json({ success: false, message: 'Server error while fetching delivery orders.' });
  }
});

// PATCH /api/orders/delivery/:id/pickup
router.patch('/delivery/:id/pickup', requireDelivery, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }
    if (order.status !== 'ready') {
      res.status(400).json({ success: false, message: 'Order is not ready for pickup.' });
      return;
    }

    order.status = 'out_for_delivery';
    order.assignedTo = new mongoose.Types.ObjectId(req.user!.userId);
    order.statusHistory.push({
      status: 'out_for_delivery',
      changedBy: new mongoose.Types.ObjectId(req.user!.userId),
      changedAt: new Date()
    });

    await order.save();
    res.json({ success: true, order });
  } catch (err: any) {
    console.error('Delivery pickup error:', err);
    res.status(500).json({ success: false, message: 'Server error while picking up order.' });
  }
});

// PATCH /api/orders/delivery/:id/delivered
router.patch('/delivery/:id/delivered', requireDelivery, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { paymentCollected, paymentNote } = req.body;
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }
    if (order.status !== 'out_for_delivery') {
      res.status(400).json({ success: false, message: 'Order is not out for delivery.' });
      return;
    }
    if (order.assignedTo?.toString() !== req.user!.userId) {
      res.status(403).json({ success: false, message: 'You are not assigned to this order.' });
      return;
    }

    order.status = 'delivered';
    if (order.paymentMethod === 'cod') {
      if (!paymentCollected) {
         res.status(400).json({ success: false, message: 'Payment must be collected for COD orders.' });
         return;
      }
      order.paymentStatus = 'paid';
    }

    order.statusHistory.push({
      status: 'delivered',
      changedBy: new mongoose.Types.ObjectId(req.user!.userId),
      changedAt: new Date(),
      note: paymentNote || ''
    });

    await order.save();
    res.json({ success: true, order });
  } catch (err: any) {
    console.error('Delivery complete error:', err);
    res.status(500).json({ success: false, message: 'Server error while delivering order.' });
  }
});

export default router;
