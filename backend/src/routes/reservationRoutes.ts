import { Router, Response } from 'express';
import mongoose from 'mongoose';
import { requireAuth, requireAdmin, AuthRequest } from '../middleware/authMiddleware';
import Reservation from '../models/Reservation';
import { getOrCreateSettings } from '../models/Settings';

const router = Router();

// POST /api/reservations - Create a reservation
router.post('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { tableNumber, date, timeSlot, numberOfGuests, specialRequests } = req.body;

    if (!tableNumber || !date || !timeSlot || !numberOfGuests) {
      res.status(400).json({ success: false, message: 'All fields are required.' });
      return;
    }

    const settings = await getOrCreateSettings();
    if (tableNumber > settings.tableCount) {
      res.status(400).json({ success: false, message: `Invalid table number. We only have ${settings.tableCount} tables.` });
      return;
    }

    // Check if table is already booked for this date and time
    const reservationDate = new Date(date);
    reservationDate.setHours(0, 0, 0, 0);

    const existing = await Reservation.findOne({
      tableNumber,
      date: reservationDate,
      timeSlot,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existing) {
      res.status(400).json({ success: false, message: 'Table is already booked for this time slot.' });
      return;
    }

    const reservation = await Reservation.create({
      user: userId,
      tableNumber,
      date: reservationDate,
      timeSlot,
      numberOfGuests,
      specialRequests: specialRequests || '',
      status: 'pending'
    });

    res.status(201).json({ success: true, message: 'Reservation requested successfully!', reservation });
  } catch (err: any) {
    console.error('Create reservation error:', err);
    res.status(500).json({ success: false, message: 'Server error while creating reservation.' });
  }
});

// GET /api/reservations/me - Get current user's reservations
router.get('/me', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const reservations = await Reservation.find({ user: userId }).sort({ date: -1 });
    res.json(reservations);
  } catch (err: any) {
    console.error('Fetch my reservations error:', err);
    res.status(500).json({ success: false, message: 'Server error while fetching reservations.' });
  }
});

// GET /api/reservations/admin/all - Get all reservations (admin only)
router.get('/admin/all', requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { date, status } = req.query;
    const filter: any = {};
    if (date) {
      const startOfDay = new Date(date as string);
      startOfDay.setHours(0, 0, 0, 0);
      filter.date = startOfDay;
    }
    if (status) filter.status = status;

    const reservations = await Reservation.find(filter)
      .populate('user', 'name email phone')
      .sort({ date: 1, timeSlot: 1 });
    res.json(reservations);
  } catch (err: any) {
    console.error('Admin fetch reservations error:', err);
    res.status(500).json({ success: false, message: 'Server error while fetching reservations.' });
  }
});

// PATCH /api/reservations/admin/:id/status - Update reservation status (admin only)
router.patch('/admin/:id/status', requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status.' });
      return;
    }

    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      res.status(404).json({ success: false, message: 'Reservation not found.' });
      return;
    }

    reservation.status = status;
    await reservation.save();

    res.json({ success: true, reservation });
  } catch (err: any) {
    console.error('Update reservation status error:', err);
    res.status(500).json({ success: false, message: 'Server error while updating reservation.' });
  }
});

// GET /api/reservations/availability - Check availability for a date
router.get('/availability', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { date } = req.query;
    if (!date) {
      res.status(400).json({ success: false, message: 'Date is required.' });
      return;
    }

    const checkDate = new Date(date as string);
    checkDate.setHours(0, 0, 0, 0);

    const booked = await Reservation.find({
      date: checkDate,
      status: { $in: ['pending', 'confirmed'] }
    }).select('tableNumber timeSlot');

    res.json(booked);
  } catch (err: any) {
    console.error('Check availability error:', err);
    res.status(500).json({ success: false, message: 'Server error while checking availability.' });
  }
});

export default router;
