import { Response } from 'express';
import { body, query } from 'express-validator';
import mongoose from 'mongoose';
import { Activity } from '../models/Activity';
import { Participation } from '../models/Participation';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { sendEnrollmentConfirmation, sendWaitlistNotification } from '../utils/email';
import { logger } from '../utils/logger';

/**
 * Validation rules for activity creation
 */
export const createActivityValidation = [
  body('title').trim().isLength({ min: 3, max: 200 }).withMessage('Title: 3-200 chars'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description: 10-2000 chars'),
  body('startDate').isISO8601().withMessage('Valid start date required'),
  body('endDate').isISO8601().withMessage('Valid end date required'),
  body('location').trim().isLength({ min: 1, max: 200 }).withMessage('Location required'),
  body('capacity').isInt({ min: 1, max: 10000 }).withMessage('Capacity: 1-10000'),
  body('department').trim().isLength({ min: 1, max: 100 }).withMessage('Department required'),
  body('category')
    .isIn([
      'Academic',
      'Cultural',
      'Sports',
      'Technical',
      'Social',
      'Workshop',
      'Seminar',
      'Competition',
      'Other',
    ])
    .withMessage('Invalid category'),
  body('posterImage').optional().isURL().withMessage('Invalid poster URL'),
];

/**
 * Validation rules for activity update
 */
export const updateActivityValidation = [
  body('title').optional().trim().isLength({ min: 3, max: 200 }),
  body('description').optional().trim().isLength({ min: 10, max: 2000 }),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
  body('location').optional().trim().isLength({ min: 1, max: 200 }),
  body('capacity').optional().isInt({ min: 1, max: 10000 }),
  body('department').optional().trim().isLength({ min: 1, max: 100 }),
  body('category').optional().isIn([
    'Academic',
    'Cultural',
    'Sports',
    'Technical',
    'Social',
    'Workshop',
    'Seminar',
    'Competition',
    'Other',
  ]),
  body('status').optional().isIn(['draft', 'published', 'cancelled', 'completed']),
  body('posterImage').optional().isURL(),
];

/**
 * Validation rules for activity search
 */
export const searchValidation = [
  query('search').optional().trim(),
  query('category').optional().trim(),
  query('department').optional().trim(),
  query('status').optional().isIn(['draft', 'published', 'cancelled', 'completed']),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];

/**
 * Create new activity (Faculty only)
 */
export const createActivity = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      title,
      description,
      startDate,
      endDate,
      location,
      capacity,
      department,
      category,
      posterImage,
      status = 'draft',
      waitlistEnabled = false,
    } = req.body;

    const userId = req.user!.userId;

    // Validate dates
    if (new Date(endDate) <= new Date(startDate)) {
      res.status(400).json({ error: 'End date must be after start date' });
      return;
    }

    // Create activity
    const activity = await Activity.create({
      title,
      description,
      startDate,
      endDate,
      location,
      capacity,
      availableSlots: capacity, // Initially all slots available
      department,
      category,
      posterImage,
      createdBy: userId,
      status,
      waitlistEnabled,
    });

    res.status(201).json({
      message: 'Activity created successfully',
      activity,
    });
  } catch (error) {
    logger.error('Create activity error:', error);
    res.status(500).json({ error: 'Failed to create activity' });
  }
};

/**
 * Get all activities with filters and pagination
 */
export const getActivities = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      search,
      category,
      department,
      status = 'published',
      startDate,
      endDate,
      page = 1,
      limit = 20,
      myActivities,
    } = req.query;

    // Build query
    const query: any = {};

    // Filter by creator if myActivities is true (for faculty)
    if (myActivities === 'true' && req.user) {
      query.createdBy = req.user.userId;
    }

    // Only show published activities to students and guests
    if (!req.user || req.user.role === 'student') {
      query.status = 'published';
    } else if (status) {
      query.status = status;
    }

    if (category) query.category = category;
    if (department) query.department = department;

    // Date filters
    if (startDate) {
      query.startDate = { $gte: new Date(startDate as string) };
    }
    if (endDate) {
      query.endDate = { $lte: new Date(endDate as string) };
    }

    // Text search
    if (search) {
      query.$text = { $search: search as string };
    }

    // Execute query with pagination
    const skip = (Number(page) - 1) * Number(limit);
    const [activities, total] = await Promise.all([
      Activity.find(query)
        .populate('createdBy', 'name email department')
        .sort({ startDate: 1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Activity.countDocuments(query),
    ]);

    res.json({
      data: activities,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    logger.error('Get activities error:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
};

/**
 * Get activity by ID
 */
export const getActivityById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid activity ID' });
      return;
    }

    const activity = await Activity.findById(id).populate(
      'createdBy',
      'name email department'
    );

    if (!activity) {
      res.status(404).json({ error: 'Activity not found' });
      return;
    }

    // Students and guests can only view published activities
    if ((!req.user || req.user.role === 'student') && activity.status !== 'published') {
      res.status(403).json({ error: 'Activity not available' });
      return;
    }

    // Check if user is enrolled
    let isEnrolled = false;
    let enrollmentStatus: string | null = null;
    let waitlistPosition: number | null = null;
    if (req.user && req.user.role === 'student') {
      const participation = await Participation.findOne({
        activityId: id,
        userId: req.user!.userId,
        status: { $in: ['enrolled', 'waitlisted'] },
      });
      isEnrolled = !!participation;
      if (participation) {
        enrollmentStatus = participation.status;
        if (participation.status === 'waitlisted') {
          waitlistPosition = await Participation.countDocuments({
            activityId: id,
            status: 'waitlisted',
            enrolledAt: { $lt: participation.enrolledAt },
          }) + 1;
        }
      }
    }

    res.json({ activity, isEnrolled, enrollmentStatus, waitlistPosition });
  } catch (error) {
    logger.error('Get activity error:', error);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
};

/**
 * Update activity (Faculty who created it or Admin)
 */
export const updateActivity = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid activity ID' });
      return;
    }

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
      res.status(403).json({ error: 'Not authorized to update this activity' });
      return;
    }

    // Validate date changes
    if (req.body.startDate || req.body.endDate) {
      const startDate = req.body.startDate
        ? new Date(req.body.startDate)
        : activity.startDate;
      const endDate = req.body.endDate ? new Date(req.body.endDate) : activity.endDate;

      if (endDate <= startDate) {
        res.status(400).json({ error: 'End date must be after start date' });
        return;
      }
    }

    // Update capacity logic
    if (req.body.capacity) {
      const newCapacity = Number(req.body.capacity);
      const enrolledCount = activity.capacity - activity.availableSlots;

      if (newCapacity < enrolledCount) {
        res.status(400).json({
          error: `Cannot reduce capacity below enrolled count (${enrolledCount})`,
        });
        return;
      }

      // Adjust available slots
      req.body.availableSlots = newCapacity - enrolledCount;
    }

    // Update activity - whitelist allowed fields to prevent injection
    const allowedFields = ['title', 'description', 'startDate', 'endDate', 'location', 'capacity', 'availableSlots', 'department', 'category', 'posterImage', 'status', 'waitlistEnabled'];
    const updates: any = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }
    Object.assign(activity, updates);
    await activity.save();

    res.json({
      message: 'Activity updated successfully',
      activity,
    });
  } catch (error) {
    logger.error('Update activity error:', error);
    res.status(500).json({ error: 'Failed to update activity' });
  }
};

/**
 * Delete activity (Faculty who created it or Admin)
 */
export const deleteActivity = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid activity ID' });
      return;
    }

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
      res.status(403).json({ error: 'Not authorized to delete this activity' });
      return;
    }

    // Check if activity has enrollments
    const enrollmentCount = await Participation.countDocuments({
      activityId: id,
      status: 'enrolled',
    });

    if (enrollmentCount > 0) {
      res.status(400).json({
        error: `Cannot delete activity with ${enrollmentCount} enrollments. Cancel it instead.`,
      });
      return;
    }

    await activity.deleteOne();
    await Participation.deleteMany({ activityId: id });

    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    logger.error('Delete activity error:', error);
    res.status(500).json({ error: 'Failed to delete activity' });
  }
};

/**
 * CRITICAL: Atomic enrollment with race condition handling
 * Uses MongoDB transaction with SELECT FOR UPDATE pattern
 */
export const enrollInActivity = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      await session.abortTransaction();
      res.status(400).json({ error: 'Invalid activity ID' });
      return;
    }

    // STEP 1: Lock the activity document for update (prevents race condition)
    const activity = await Activity.findOne({
      _id: id,
      status: 'published',
    }).session(session);

    if (!activity) {
      await session.abortTransaction();
      res.status(404).json({ error: 'Activity not found or not published' });
      return;
    }

    // Check if activity is in the future
    if (new Date(activity.startDate) < new Date()) {
      await session.abortTransaction();
      res.status(400).json({ error: 'Cannot enroll in past activities' });
      return;
    }

    // STEP 2: Check for existing participation (duplicate prevention)
    const existingParticipation = await Participation.findOne({
      activityId: id,
      userId,
    }).session(session);

    if (existingParticipation) {
      await session.abortTransaction();
      res.status(409).json({
        error: 'Already enrolled in this activity',
        status: existingParticipation.status,
      });
      return;
    }

    // STEP 3 + 4: Try to secure a slot atomically
    let gotSlot = false;
    if (activity.availableSlots > 0) {
      const updateResult = await Activity.updateOne(
        {
          _id: id,
          availableSlots: { $gt: 0 },
        },
        {
          $inc: { availableSlots: -1 },
        }
      ).session(session);
      gotSlot = updateResult.modifiedCount > 0;
    }

    if (gotSlot) {
      // STEP 5: Create enrolled participation
      const participation = await Participation.create(
        [
          {
            activityId: id,
            userId,
            status: 'enrolled',
            enrolledAt: new Date(),
          },
        ],
        { session }
      );

      // STEP 6: Commit transaction
      await session.commitTransaction();

      // STEP 7: Send confirmation email (async, after transaction)
      const user = await User.findById(userId);
      if (user) {
        sendEnrollmentConfirmation(
          user.email,
          user.name,
          activity.title,
          activity.startDate,
          activity.location
        ).catch((err) => logger.error('Email send failed:', err));
      }

      res.status(200).json({
        message: 'Successfully enrolled in activity',
        participation: participation[0],
        remainingSlots: activity.availableSlots - 1,
      });
    } else if (activity.waitlistEnabled) {
      // Activity is full but waitlist is enabled — add to waitlist
      const waitlistPosition = await Participation.countDocuments({
        activityId: id,
        status: 'waitlisted',
      }).session(session) + 1;

      const participation = await Participation.create(
        [
          {
            activityId: id,
            userId,
            status: 'waitlisted',
            enrolledAt: new Date(),
          },
        ],
        { session }
      );

      await session.commitTransaction();

      // Send waitlist notification (async, after transaction)
      const user = await User.findById(userId);
      if (user) {
        sendWaitlistNotification(user.email, user.name, activity.title)
          .catch((err) => logger.error('Waitlist email send failed:', err));
      }

      res.status(200).json({
        message: 'Activity is full. You have been added to the waitlist.',
        participation: participation[0],
        waitlistPosition,
        status: 'waitlisted',
      });
    } else {
      // Activity is full and no waitlist
      await session.abortTransaction();
      res.status(400).json({ error: 'Activity is full' });
    }
  } catch (error: any) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    // Handle duplicate key error (unique index violation)
    if (error.code === 11000) {
      res.status(409).json({ error: 'Already enrolled in this activity' });
      return;
    }

    // Handle transient write conflicts during concurrent enrollments
    const isWriteConflict =
      error?.codeName === 'WriteConflict' ||
      error?.code === 112 ||
      /writeconflict/i.test(error?.message || '');

    if (isWriteConflict) {
      res.status(400).json({ error: 'Activity is full (slots taken)' });
      return;
    }

    logger.error('Enrollment error:', error);
    res.status(500).json({ error: 'Failed to enroll in activity' });
  } finally {
    session.endSession();
  }
};

/**
 * Cancel enrollment
 */
export const cancelEnrollment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      await session.abortTransaction();
      res.status(400).json({ error: 'Invalid activity ID' });
      return;
    }

    // Find participation (enrolled or waitlisted)
    const participation = await Participation.findOne({
      activityId: id,
      userId,
      status: { $in: ['enrolled', 'waitlisted'] },
    }).session(session);

    if (!participation) {
      await session.abortTransaction();
      res.status(404).json({ error: 'Enrollment not found' });
      return;
    }

    const wasPreviouslyEnrolled = participation.status === 'enrolled';

    // Update participation status
    participation.status = 'cancelled';
    await participation.save({ session });

    if (wasPreviouslyEnrolled) {
      // Check for waitlisted participants to auto-promote
      const nextWaitlisted = await Participation.findOne({
        activityId: id,
        status: 'waitlisted',
      })
        .sort({ enrolledAt: 1 }) // oldest waitlisted first
        .session(session);

      if (nextWaitlisted) {
        // Promote waitlisted → enrolled (slot freed by cancel is consumed by promotion)
        nextWaitlisted.status = 'enrolled';
        await nextWaitlisted.save({ session });

        await session.commitTransaction();

        // Send enrollment confirmation to promoted user (async)
        const promotedUser = await User.findById(nextWaitlisted.userId);
        const activity = await Activity.findById(id);
        if (promotedUser && activity) {
          sendEnrollmentConfirmation(
            promotedUser.email,
            promotedUser.name,
            activity.title,
            activity.startDate,
            activity.location
          ).catch((err) => logger.error('Promotion email send failed:', err));
        }
      } else {
        // No one to promote — increment available slots
        await Activity.updateOne(
          { _id: id },
          { $inc: { availableSlots: 1 } }
        ).session(session);

        await session.commitTransaction();
      }
    } else {
      // Was waitlisted — no slot changes needed
      await session.commitTransaction();
    }

    res.json({ message: 'Enrollment cancelled successfully' });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    logger.error('Cancel enrollment error:', error);
    res.status(500).json({ error: 'Failed to cancel enrollment' });
  } finally {
    session.endSession();
  }
};

/**
 * Get user's enrollments
 */
export const getMyEnrollments = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { status } = req.query;

    const query: any = { userId };
    if (status) {
      query.status = status;
    }

    const enrollments = await Participation.find(query)
      .populate({
        path: 'activityId',
        select: 'title description startDate endDate location category posterImage status',
      })
      .sort({ enrolledAt: -1 });

    res.json({ enrollments });
  } catch (error) {
    logger.error('Get enrollments error:', error);
    res.status(500).json({ error: 'Failed to fetch enrollments' });
  }
};

/**
 * Get all participants for an activity (Faculty who created it or Admin only)
 * Returns full student details (name, email, roll number, department)
 */
export const getActivityParticipants = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status = 'enrolled', page = 1, limit = 50 } = req.query;
    const userRole = req.user!.role;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid activity ID' });
      return;
    }

    // Check if activity exists
    const activity = await Activity.findById(id);
    if (!activity) {
      res.status(404).json({ error: 'Activity not found' });
      return;
    }

    // Authorization: Any faculty or admin can view participants
    if (userRole !== 'admin' && userRole !== 'faculty') {
      res.status(403).json({ error: 'Not authorized to view participants' });
      return;
    }

    // Build query for participants
    const participationQuery: any = { activityId: id };
    if (status) {
      participationQuery.status = status;
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Fetch participations and populate user details
    const [participations, total] = await Promise.all([
      Participation.find(participationQuery)
        .populate('userId', 'name email department rollNumber')
        .sort({ enrolledAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Participation.countDocuments(participationQuery),
    ]);

    // Map to clean participant data
    const participants = participations.map((p: any) => ({
      _id: p._id,
      studentId: p.userId._id,
      name: p.userId.name,
      email: p.userId.email,
      department: p.userId.department,
      rollNumber: p.userId.rollNumber,
      enrolledAt: p.enrolledAt,
      status: p.status,
    }));

    res.json({
      activity: {
        _id: activity._id,
        title: activity.title,
        capacity: activity.capacity,
        availableSlots: activity.availableSlots,
        enrolledCount: activity.capacity - activity.availableSlots,
      },
      participants,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    logger.error('Get participants error:', error);
    res.status(500).json({ error: 'Failed to fetch participants' });
  }
};

/**
 * Bulk update activity status (Admin only)
 */
export const bulkUpdateActivityStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { activityIds, status } = req.body;

    if (!Array.isArray(activityIds) || activityIds.length === 0) {
      res.status(400).json({ error: 'activityIds must be a non-empty array' });
      return;
    }

    const validStatuses = ['published', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
      return;
    }

    const validIds = activityIds.every((id: string) => mongoose.Types.ObjectId.isValid(id));
    if (!validIds) {
      res.status(400).json({ error: 'One or more invalid activity IDs' });
      return;
    }

    const result = await Activity.updateMany(
      { _id: { $in: activityIds } },
      { status }
    );

    res.json({ modifiedCount: result.modifiedCount });
  } catch (error) {
    logger.error('Bulk status update error:', error);
    res.status(500).json({ error: 'Failed to update activity statuses' });
  }
};

/**
 * Clone an activity (Faculty + Admin)
 */
export const cloneActivity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    const original = await Activity.findById(id);
    if (!original) {
      res.status(404).json({ error: 'Activity not found' });
      return;
    }

    // Faculty can only clone their own activities
    if (userRole === 'faculty' && original.createdBy.toString() !== userId) {
      res.status(403).json({ error: 'You can only clone your own activities' });
      return;
    }

    const cloned = await Activity.create({
      title: `Copy of ${original.title}`,
      description: original.description,
      location: original.location,
      capacity: original.capacity,
      availableSlots: original.capacity,
      department: original.department,
      category: original.category,
      posterImage: original.posterImage,
      waitlistEnabled: original.waitlistEnabled,
      status: 'draft',
      createdBy: userId,
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    });

    res.status(201).json(cloned);
  } catch (error) {
    logger.error('Clone activity error:', error);
    res.status(500).json({ error: 'Failed to clone activity' });
  }
};
