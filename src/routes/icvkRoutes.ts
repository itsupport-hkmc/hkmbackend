import express from 'express';
import { createRegistration, getRegistrations } from '../controllers/icvkController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Accept JSON only - no file uploads
router.post('/register', createRegistration);

router.get('/registrations', protect, getRegistrations);

export default router;
