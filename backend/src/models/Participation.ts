import mongoose, { Schema, Document } from 'mongoose';

export interface IParticipationDocument extends Document {
  activityId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  enrolledAt: Date;
  status: 'enrolled' | 'waitlisted' | 'cancelled';
}

const participationSchema = new Schema<IParticipationDocument>(
  {
    activityId: {
      type: Schema.Types.ObjectId,
      ref: 'Activity',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['enrolled', 'waitlisted', 'cancelled'],
      default: 'enrolled',
    },
  },
  {
    timestamps: true,
  }
);

// CRITICAL: Unique compound index to prevent duplicate enrollments
// This ensures at database level that a user can only enroll once per activity
participationSchema.index(
  { activityId: 1, userId: 1 },
  { unique: true, name: 'unique_participation' }
);

// Additional indexes for efficient queries
participationSchema.index({ userId: 1, status: 1 });
participationSchema.index({ activityId: 1, status: 1 });
participationSchema.index({ enrolledAt: -1 });

export const Participation = mongoose.model<IParticipationDocument>(
  'Participation',
  participationSchema
);
