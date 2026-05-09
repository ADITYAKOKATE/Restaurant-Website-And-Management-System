import { Router, Response } from 'express';
import { requireAdmin, AuthRequest } from '../middleware/authMiddleware';
import Order from '../models/Order';

const router = Router();

// GET /api/billing/stats - Get financial stats for admin dashboard
router.get('/stats', requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;
    
    const filter: any = { status: 'delivered' }; // Only count completed orders for revenue
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }

    // Aggregate stats
    const stats = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
          totalTax: { $sum: "$taxAmount" },
          totalDeliveryFees: { $sum: "$deliveryFee" },
          totalDiscounts: { $sum: "$discountAmount" }
        }
      }
    ]);

    // Revenue by Day (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const revenueByDay = await Order.aggregate([
      { 
        $match: { 
          status: 'delivered',
          createdAt: { $gte: thirtyDaysAgo }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // Payment Method split
    const paymentSplit = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$paymentMethod",
          value: { $sum: "$totalAmount" },
          count: { $sum: 1 }
        }
      }
    ]);

    // Order Type split
    const typeSplit = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$orderType",
          value: { $sum: "$totalAmount" },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      summary: stats[0] || { totalRevenue: 0, totalOrders: 0, totalTax: 0, totalDeliveryFees: 0, totalDiscounts: 0 },
      revenueByDay,
      paymentSplit,
      typeSplit
    });
  } catch (err: any) {
    console.error('Fetch billing stats error:', err);
    res.status(500).json({ success: false, message: 'Server error while fetching billing stats.' });
  }
});

export default router;
