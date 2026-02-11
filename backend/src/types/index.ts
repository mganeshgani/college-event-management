export interface IUser {
  _id: string;
  email: string;
  password: string;
  name: string;
  role: 'student' | 'faculty' | 'admin';
  department?: string;
  rollNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IActivity {
  _id: string;
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
  createdBy: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface IParticipation {
  _id: string;
  activityId: string;
  userId: string;
  enrolledAt: Date;
  status: 'enrolled' | 'waitlisted' | 'cancelled';
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: JWTPayload;
}
