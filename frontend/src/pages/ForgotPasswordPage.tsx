import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { EnvelopeIcon, KeyIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Button, Input, Card } from '../components/Common';
import { authService } from '../services';

interface EmailForm {
  email: string;
}

interface ResetForm {
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const emailForm = useForm<EmailForm>();
  const resetForm = useForm<ResetForm>();

  const handleEmailSubmit = async (data: EmailForm) => {
    setIsLoading(true);
    try {
      await authService.forgotPassword(data.email);
      setEmail(data.email);
      setStep(2);
      toast.success('If an account exists, an OTP has been sent to your email');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (data: ResetForm) => {
    if (data.newPassword !== data.confirmPassword) {
      resetForm.setError('confirmPassword', { message: 'Passwords do not match' });
      return;
    }
    setIsLoading(true);
    try {
      await authService.resetPassword(email, data.otp, data.newPassword);
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              {step === 1 ? (
                <EnvelopeIcon className="w-8 h-8 text-white" />
              ) : (
                <KeyIcon className="w-8 h-8 text-white" />
              )}
            </div>
            <h1 className="text-2xl font-bold font-display text-gray-900 dark:text-white">
              {step === 1 ? 'Forgot Password' : 'Reset Password'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              {step === 1
                ? "Enter your email and we'll send you a reset code"
                : 'Enter the OTP and your new password'}
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            <div className={`flex-1 h-1 rounded-full ${step >= 1 ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
            <div className={`flex-1 h-1 rounded-full ${step >= 2 ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={emailForm.handleSubmit(handleEmailSubmit)}
                className="space-y-4"
              >
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="your@email.com"
                  error={emailForm.formState.errors.email?.message}
                  {...emailForm.register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+\.\S+$/,
                      message: 'Please enter a valid email',
                    },
                  })}
                />
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  isLoading={isLoading}
                >
                  Send OTP
                </Button>
              </motion.form>
            ) : (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={resetForm.handleSubmit(handleResetSubmit)}
                className="space-y-4"
              >
                <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-2">
                  OTP sent to <span className="font-medium text-gray-700 dark:text-gray-300">{email}</span>
                </div>
                <Input
                  label="6-Digit OTP"
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  error={resetForm.formState.errors.otp?.message}
                  {...resetForm.register('otp', {
                    required: 'OTP is required',
                    pattern: {
                      value: /^\d{6}$/,
                      message: 'OTP must be 6 digits',
                    },
                  })}
                />
                <Input
                  label="New Password"
                  type="password"
                  placeholder="Min 8 chars, uppercase, lowercase, number"
                  error={resetForm.formState.errors.newPassword?.message}
                  {...resetForm.register('newPassword', {
                    required: 'New password is required',
                    minLength: { value: 8, message: 'At least 8 characters' },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: 'Must have uppercase, lowercase, and number',
                    },
                  })}
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="Re-enter new password"
                  error={resetForm.formState.errors.confirmPassword?.message}
                  {...resetForm.register('confirmPassword', {
                    required: 'Please confirm your password',
                  })}
                />
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  isLoading={isLoading}
                >
                  Reset Password
                </Button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-center text-sm text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                >
                  ← Back to email step
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Footer */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
