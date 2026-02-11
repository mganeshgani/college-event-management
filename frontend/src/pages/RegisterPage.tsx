import { useState, FormEvent, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  EnvelopeIcon, 
  LockClosedIcon, 
  UserIcon,
  AcademicCapIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { Button, Input, Card } from '../components/Common';
import { authService, handleApiError } from '../services';
import { useAuthStore } from '../store/authStore';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuthStore();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student' as 'student' | 'faculty',
    department: '',
    rollNumber: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'faculty' || user.role === 'admin') {
        navigate('/faculty/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (formData.role === 'student' && !formData.rollNumber.trim()) {
      newErrors.rollNumber = 'Roll number is required for students';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    setIsLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      const response = await authService.register(registerData);
      await login(response.user.email, formData.password);
      
      // Redirect based on role
      if (response.user.role === 'faculty') {
        navigate('/faculty/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (error: any) {
      setErrors({ general: handleApiError(error) });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <Card className="!p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold gradient-text mb-2">
              Create Account
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Join our campus event community
            </p>
          </div>

          {errors.general && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                I am a <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'student', rollNumber: '' })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.role === 'student'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <AcademicCapIcon className="w-8 h-8 mx-auto mb-2 text-primary-600" />
                  <div className="font-medium">Student</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'faculty', rollNumber: '' })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.role === 'faculty'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <BuildingOfficeIcon className="w-8 h-8 mx-auto mb-2 text-primary-600" />
                  <div className="font-medium">Faculty</div>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                leftIcon={<UserIcon className="w-5 h-5" />}
                error={errors.name}
                required
              />

              <Input
                label="Email"
                type="email"
                placeholder="you@college.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                leftIcon={<EnvelopeIcon className="w-5 h-5" />}
                error={errors.email}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                leftIcon={<LockClosedIcon className="w-5 h-5" />}
                error={errors.password}
                helperText="Min 8 chars, uppercase, lowercase, number"
                required
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                leftIcon={<LockClosedIcon className="w-5 h-5" />}
                error={errors.confirmPassword}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Department"
                placeholder="Computer Science"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                helperText="Optional"
              />

              {formData.role === 'student' && (
                <Input
                  label="Roll Number"
                  placeholder="CS21B001"
                  value={formData.rollNumber}
                  onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                  error={errors.rollNumber}
                  required
                />
              )}
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                required
                className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                I agree to the{' '}
                <Link to="/terms" className="text-primary-600 hover:text-primary-700 font-medium">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-primary-600 hover:text-primary-700 font-medium">
                  Privacy Policy
                </Link>
              </span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
