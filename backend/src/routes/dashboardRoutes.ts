import { Router } from 'express';
import {
  getFacultyDashboard,
  getStudentDashboard,
  getAdminDashboard,
  exportParticipants,
  getActivityAnalytics,
  getAllUsers,
  getAllActivitiesAdmin,
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

/**
 * @swagger
 * /api/dashboard/admin/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Admin]
 */
router.get(
  '/admin/users',
  authenticate,
  authorize('admin'),
  getAllUsers
);

/**
 * @swagger
 * /api/dashboard/admin/activities:
 *   get:
 *     summary: Get all activities across faculty (Admin only)
 *     tags: [Admin]
 */
router.get(
  '/admin/activities',
  authenticate,
  authorize('admin'),
  getAllActivitiesAdmin
);

export default router;
