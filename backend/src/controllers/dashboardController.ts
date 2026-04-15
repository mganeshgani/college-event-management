import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Activity } from '../models/Activity';
import { Participation } from '../models/Participation';
import { User } from '../models/User';
import { logger } from '../utils/logger';

/**
 * Faculty Dashboard - Get statistics and activities
 */
export const getFacultyDashboard = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.userId;

    // Get faculty's activities
    const activities = await Activity.find({ createdBy: userId }).sort({
      createdAt: -1,
    });

    // Get statistics
    const stats = await Promise.all([
      Activity.countDocuments({ createdBy: userId, status: 'published' }),
      Activity.countDocuments({ createdBy: userId, status: 'draft' }),
      Activity.countDocuments({ createdBy: userId, status: 'completed' }),
      Participation.countDocuments({
        activityId: { $in: activities.map((a) => a._id) },
        status: 'enrolled',
      }),
    ]);

    const [publishedCount, draftCount, completedCount, totalEnrollments] = stats;

    // Get total activities count
    const totalActivities = activities.length;

    // Get unique participants count
    const participantIds = await Participation.distinct('userId', {
      activityId: { $in: activities.map((a) => a._id) },
      status: 'enrolled',
    });
    const totalParticipants = participantIds.length;

    // Get recent enrollments
    const recentEnrollments = await Participation.find({
      activityId: { $in: activities.map((a) => a._id) },
      status: 'enrolled',
    })
      .populate('userId', 'name email department rollNumber')
      .populate('activityId', 'title')
      .sort({ enrolledAt: -1 })
      .limit(10);

    // Get upcoming activities
    const upcomingActivities = await Activity.find({
      createdBy: userId,
      status: 'published',
      startDate: { $gte: new Date() },
    })
      .sort({ startDate: 1 })
      .limit(5);

    res.json({
      totalActivities,
      publishedActivities: publishedCount,
      totalEnrollments,
      totalParticipants,
      stats: {
        published: publishedCount,
        draft: draftCount,
        completed: completedCount,
        totalEnrollments,
      },
      activities,
      recentEnrollments,
      upcomingActivities,
    });
  } catch (error) {
    logger.error('Faculty dashboard error:', error);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
};

/**
 * Student Dashboard - Get enrollments and statistics
 */
export const getStudentDashboard = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.userId;

    // Get student's enrollments
    const enrollments = await Participation.find({ userId })
      .populate('activityId')
      .sort({ enrolledAt: -1 });

    // Get statistics
    const enrolledCount = enrollments.filter((e) => e.status === 'enrolled').length;
    const waitlistedCount = enrollments.filter((e) => e.status === 'waitlisted').length;
    const cancelledCount = enrollments.filter((e) => e.status === 'cancelled').length;
    const completedCount = enrollments.filter(
      (e) =>
        e.status === 'enrolled' &&
        (e.activityId as any).status === 'completed'
    ).length;

    // Get upcoming activities
    const upcomingEnrollments = enrollments.filter((e) => {
      const activity = e.activityId as any;
      return (
        e.status === 'enrolled' &&
        activity.status === 'published' &&
        new Date(activity.startDate) >= new Date()
      );
    });
    const upcomingCount = upcomingEnrollments.length;

    // Get available activities count
    const availableCount = await Activity.countDocuments({
      status: 'published',
      startDate: { $gte: new Date() },
      availableSlots: { $gt: 0 },
    });

    // Get recommended activities (based on department and past enrollments)
    const user = await User.findById(userId);
    const recommendedActivities = await Activity.find({
      status: 'published',
      startDate: { $gte: new Date() },
      availableSlots: { $gt: 0 },
      ...(user?.department && { department: user.department }),
    })
      .limit(5)
      .sort({ startDate: 1 });

    res.json({
      enrolledActivities: enrolledCount,
      upcomingActivities: upcomingCount,
      completedActivities: completedCount,
      availableActivities: availableCount,
      stats: {
        enrolled: enrolledCount,
        waitlisted: waitlistedCount,
        cancelled: cancelledCount,
        completed: completedCount,
      },
      enrollments,
      upcomingEnrollments,
      recommendedActivities,
    });
  } catch (error) {
    logger.error('Student dashboard error:', error);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
};

/**
 * Admin Dashboard - Get system-wide statistics
 */
export const getAdminDashboard = async (
  _req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // Get system-wide statistics
    const [
      totalUsers,
      totalStudents,
      totalFaculty,
      totalActivities,
      publishedActivities,
      totalEnrollments,
      recentUsers,
      recentActivities,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'faculty' }),
      Activity.countDocuments(),
      Activity.countDocuments({ status: 'published' }),
      Participation.countDocuments({ status: 'enrolled' }),
      User.find().sort({ createdAt: -1 }).limit(10).select('-password -refreshTokens'),
      Activity.find()
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    // Get department-wise statistics
    const departmentStats = await Activity.aggregate([
      { $match: { status: 'published' } },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
          totalCapacity: { $sum: '$capacity' },
          enrolledCount: { $sum: { $subtract: ['$capacity', '$availableSlots'] } },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Get category-wise statistics
    const categoryStats = await Activity.aggregate([
      { $match: { status: 'published' } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({
      stats: {
        totalUsers,
        totalStudents,
        totalFaculty,
        totalActivities,
        publishedActivities,
        totalEnrollments,
      },
      departmentStats,
      categoryStats,
      recentUsers,
      recentActivities,
    });
  } catch (error) {
    logger.error('Admin dashboard error:', error);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
};

/**
 * Export participants of an activity as CSV
 */
export const exportParticipants = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    // Get activity
    const activity = await Activity.findById(id);
    if (!activity) {
      res.status(404).json({ error: 'Activity not found' });
      return;
    }

    // Check permissions (faculty who created or admin)
    if (
      userRole !== 'admin' &&
      activity.createdBy.toString() !== userId
    ) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    // Get participants
    const participants = await Participation.find({
      activityId: id,
      status: 'enrolled',
    }).populate('userId', 'name email department rollNumber');

    // Generate CSV
    const csvHeader =
      'Name,Email,Department,Roll Number,Enrolled At,Status\n';
    const csvRows = participants
      .map((p: any) => {
        const user = p.userId;
        return `"${user.name}","${user.email}","${user.department || ''}","${
          user.rollNumber || ''
        }","${new Date(p.enrolledAt).toISOString()}","${p.status}"`;
      })
      .join('\n');

    const csv = csvHeader + csvRows;

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="activity-${id}-participants.csv"`
    );

    res.send(csv);
  } catch (error) {
    logger.error('Export participants error:', error);
    res.status(500).json({ error: 'Failed to export participants' });
  }
};

/**
 * Get activity analytics (for faculty/admin)
 */
export const getActivityAnalytics = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    // Get activity
    const activity = await Activity.findById(id);
    if (!activity) {
      res.status(404).json({ error: 'Activity not found' });
      return;
    }

    // Check permissions
    if (
      userRole !== 'admin' &&
      activity.createdBy.toString() !== userId
    ) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    // Get enrollment statistics
    const enrollments = await Participation.find({ activityId: id });

    const stats = {
      totalCapacity: activity.capacity,
      availableSlots: activity.availableSlots,
      enrolled: enrollments.filter((e) => e.status === 'enrolled').length,
      waitlisted: enrollments.filter((e) => e.status === 'waitlisted').length,
      cancelled: enrollments.filter((e) => e.status === 'cancelled').length,
      occupancyRate: (
        ((activity.capacity - activity.availableSlots) / activity.capacity) *
        100
      ).toFixed(2),
    };

    // Department-wise breakdown
    const departmentBreakdown = await Participation.aggregate([
      { $match: { activityId: activity._id, status: 'enrolled' } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $group: {
          _id: '$user.department',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Enrollment timeline (daily)
    const enrollmentTimeline = await Participation.aggregate([
      { $match: { activityId: activity._id, status: 'enrolled' } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$enrolledAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      activity: {
        id: activity._id,
        title: activity.title,
        startDate: activity.startDate,
        status: activity.status,
      },
      stats,
      departmentBreakdown,
      enrollmentTimeline,
    });
  } catch (error) {
    logger.error('Activity analytics error:', error);
    res.status(500).json({ error: 'Failed to load analytics' });
  }
};

/**
 * Admin: Get all users with filters and pagination
 */
export const getAllUsers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;

    const query: any = {};
    if (role && ['student', 'faculty', 'admin'].includes(role as string)) {
      query.role = role;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password -refreshTokens')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      User.countDocuments(query),
    ]);

    res.json({
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    logger.error('Get all users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

/**
 * Admin: Get all activities across all faculty with filters
 */
export const getAllActivitiesAdmin = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { status, category, department, search, faculty, page = 1, limit = 20 } = req.query;

    const query: any = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (department) query.department = department;
    if (faculty) query.createdBy = faculty;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [activities, total] = await Promise.all([
      Activity.find(query)
        .populate('createdBy', 'name email department')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Activity.countDocuments(query),
    ]);

    // Get enrollment counts for each activity
    const activityIds = activities.map((a: any) => a._id);
    const enrollmentCounts = await Participation.aggregate([
      { $match: { activityId: { $in: activityIds }, status: 'enrolled' } },
      { $group: { _id: '$activityId', count: { $sum: 1 } } },
    ]);
    const enrollMap = new Map(enrollmentCounts.map((e: any) => [e._id.toString(), e.count]));

    const enrichedActivities = activities.map((a: any) => ({
      ...a,
      enrolledCount: enrollMap.get(a._id.toString()) || 0,
    }));

    // Get unique faculty list for filter dropdown
    const facultyList = await User.find({ role: 'faculty' })
      .select('name email department')
      .sort({ name: 1 })
      .lean();

    res.json({
      activities: enrichedActivities,
      facultyList,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    logger.error('Admin get all activities error:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
};

/**
 * Admin: Update user role
 */
export const updateUserRole = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const adminId = req.user!.userId;

    if (!['student', 'faculty', 'admin'].includes(role)) {
      res.status(400).json({ error: 'Invalid role. Must be student, faculty, or admin.' });
      return;
    }

    if (id === adminId) {
      res.status(400).json({ error: 'Cannot change your own role' });
      return;
    }

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    user.role = role;
    user.refreshTokens = []; // Force re-login
    await user.save();

    res.json({ message: `Role updated to ${role}`, user });
  } catch (error) {
    logger.error('Update user role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
};
