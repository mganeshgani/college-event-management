import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { body } from 'express-validator';
import { User } from '../models/User';
import { config } from '../config';
import { JWTPayload } from '../types';
import { sendPasswordResetOTP } from '../utils/email';

/**
 * Validation rules for registration
 */
export const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be 2-100 characters'),
  body('role')
    .isIn(['student', 'faculty'])
    .withMessage('Role must be student or faculty'),
  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Department max 100 characters'),
  body('rollNumber')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Roll number max 50 characters'),
];

/**
 * Validation rules for login
 */
export const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

/**
 * Generate JWT access token
 */
const generateAccessToken = (payload: JWTPayload): string => {
  const options: SignOptions = {
    expiresIn: config.jwt.expiresIn as any,
  };
  return jwt.sign(payload, config.jwt.secret, options);
};

/**
 * Generate JWT refresh token
 */
const generateRefreshToken = (payload: JWTPayload): string => {
  const options: SignOptions = {
    expiresIn: config.jwt.refreshExpiresIn as any,
  };
  return jwt.sign(payload, config.jwt.refreshSecret, options);
};

/**
 * Register a new user
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, role, department, rollNumber } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({ error: 'User with this email already exists' });
      return;
    }

    // Clean rollNumber: convert empty string to undefined for sparse unique index
    const cleanRollNumber = rollNumber && rollNumber.trim() !== '' ? rollNumber.trim() : undefined;

    // Check if roll number is already used (if provided)
    if (cleanRollNumber) {
      const existingRollNumber = await User.findOne({ rollNumber: cleanRollNumber });
      if (existingRollNumber) {
        res.status(409).json({ error: 'Roll number already registered' });
        return;
      }
    }

    // Create user
    const user = await User.create({
      email,
      password,
      name,
      role,
      department,
      rollNumber: cleanRollNumber,
    });

    // Generate tokens
    const payload: JWTPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Save refresh token
    user.refreshTokens.push(refreshToken);
    await user.save();

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        rollNumber: user.rollNumber,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Registration failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

/**
 * Login user
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user with password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Generate tokens
    const payload: JWTPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Save refresh token
    user.refreshTokens.push(refreshToken);
    await user.save();

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        rollNumber: user.rollNumber,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Login failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Refresh access token
 */
export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token is required' });
      return;
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      config.jwt.refreshSecret
    ) as JWTPayload;

    // Find user and check if token is valid
    const user = await User.findById(decoded.userId);
    if (!user || !user.refreshTokens.includes(refreshToken)) {
      res.status(401).json({ error: 'Invalid refresh token' });
      return;
    }

    // Generate new access token
    const payload: JWTPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(payload);

    res.json({ accessToken });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

/**
 * Logout user
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    const userId = (req as any).user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Remove refresh token from user
    const user = await User.findById(userId);
    if (user && refreshToken) {
      user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
      await user.save();
    }

    res.json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ error: 'Logout failed' });
  }
};

/**
 * Get current user profile
 */
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;

    const user = await User.findById(userId).select('-password -refreshTokens');
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

/**
 * Change password
 */
export const changePassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const { currentPassword, newPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'Current and new password are required' });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({ error: 'New password must be at least 8 characters' });
      return;
    }

    // Find user with password
    const user = await User.findById(userId).select('+password');
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Verify current password
    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) {
      res.status(401).json({ error: 'Current password is incorrect' });
      return;
    }

    // Update password
    user.password = newPassword;
    user.refreshTokens = []; // Invalidate all refresh tokens
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to change password' });
  }
};

/**
 * Validation rules for profile update
 */
export const updateProfileValidation = [
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name: 2-100 chars'),
  body('department').optional().trim().isLength({ max: 100 }).withMessage('Department max 100 chars'),
  body('rollNumber').optional().trim().isLength({ max: 50 }).withMessage('Roll number max 50 chars'),
];

/**
 * Update user profile
 */
export const updateProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const userRole = (req as any).user?.role;

    const allowedFields: Record<string, boolean> = { name: true, department: true };
    if (userRole === 'student') {
      allowedFields.rollNumber = true;
    }

    const updates: Record<string, string> = {};
    for (const [key, value] of Object.entries(req.body)) {
      if (allowedFields[key] && typeof value === 'string') {
        updates[key] = value;
      }
    }

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: 'No valid fields to update' });
      return;
    }

    const user = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

/**
 * Validation rules for forgot password
 */
export const forgotPasswordValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
];

/**
 * Validation rules for reset password
 */
export const resetPasswordValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric().withMessage('OTP must be a 6-digit number'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number'),
];

/**
 * Forgot password — generate OTP and send email
 */
export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;

    // Always return same message to prevent email enumeration
    const successMessage = 'If an account with that email exists, an OTP has been sent';

    const user = await User.findOne({ email }).select('+passwordResetToken +passwordResetExpires');
    if (!user) {
      res.json({ message: successMessage });
      return;
    }

    // Generate cryptographically random 6-digit OTP
    const otp = String(crypto.randomInt(100000, 999999));

    // Store bcrypt hash of OTP (not the plaintext)
    const salt = await bcrypt.genSalt(10);
    user.passwordResetToken = await bcrypt.hash(otp, salt);
    user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await user.save();

    // Send OTP email (logs to console in dev)
    await sendPasswordResetOTP(email, user.name, otp);

    res.json({ message: successMessage });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process request' });
  }
};

/**
 * Reset password — verify OTP and update password
 */
export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email }).select('+passwordResetToken +passwordResetExpires +password');
    if (!user || !user.passwordResetToken || !user.passwordResetExpires) {
      res.status(400).json({ error: 'Invalid or expired reset request' });
      return;
    }

    // Check expiry
    if (user.passwordResetExpires < new Date()) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
      res.status(400).json({ error: 'OTP has expired. Please request a new one' });
      return;
    }

    // Verify OTP against stored hash
    const isValidOTP = await bcrypt.compare(otp, user.passwordResetToken);
    if (!isValidOTP) {
      res.status(400).json({ error: 'Invalid OTP' });
      return;
    }

    // Update password, clear reset fields, invalidate all sessions
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshTokens = [];
    await user.save();

    res.json({ message: 'Password reset successfully. Please log in with your new password.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset password' });
  }
};
