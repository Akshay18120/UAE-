import { Router } from 'express';
import authRoutes from './auth.routes';
import { errorHandler } from '../../../shared/errors';

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', version: 'v1' });
});

// API Routes
router.use('/auth', authRoutes);

// Add more routes here...

// Error handling middleware (must be last)
router.use(errorHandler);

export default router;
