import { Router } from 'express';
import {
  getFacultyDashboard,
  getStudentDashboard,
  getAdminDashboard,
  exportParticipants,
  getActivityAnalytics,
} from '../controllers/dashboardController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * /api/dashboard/faculty:
 *   get:
 *     summary: Get faculty dashboard
 *     tags: [Dashboard]
 */
router.get(
  '/faculty',
  authenticate,
  authorize('faculty', 'admin'),
  getFacultyDashboard
);

/**
 * @swagger
 * /api/dashboard/student:
 *   get:
 *     summary: Get student dashboard
 *     tags: [Dashboard]
 */
router.get(
  '/student',
  authenticate,
  authorize('student'),
  getStudentDashboard
);

/**
 * @swagger
 * /api/dashboard/admin:
 *   get:
 *     summary: Get admin dashboard
 *     tags: [Dashboard]
 */
router.get('/admin', authenticate, authorize('admin'), getAdminDashboard);

/**
 * @swagger
 * /api/dashboard/export/:id:
 *   get:
 *     summary: Export activity participants as CSV
 *     tags: [Dashboard]
 */
router.get(
  '/export/:id',
  authenticate,
  authorize('faculty', 'admin'),
  exportParticipants
);

/**
 * @swagger
 * /api/dashboard/analytics/:id:
 *   get:
 *     summary: Get activity analytics
 *     tags: [Dashboard]
 */
router.get(
  '/analytics/:id',
  authenticate,
  authorize('faculty', 'admin'),
  getActivityAnalytics
);

export default router;
