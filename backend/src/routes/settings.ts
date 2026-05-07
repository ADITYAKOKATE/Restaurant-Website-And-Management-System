import { Router, Request, Response } from 'express';
import { requireAdmin } from '../middleware/authMiddleware';
import { getOrCreateSettings } from '../models/Settings';

const router = Router();

// @route   GET /api/settings
// @desc    Get store settings
// @access  Public (so frontend can check store status before ordering)
router.get('/', async (req: Request, res: Response) => {
  try {
    const settings = await getOrCreateSettings();
    res.json({ success: true, settings });
  } catch (err: any) {
    console.error('Settings fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// @route   PUT /api/settings
// @desc    Update store settings
// @access  Private/Admin
router.put('/', requireAdmin, async (req: Request, res: Response) => {
  try {
    const {
      storeOpen,
      deliveryCharge,
      minimumOrder,
      taxRate,
      onlinePaymentsEnabled,
      estimatedPrepTime,
    } = req.body;

    const settings = await getOrCreateSettings();

    // Update only provided fields
    if (storeOpen !== undefined) settings.storeOpen = Boolean(storeOpen);
    if (deliveryCharge !== undefined) settings.deliveryCharge = Number(deliveryCharge);
    if (minimumOrder !== undefined) settings.minimumOrder = Number(minimumOrder);
    if (taxRate !== undefined) settings.taxRate = Number(taxRate);
    if (onlinePaymentsEnabled !== undefined) settings.onlinePaymentsEnabled = Boolean(onlinePaymentsEnabled);
    if (estimatedPrepTime !== undefined) settings.estimatedPrepTime = Number(estimatedPrepTime);

    await settings.save();

    res.json({ success: true, settings });
  } catch (err: any) {
    console.error('Settings update error:', err);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;
