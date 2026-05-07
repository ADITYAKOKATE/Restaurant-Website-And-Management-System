import { Router, Request, Response } from 'express';

const router = Router();

// In-memory settings store (replace with MongoDB collection in production)
let storeSettings = {
  storeOpen: true,
  deliveryCharge: 50,
  minimumOrder: 200,
  taxRate: 5,
  onlinePaymentsEnabled: true,
  kitchenDisplayMode: 'full' as 'full' | 'compact',
  updatedAt: new Date(),
};

// @route   GET /api/settings
// @desc    Get store settings - Admin only
// @access  Private/Admin
router.get('/', (req: Request, res: Response) => {
  try {
    res.json({ success: true, settings: storeSettings });
  } catch (err: any) {
    console.error('Settings fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// @route   PUT /api/settings
// @desc    Update store settings - Admin only
// @access  Private/Admin
router.put('/', (req: Request, res: Response) => {
  try {
    const {
      storeOpen,
      deliveryCharge,
      minimumOrder,
      taxRate,
      onlinePaymentsEnabled,
      kitchenDisplayMode,
    } = req.body;

    // Update settings (only update provided fields)
    if (storeOpen !== undefined) storeSettings.storeOpen = Boolean(storeOpen);
    if (deliveryCharge !== undefined) storeSettings.deliveryCharge = Number(deliveryCharge);
    if (minimumOrder !== undefined) storeSettings.minimumOrder = Number(minimumOrder);
    if (taxRate !== undefined) storeSettings.taxRate = Number(taxRate);
    if (onlinePaymentsEnabled !== undefined) storeSettings.onlinePaymentsEnabled = Boolean(onlinePaymentsEnabled);
    if (kitchenDisplayMode !== undefined && ['full', 'compact'].includes(kitchenDisplayMode)) {
      storeSettings.kitchenDisplayMode = kitchenDisplayMode;
    }
    storeSettings.updatedAt = new Date();

    res.json({ success: true, settings: storeSettings });
  } catch (err: any) {
    console.error('Settings update error:', err);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;
