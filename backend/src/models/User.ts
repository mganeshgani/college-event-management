import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from '../config';

export interface IUserDocument extends Document {
  email: string;
  password: string;
  name: string;
  role: 'student' | 'faculty' | 'admin';
  department?: string;
  rollNumber?: string;
  refreshTokens: string[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false, // Don't return password by default
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    role: {
      type: String,
      enum: ['student', 'faculty', 'admin'],
      default: 'student',
      required: true,
    },
    department: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    rollNumber: {
      type: String,
      trim: true,
      maxlength: 50,
      sparse: true, // Allow null values but enforce uniqueness when present
      unique: true,
    },
    refreshTokens: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ department: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  const user = this as IUserDocument;

  // Only hash if password is modified
  if (!user.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(config.security.bcryptRounds);
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  const user = this as IUserDocument;
  return bcrypt.compare(candidatePassword, user.password);
};

// Remove sensitive data when converting to JSON
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.refreshTokens;
  delete user.__v;
  return user;
};

export const User = mongoose.model<IUserDocument>('User', userSchema);
