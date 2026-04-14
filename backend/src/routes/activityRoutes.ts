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
  getActivityParticipants,
  createActivityValidation,
  updateActivityValidation,
  searchValidation,
} from '../controllers/activityController';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';
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
router.get('/', optionalAuth, searchValidation, validate, getActivities);

/**
 * @swagger
 * /api/activities/my/enrollments:
 *   get:
 *     summary: Get user's enrollments
 *     tags: [Activities]
 */
router.get('/my/enrollments', authenticate, authorize('student'), getMyEnrollments);

/**
 * @swagger
 * /api/activities/:id:
 *   get:
 *     summary: Get activity by ID
 *     tags: [Activities]
 */
router.get('/:id', optionalAuth, getActivityById);

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
 * /api/activities/:id/participants:
 *   get:
 *     summary: Get all participants for activity (Faculty or Admin only)
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [enrolled, waitlisted, cancelled]
 *           default: enrolled
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Returns activity details and paginated list of participants
 *       403:
 *         description: Not authorized to view participants
 *       404:
 *         description: Activity not found
 */
router.get(
  '/:id/participants',
  authenticate,
  authorize('faculty', 'admin'),
  getActivityParticipants
);

export default router;
