import { Router, Response, Request } from 'express';
import { fetchGoogleReviews } from '../lib/googleReviews';

const router = Router();

// GET /api/reviews/google - Fetch reviews from Google (or fallback to mock)
router.get('/google', async (req: Request, res: Response): Promise<void> => {
  try {
    const reviews = await fetchGoogleReviews();
    res.json(reviews);
  } catch (err: any) {
    console.error('Fetch reviews route error:', err);
    res.status(500).json({ success: false, message: 'Server error while fetching reviews.' });
  }
});

export default router;
