import express from 'express';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware';
import Offer from '../models/Offer';

const router = express.Router();

// GET active offers (Public/User)
router.get('/', async (req, res) => {
  try {
    const offers = await Offer.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(offers);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// GET all offers (Admin only)
router.get('/all', requireAuth, requireAdmin, async (req, res) => {
  try {
    const offers = await Offer.find().sort({ createdAt: -1 });
    res.json(offers);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// POST create offer (Admin only)
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const offer = new Offer(req.body);
    const saved = await offer.save();
    res.status(201).json(saved);
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT update offer (Admin only)
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });
    res.json(offer);
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE offer (Admin only)
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);
    if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });
    res.json({ success: true, message: 'Offer deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// POST validate promo code
router.post('/validate', requireAuth, async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Code required' });

    const offer = await Offer.findOne({ discountCode: code.toUpperCase(), isActive: true });
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Invalid or expired promo code' });
    }

    if (offer.minimumOrderValue > 0 && cartTotal < offer.minimumOrderValue) {
      return res.status(400).json({ 
        success: false, 
        message: `Minimum order value for this code is ₹${offer.minimumOrderValue}` 
      });
    }

    let discountAmount = 0;
    if (offer.discountType === 'percentage') {
      discountAmount = Math.round(cartTotal * (offer.discountValue / 100));
    } else {
      discountAmount = offer.discountValue;
    }

    // Don't discount more than cart total
    discountAmount = Math.min(discountAmount, cartTotal);

    res.json({
      success: true,
      offerId: offer._id,
      title: offer.title,
      discountAmount,
      code: offer.discountCode
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

export default router;
