"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongoose_1 = __importDefault(require("mongoose"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const Order_1 = __importDefault(require("../models/Order"));
const Cart_1 = __importDefault(require("../models/Cart"));
const router = (0, express_1.Router)();
/** Generates a unique sequential token number */
async function generateTokenNumber() {
    // Use a globally increasing token because tokenNumber has a global unique index.
    const lastOrder = await Order_1.default.findOne({}, { tokenNumber: 1 }, { sort: { tokenNumber: -1 } });
    return lastOrder ? lastOrder.tokenNumber + 1 : 101;
}
async function createOrderWithUniqueToken(orderData) {
    const maxAttempts = 5;
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        try {
            const tokenNumber = await generateTokenNumber();
            return await Order_1.default.create({
                ...orderData,
                tokenNumber,
            });
        }
        catch (error) {
            const isDuplicateToken = error instanceof mongoose_1.default.Error &&
                'code' in error &&
                error.code === 11000 &&
                error.keyPattern?.tokenNumber;
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
router.post('/', authMiddleware_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { orderType, paymentMethod, deliveryAddress, phone, specialInstructions } = req.body;
        if (!orderType || !paymentMethod) {
            res.status(400).json({ success: false, message: 'orderType and paymentMethod are required.' });
            return;
        }
        if (orderType === 'delivery' && !deliveryAddress) {
            res.status(400).json({ success: false, message: 'Delivery address is required for delivery orders.' });
            return;
        }
        // Fetch the user's cart with populated items
        const cart = await Cart_1.default.findOne({ user: userId }).populate('items.menuItem');
        if (!cart || cart.items.length === 0) {
            res.status(400).json({ success: false, message: 'Your cart is empty.' });
            return;
        }
        // Filter out any nulled menu items (deleted products)
        const validItems = cart.items.filter((item) => item.menuItem != null);
        if (validItems.length === 0) {
            res.status(400).json({ success: false, message: 'No valid items in cart.' });
            return;
        }
        // Calculate totals
        const subtotal = validItems.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
        const taxAmount = Math.round(subtotal * 0.05);
        const deliveryFee = orderType === 'delivery' ? 40 : 0;
        const totalAmount = subtotal + taxAmount + deliveryFee;
        // Determine payment & order status based on payment method
        const paymentStatus = paymentMethod === 'online' ? 'paid' : 'pending';
        const status = paymentMethod === 'online' ? 'confirmed' : 'pending';
        // Build order items array (snapshot of prices at time of ordering)
        const orderItems = validItems.map((item) => ({
            menuItem: item.menuItem._id,
            name: item.menuItem.name,
            price: item.menuItem.price,
            quantity: item.quantity,
            image: item.menuItem.image || '',
        }));
        // Create the order with retry in case of token collision under concurrent checkouts.
        const order = await createOrderWithUniqueToken({
            user: userId,
            items: orderItems,
            totalAmount,
            taxAmount,
            deliveryFee,
            orderType,
            paymentMethod,
            paymentStatus,
            status,
            deliveryAddress: deliveryAddress || '',
            phone: phone || '',
            specialInstructions: specialInstructions || '',
        });
        // Clear the user's cart
        cart.items = [];
        await cart.save();
        res.status(201).json({
            success: true,
            message: paymentMethod === 'online'
                ? 'Payment successful! Your order has been confirmed.'
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
    }
    catch (err) {
        console.error('Checkout error:', err);
        res.status(500).json({ success: false, message: 'Server error during checkout.' });
    }
});
// ─────────────────────────────────────────────
// GET /api/orders  — Get authenticated user's order history
// ─────────────────────────────────────────────
router.get('/', authMiddleware_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const orders = await Order_1.default.find({ user: userId }).sort({ createdAt: -1 });
        res.json(orders);
    }
    catch (err) {
        console.error('Fetch orders error:', err);
        res.status(500).json({ success: false, message: 'Server error while fetching orders.' });
    }
});
// ─────────────────────────────────────────────
// GET /api/orders/:id  — Get a single order by ID
// ─────────────────────────────────────────────
router.get('/:id', authMiddleware_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user?.userId;
        const order = await Order_1.default.findOne({ _id: req.params.id, user: userId });
        if (!order) {
            res.status(404).json({ success: false, message: 'Order not found.' });
            return;
        }
        res.json(order);
    }
    catch (err) {
        console.error('Fetch order error:', err);
        res.status(500).json({ success: false, message: 'Server error while fetching order.' });
    }
});
// ─────────────────────────────────────────────
// ADMIN ENDPOINTS — For future admin panel team
// ─────────────────────────────────────────────
// GET /api/orders/admin/all — Get all orders (admin only)
router.get('/admin/all', authMiddleware_1.requireAuth, async (req, res) => {
    try {
        if (req.user?.role !== 'admin') {
            res.status(403).json({ success: false, message: 'Admin access required.' });
            return;
        }
        const { status, paymentMethod, orderType, date } = req.query;
        const filter = {};
        if (status)
            filter.status = status;
        if (paymentMethod)
            filter.paymentMethod = paymentMethod;
        if (orderType)
            filter.orderType = orderType;
        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            filter.createdAt = { $gte: startOfDay, $lte: endOfDay };
        }
        const orders = await Order_1.default.find(filter)
            .populate('user', 'name email phone')
            .sort({ createdAt: -1 });
        res.json(orders);
    }
    catch (err) {
        console.error('Admin fetch orders error:', err);
        res.status(500).json({ success: false, message: 'Server error while fetching orders.' });
    }
});
// PATCH /api/orders/admin/:id/status — Update order status (admin only)
router.patch('/admin/:id/status', authMiddleware_1.requireAuth, async (req, res) => {
    try {
        if (req.user?.role !== 'admin') {
            res.status(403).json({ success: false, message: 'Admin access required.' });
            return;
        }
        const { status, paymentStatus } = req.body;
        const updateData = {};
        if (status)
            updateData.status = status;
        if (paymentStatus)
            updateData.paymentStatus = paymentStatus;
        const order = await Order_1.default.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate('user', 'name email');
        if (!order) {
            res.status(404).json({ success: false, message: 'Order not found.' });
            return;
        }
        res.json({ success: true, order });
    }
    catch (err) {
        console.error('Update order status error:', err);
        res.status(500).json({ success: false, message: 'Server error while updating order.' });
    }
});
exports.default = router;
