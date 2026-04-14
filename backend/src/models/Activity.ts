import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityDocument extends Document {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  capacity: number;
  availableSlots: number;
  department: string;
  category: string;
  posterImage?: string;
  createdBy: mongoose.Types.ObjectId;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const activitySchema = new Schema<IActivityDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 2000,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (this: IActivityDocument, value: Date) {
          return value > this.startDate;
        },
        message: 'End date must be after start date',
      },
    },
    location: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
      max: 10000,
    },
    availableSlots: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: function (this: IActivityDocument, value: number) {
          return value <= this.capacity;
        },
        message: 'Available slots cannot exceed capacity',
      },
    },
    department: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      enum: [
        'Academic',
        'Cultural',
        'Sports',
        'Technical',
        'Social',
        'Workshop',
        'Seminar',
        'Competition',
        'Other',
      ],
    },
    posterImage: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'cancelled', 'completed'],
      default: 'draft',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
activitySchema.index({ status: 1, startDate: 1 });
activitySchema.index({ department: 1 });
activitySchema.index({ category: 1 });
activitySchema.index({ createdBy: 1 });
activitySchema.index({ title: 'text', description: 'text' }); // Full-text search

// Virtual for enrollment count
activitySchema.virtual('enrolledCount').get(function (this: IActivityDocument) {
  return this.capacity - this.availableSlots;
});

// Include virtuals when converting to JSON
activitySchema.set('toJSON', { virtuals: true });
activitySchema.set('toObject', { virtuals: true });

export const Activity = mongoose.model<IActivityDocument>('Activity', activitySchema);
