import { Router, Response } from 'express';
import mongoose from 'mongoose';
import { requireAdmin, AuthRequest } from '../middleware/authMiddleware';
import Order from '../models/Order';
import MenuItem from '../models/MenuItem';
import Reservation from '../models/Reservation';
import { getOrCreateSettings } from '../models/Settings';

const router = Router();

// ─── Zone Configuration ───────────────────────────────────────────────────────
// T1–T18 = INSIDE, T19–T27 = OUTSIDE, 101–105 = PARCEL (P1–P5)
const INSIDE_TABLES = Array.from({ length: 18 }, (_, i) => i + 1);
const OUTSIDE_TABLES = Array.from({ length: 9 }, (_, i) => i + 19);
const PARCEL_SLOTS = Array.from({ length: 5 }, (_, i) => i + 101);
const ALL_TABLE_NUMBERS = [...INSIDE_TABLES, ...OUTSIDE_TABLES, ...PARCEL_SLOTS];

function getZone(tableNumber: number): 'INSIDE' | 'OUTSIDE' | 'PARCEL' {
  if (tableNumber >= 101) return 'PARCEL';
  if (tableNumber >= 19) return 'OUTSIDE';
  return 'INSIDE';
}

function getLabel(tableNumber: number): string {
  if (tableNumber >= 101) return `P${tableNumber - 100}`;
  return `T${tableNumber}`;
}

async function generateTokenNumber(): Promise<number> {
  const lastOrder = await Order.findOne({}, { tokenNumber: 1 }, { sort: { tokenNumber: -1 } });
  return lastOrder ? lastOrder.tokenNumber + 1 : 101;
}

// ─── GET /api/billing/tables ─────────────────────────────────────────────────
// Returns live table status for the entire floor (INSIDE + OUTSIDE + PARCEL)
router.get('/tables', requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const activeOrders = await Order.find({
      status: { $nin: ['delivered', 'cancelled'] },
      tableNumber: { $in: ALL_TABLE_NUMBERS },
    })
      .select('tableNumber status paymentStatus isBillPrinted isKotPrinted totalAmount items createdAt orderType')
      .populate('user', 'name')
      .populate('reservation');

    const orderByTable = new Map<number, any>();
    for (const order of activeOrders) {
      if (order.tableNumber != null) orderByTable.set(order.tableNumber, order);
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const activeReservations = await Reservation.find({
      date: { $gte: startOfDay, $lte: endOfDay },
      status: 'confirmed'
    }).populate('user', 'name');

    const reservationByTable = new Map<number, any>();
    for (const res of activeReservations) {
      reservationByTable.set(res.tableNumber, res);
    }

    const tables = ALL_TABLE_NUMBERS.map((tableNum) => {
      const order = orderByTable.get(tableNum);
      const reservation = reservationByTable.get(tableNum);
      const zone = getZone(tableNum);
      const label = getLabel(tableNum);

      if (!order) {
        if (reservation) {
          return {
            tableNumber: tableNum,
            label,
            zone,
            status: 'reserved',
            reservedFor: {
              guestName: (reservation.user as any)?.name || 'Guest',
              guests: reservation.numberOfGuests,
              timeSlot: reservation.timeSlot
            }
          };
        }
        return { tableNumber: tableNum, label, zone, status: 'blank' };
      }

      const minutesElapsed = Math.floor(
        (Date.now() - new Date(order.createdAt).getTime()) / 60000
      );

      let status: 'blank' | 'running' | 'kot' | 'printed' | 'paid' | 'reserved';
      if (order.paymentStatus === 'paid') status = 'paid';
      else if ((order as any).isBillPrinted) status = 'printed';
      else if ((order as any).isKotPrinted) status = 'kot';
      else status = 'running';

      return {
        tableNumber: tableNum,
        label,
        zone,
        status,
        orderId: order._id,
        totalAmount: order.totalAmount,
        itemCount: order.items.length,
        minutesElapsed,
        orderCategory: order.orderType === 'delivery' ? 'delivery' : 'pos',
        customerName: (order.user as any)?.name,
        reservedFor: order.reservation ? {
          guestName: (order.reservation.user as any)?.name || (order.user as any)?.name || 'Guest',
          guests: order.reservation.numberOfGuests,
          timeSlot: order.reservation.timeSlot
        } : undefined
      };
    });

    res.json(tables);
  } catch (err: any) {
    console.error('Fetch tables error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching table status.' });
  }
});

// ─── GET /api/billing/table/:tableNumber/order ────────────────────────────────
router.get('/table/:tableNumber/order', requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tableNumber = parseInt(req.params.tableNumber as string, 10);
    const order = await Order.findOne({
      tableNumber,
      status: { $nin: ['delivered', 'cancelled'] },
    }).populate('user', 'name email phone');

    res.json({ order: order || null });
  } catch (err: any) {
    console.error('Fetch table order error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching table order.' });
  }
});

// ─── POST /api/billing/pos/order ─────────────────────────────────────────────
// Creates a brand-new POS order for a table
router.post('/pos/order', requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const adminId = req.user?.userId;
    const { tableNumber, items, paymentMethod, discountAmount, specialInstructions } = req.body;

    if (!tableNumber) {
      res.status(400).json({ success: false, message: 'Table number is required.' });
      return;
    }
    if (!items || items.length === 0) {
      res.status(400).json({ success: false, message: 'At least one item is required.' });
      return;
    }

    const existing = await Order.findOne({
      tableNumber,
      status: { $nin: ['delivered', 'cancelled'] },
    });
    if (existing) {
      res.status(400).json({ success: false, message: 'Table already has an active order.' });
      return;
    }

    const settings = await getOrCreateSettings();
    const orderItems: any[] = [];
    let subtotal = 0;

    for (const item of items) {
      if (item.isCustom) {
        // Custom non-listed item — use name and price directly
        if (!item.name || item.price == null) continue;
        orderItems.push({
          menuItem: null,
          name: item.name,
          price: Number(item.price),
          quantity: item.quantity,
          image: '',
        });
        subtotal += Number(item.price) * item.quantity;
      } else {
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
    }

    if (orderItems.length === 0) {
      res.status(400).json({ success: false, message: 'No valid menu items found.' });
      return;
    }

    const taxAmount = Math.round(subtotal * (settings.taxRate / 100));
    const finalDiscount = Number(discountAmount) || 0;
    const totalAmount = subtotal + taxAmount - finalDiscount;
    const tokenNumber = await generateTokenNumber();
    const zone = getZone(tableNumber);
    const isParcel = zone === 'PARCEL';

    let reservationId = null;
    if (!isParcel) {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      const activeReservation = await Reservation.findOne({
        tableNumber,
        date: { $gte: startOfDay, $lte: endOfDay },
        status: 'confirmed'
      });
      if (activeReservation) {
        reservationId = activeReservation._id;
      }
    }

    const order = await Order.create({
      user: adminId,
      items: orderItems,
      totalAmount,
      taxAmount,
      deliveryFee: 0,
      discountAmount: finalDiscount,
      orderType: isParcel ? 'delivery' : 'dine_in',
      tableNumber,
      reservation: reservationId,
      paymentMethod: paymentMethod || 'cod',
      paymentStatus: 'pending',
      status: 'confirmed',
      deliveryAddress: isParcel ? 'Parcel / Pickup' : 'Dine In POS',
      specialInstructions: specialInstructions || '',
      tokenNumber,
      statusHistory: [
        { status: 'pending', changedBy: adminId },
        { status: 'confirmed', changedBy: adminId, note: 'POS Order Created' },
      ],
    });

    res.status(201).json({ success: true, order });
  } catch (err: any) {
    console.error('POS create order error:', err);
    res.status(500).json({ success: false, message: 'Server error creating POS order.' });
  }
});

// ─── PATCH /api/billing/pos/order/:orderId/add-items ─────────────────────────
router.patch('/pos/order/:orderId/add-items', requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { items, discountAmount } = req.body;
    const order = await Order.findById(req.params.orderId);
    if (!order) { res.status(404).json({ success: false, message: 'Order not found.' }); return; }
    if (['delivered', 'cancelled'].includes(order.status)) {
      res.status(400).json({ success: false, message: 'Cannot modify a closed order.' });
      return;
    }

    const settings = await getOrCreateSettings();

    for (const item of items) {
      if (item.isCustom) {
        // Custom non-listed item
        if (!item.name || item.price == null) continue;
        const existing = order.items.find(
          (i: any) => !i.menuItem && i.name === item.name
        );
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          order.items.push({
            menuItem: null,
            name: item.name,
            price: Number(item.price),
            quantity: item.quantity,
            image: '',
          } as any);
        }
      } else {
        const menuItem = await MenuItem.findById(item.menuItemId);
        if (!menuItem) continue;
        const existing = order.items.find(
          (i: any) => i.menuItem && i.menuItem.toString() === menuItem._id.toString()
        );
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          order.items.push({
            menuItem: menuItem._id,
            name: menuItem.name,
            price: menuItem.price,
            quantity: item.quantity,
            image: menuItem.image || '',
          } as any);
        }
      }
    }

    const subtotal = order.items.reduce((s: number, i: any) => s + i.price * i.quantity, 0);
    order.taxAmount = Math.round(subtotal * (settings.taxRate / 100));
    order.discountAmount = discountAmount !== undefined ? Number(discountAmount) : order.discountAmount;
    order.totalAmount = subtotal + order.taxAmount - order.discountAmount;

    await order.save();
    res.json({ success: true, order });
  } catch (err: any) {
    console.error('Add items error:', err);
    res.status(500).json({ success: false, message: 'Server error adding items.' });
  }
});

// ─── PATCH /api/billing/pos/order/:orderId/remove-item ───────────────────────
router.patch('/pos/order/:orderId/remove-item', requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { menuItemId, customItemName, delta } = req.body; // delta = quantity change (+/-)
    const order = await Order.findById(req.params.orderId);
    if (!order) { res.status(404).json({ success: false, message: 'Order not found.' }); return; }

    const settings = await getOrCreateSettings();

    // For custom items: match by name (no menuItem). For catalog items: match by menuItem id.
    const itemIndex = customItemName
      ? order.items.findIndex((i: any) => !i.menuItem && i.name === customItemName)
      : order.items.findIndex((i: any) => i.menuItem && i.menuItem.toString() === menuItemId);

    if (itemIndex >= 0) {
      const newQty = order.items[itemIndex].quantity + delta;
      if (newQty <= 0) {
        order.items.splice(itemIndex, 1);
      } else {
        order.items[itemIndex].quantity = newQty;
      }
    }

    const subtotal = order.items.reduce((s: number, i: any) => s + i.price * i.quantity, 0);
    order.taxAmount = Math.round(subtotal * (settings.taxRate / 100));
    order.totalAmount = subtotal + order.taxAmount - order.discountAmount;
    await order.save();
    res.json({ success: true, order });
  } catch (err: any) {
    console.error('Remove item error:', err);
    res.status(500).json({ success: false, message: 'Server error removing item.' });
  }
});

// ─── PATCH /api/billing/pos/order/:orderId/discount ──────────────────────────
router.patch('/pos/order/:orderId/discount', requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { discountAmount } = req.body;
    const order = await Order.findById(req.params.orderId);
    if (!order) { res.status(404).json({ success: false, message: 'Order not found.' }); return; }

    const subtotal = order.items.reduce((s: number, i: any) => s + i.price * i.quantity, 0);
    order.discountAmount = Number(discountAmount) || 0;
    order.totalAmount = subtotal + order.taxAmount - order.discountAmount;
    await order.save();
    res.json({ success: true, order });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Server error updating discount.' });
  }
});

// ─── PATCH /api/billing/pos/order/:orderId/kot ───────────────────────────────
router.patch('/pos/order/:orderId/kot', requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) { res.status(404).json({ success: false, message: 'Order not found.' }); return; }
    (order as any).isKotPrinted = true;
    await order.save();
    res.json({ success: true, order });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Server error marking KOT.' });
  }
});

// ─── PATCH /api/billing/pos/order/:orderId/bill-printed ──────────────────────
router.patch('/pos/order/:orderId/bill-printed', requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) { res.status(404).json({ success: false, message: 'Order not found.' }); return; }
    (order as any).isBillPrinted = true;
    await order.save();
    res.json({ success: true, order });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Server error marking bill printed.' });
  }
});

// ─── PATCH /api/billing/pos/order/:id/payment ──────────────────────────────
router.patch('/pos/order/:id/payment', requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const adminId = req.user?.userId;
    const { paymentMethod } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }

    order.paymentStatus = 'paid';
    // We intentionally do NOT set status to 'delivered' here so the table stays active (green)
    // The admin will explicitly "Clean" the table to finish the flow.
    if (paymentMethod) order.paymentMethod = paymentMethod as any;
    (order as any).isBillPrinted = true;
    order.statusHistory.push({
      status: order.status,
      changedBy: new mongoose.Types.ObjectId(adminId!),
      changedAt: new Date(),
      note: `Payment received via ${paymentMethod || order.paymentMethod}`,
    });

    await order.save();
    res.json({ success: true, order });
  } catch (err: any) {
    console.error('Payment error:', err);
    res.status(500).json({ success: false, message: 'Server error processing payment.' });
  }
});

// ─── PATCH /api/billing/pos/order/:id/clean ────────────────────────────────
router.patch('/pos/order/:id/clean', requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const adminId = req.user?.userId;
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }

    order.status = 'delivered';
    order.statusHistory.push({
      status: 'delivered',
      changedBy: new mongoose.Types.ObjectId(adminId!),
      changedAt: new Date(),
      note: 'Table cleaned and order finalized.',
    });

    if (order.reservation) {
      await Reservation.findByIdAndUpdate(order.reservation, { status: 'completed' });
    }

    await order.save();
    res.json({ success: true, order });
  } catch (err: any) {
    console.error('Clean Table Error:', err);
    res.status(500).json({ success: false, message: 'Server error cleaning table.' });
  }
});

// ─── GET /api/billing/stats ───────────────────────────────────────────────────
router.get('/stats', requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;
    const filter: any = { status: 'delivered' };
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }

    const stats = await Order.aggregate([
      { $match: filter },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' }, totalOrders: { $sum: 1 }, totalTax: { $sum: '$taxAmount' }, totalDeliveryFees: { $sum: '$deliveryFee' }, totalDiscounts: { $sum: '$discountAmount' } } },
    ]);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const revenueByDay = await Order.aggregate([
      { $match: { status: 'delivered', createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$totalAmount' }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const paymentSplit = await Order.aggregate([
      { $match: filter },
      { $group: { _id: '$paymentMethod', value: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
    ]);

    const typeSplit = await Order.aggregate([
      { $match: filter },
      { $group: { _id: '$orderType', value: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
    ]);

    res.json({
      summary: stats[0] || { totalRevenue: 0, totalOrders: 0, totalTax: 0, totalDeliveryFees: 0, totalDiscounts: 0 },
      revenueByDay,
      paymentSplit,
      typeSplit,
    });
  } catch (err: any) {
    console.error('Billing stats error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching billing stats.' });
  }
});

export default router;
