import { Router } from 'express';
import {
  createActivity,
  getActivities,
  getActivityById,
  updateActivity,
  deleteActivity,
  enrollInActivity,
  cancelEnrollment,
  getMyEnrollments,
  createActivityValidation,
  updateActivityValidation,
  searchValidation,
} from '../controllers/activityController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import rateLimit from 'express-rate-limit';
import { config } from '../config';

const router = Router();

// Rate limiter for enrollment endpoint
const enrollLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.enrollMax,
  message: 'Too many enrollment attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @swagger
 * /api/activities:
 *   post:
 *     summary: Create new activity (Faculty only)
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/',
  authenticate,
  authorize('faculty', 'admin'),
  createActivityValidation,
  validate,
  createActivity
);

/**
 * @swagger
 * /api/activities:
 *   get:
 *     summary: Get all activities with filters
 *     tags: [Activities]
 */
router.get('/', authenticate, searchValidation, validate, getActivities);

/**
 * @swagger
 * /api/activities/:id:
 *   get:
 *     summary: Get activity by ID
 *     tags: [Activities]
 */
router.get('/:id', authenticate, getActivityById);

/**
 * @swagger
 * /api/activities/:id:
 *   put:
 *     summary: Update activity (Faculty who created or Admin)
 *     tags: [Activities]
 */
router.put(
  '/:id',
  authenticate,
  authorize('faculty', 'admin'),
  updateActivityValidation,
  validate,
  updateActivity
);

/**
 * @swagger
 * /api/activities/:id:
 *   delete:
 *     summary: Delete activity (Faculty who created or Admin)
 *     tags: [Activities]
 */
router.delete(
  '/:id',
  authenticate,
  authorize('faculty', 'admin'),
  deleteActivity
);

/**
 * @swagger
 * /api/activities/:id/enroll:
 *   post:
 *     summary: Enroll in activity (Student only)
 *     tags: [Activities]
 *     description: Atomic enrollment with race condition handling
 */
router.post(
  '/:id/enroll',
  authenticate,
  authorize('student'),
  enrollLimiter,
  enrollInActivity
);

/**
 * @swagger
 * /api/activities/:id/cancel:
 *   post:
 *     summary: Cancel enrollment
 *     tags: [Activities]
 */
router.post(
  '/:id/cancel',
  authenticate,
  authorize('student'),
  cancelEnrollment
);

/**
 * @swagger
 * /api/activities/my/enrollments:
 *   get:
 *     summary: Get user's enrollments
 *     tags: [Activities]
 */
router.get('/my/enrollments', authenticate, authorize('student'), getMyEnrollments);

export default router;
