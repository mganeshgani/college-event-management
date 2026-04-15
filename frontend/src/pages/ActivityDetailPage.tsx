import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon,
  ClockIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { Button, Card, Badge, Modal } from '../components/Common';
import { activityService, handleApiError } from '../services';
import { useAuthStore } from '../store/authStore';

export default function ActivityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollError, setEnrollError] = useState('');
  const [enrollSuccess, setEnrollSuccess] = useState(false);
  const [enrollResult, setEnrollResult] = useState<{ status?: string; waitlistPosition?: number } | null>(null);

  const { data, isLoading, isError, dataUpdatedAt } = useQuery({
    queryKey: ['activity', id],
    queryFn: () => activityService.getActivity(id!),
    enabled: !!id,
    refetchInterval: (query) => {
      const status = query.state.data?.activity?.status;
      return status === 'completed' || status === 'cancelled' ? false : 30000;
    },
  });

  const activity = data?.activity;
  const isEnrolled = data?.isEnrolled || false;
  const enrollmentStatus = data?.enrollmentStatus || null;
  const waitlistPosition = data?.waitlistPosition || null;

  // Track slot changes for pulse animation
  const prevSlotsRef = useRef<number | null>(null);
  const [slotPulse, setSlotPulse] = useState(false);

  useEffect(() => {
    if (activity && prevSlotsRef.current !== null && prevSlotsRef.current !== activity.availableSlots) {
      setSlotPulse(true);
      const timer = setTimeout(() => setSlotPulse(false), 600);
      return () => clearTimeout(timer);
    }
    if (activity) prevSlotsRef.current = activity.availableSlots;
  }, [activity?.availableSlots]);

  // "Last updated" timer
  const [lastUpdatedText, setLastUpdatedText] = useState('just now');
  useEffect(() => {
    if (!dataUpdatedAt) return;
    const update = () => {
      const seconds = Math.floor((Date.now() - dataUpdatedAt) / 1000);
      if (seconds < 5) setLastUpdatedText('just now');
      else if (seconds < 60) setLastUpdatedText(`${seconds}s ago`);
      else setLastUpdatedText(`${Math.floor(seconds / 60)}m ago`);
    };
    update();
    const interval = setInterval(update, 5000);
    return () => clearInterval(interval);
  }, [dataUpdatedAt]);

  const enrollMutation = useMutation({
    mutationFn: () => activityService.enrollActivity(id!),
    onSuccess: (result) => {
      setEnrollSuccess(true);
      setEnrollResult(result);
      setShowEnrollModal(false);
      queryClient.invalidateQueries({ queryKey: ['activity', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'student'] });
      queryClient.invalidateQueries({ queryKey: ['myActivities'] });
      queryClient.invalidateQueries({ queryKey: ['myEnrollments'] });
      queryClient.invalidateQueries({ queryKey: ['studentStats'] });
    },
    onError: (error) => {
      setEnrollError(handleApiError(error));
    },
  });

  const handleEnroll = () => {
    setEnrollError('');
    enrollMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (isError || !activity) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-500 mb-4">Activity not found</p>
        <Button onClick={() => navigate('/activities')}>Back to Activities</Button>
      </div>
    );
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const slotsPercentage = (activity.availableSlots / activity.capacity) * 100;
  const canEnroll = user?.role === 'student' && 
                    activity.status === 'published' && 
                    activity.availableSlots > 0 && 
                    !isEnrolled;
  const canJoinWaitlist = user?.role === 'student' &&
                          activity.status === 'published' &&
                          activity.availableSlots === 0 &&
                          activity.waitlistEnabled &&
                          !isEnrolled;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-500 mb-6"
      >
        <ArrowLeftIcon className="w-5 h-5 mr-2" />
        Back
      </button>

      {/* Success Alert */}
      {enrollSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-4 rounded-lg flex items-center ${
            enrollResult?.status === 'waitlisted'
              ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
              : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
          }`}
        >
          <CheckCircleIcon className={`w-6 h-6 mr-3 ${
            enrollResult?.status === 'waitlisted' ? 'text-yellow-500' : 'text-green-500'
          }`} />
          <p className={
            enrollResult?.status === 'waitlisted'
              ? 'text-yellow-700 dark:text-yellow-400'
              : 'text-green-700 dark:text-green-400'
          }>
            {enrollResult?.status === 'waitlisted'
              ? `You're on the waitlist! Position #${enrollResult.waitlistPosition}. We'll notify you when a spot opens.`
              : 'Successfully enrolled! Check your dashboard to view your activities.'}
          </p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero Image */}
          {activity.posterImage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative h-96 rounded-2xl overflow-hidden"
            >
              <img
                src={activity.posterImage}
                alt={activity.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex gap-2 mb-4">
                  <Badge variant="primary">{activity.category}</Badge>
                  <Badge variant={activity.status === 'published' ? 'success' : 'warning'}>
                    {activity.status}
                  </Badge>
                </div>
                <h1 className="text-4xl font-bold text-white">{activity.title}</h1>
              </div>
            </motion.div>
          )}

          {/* Description */}
          <Card>
            <h2 className="text-2xl font-bold mb-4">About This Activity</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
              {activity.description}
            </p>
          </Card>

          {/* Organizer Info */}
          <Card>
            <h3 className="text-lg font-semibold mb-3">Organized By</h3>
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-xl mr-4">
                {activity.createdBy?.name?.charAt(0) || '?'}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{activity.createdBy?.name || 'Unknown'}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{activity.createdBy?.email || ''}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
          <Card glass>
            <h3 className="text-lg font-semibold mb-4">Event Details</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <CalendarIcon className="w-5 h-5 text-primary-500 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                  <p className="font-medium">{formatDate(activity.startDate)}</p>
                </div>
              </div>

              <div className="flex items-start">
                <ClockIcon className="w-5 h-5 text-primary-500 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Time</p>
                  <p className="font-medium">{formatTime(activity.startDate)}</p>
                </div>
              </div>

              <div className="flex items-start">
                <MapPinIcon className="w-5 h-5 text-primary-500 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                  <p className="font-medium">{activity.location}</p>
                </div>
              </div>

              <div className="flex items-start">
                <UserGroupIcon className="w-5 h-5 text-primary-500 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Capacity</p>
                  <motion.p
                    className="font-medium"
                    animate={slotPulse ? { scale: [1, 1.15, 1] } : {}}
                    transition={{ duration: 0.4 }}
                  >
                    {activity.availableSlots} / {activity.capacity} spots available
                  </motion.p>
                  <p className="text-xs text-gray-400 mt-0.5">Updated {lastUpdatedText}</p>
                </div>
              </div>
            </div>

            {/* Availability Bar */}
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>Availability</span>
                <span>{Math.round(slotsPercentage)}%</span>
              </div>
              <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${slotsPercentage}%` }}
                  transition={{ duration: 0.8 }}
                  className={`h-full rounded-full ${
                    slotsPercentage < 20
                      ? 'bg-gradient-to-r from-red-500 to-orange-500'
                      : 'bg-gradient-to-r from-primary-500 to-secondary-500'
                  }`}
                />
              </div>
            </div>

            {/* Enroll Button */}
            {isEnrolled && enrollmentStatus === 'waitlisted' ? (
              <div className="mt-6 p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center justify-center text-yellow-600 dark:text-yellow-400">
                  <ClockIcon className="w-5 h-5 mr-2" />
                  <span className="font-medium">You're on the waitlist (Position #{waitlistPosition})</span>
                </div>
              </div>
            ) : isEnrolled ? (
              <div className="mt-6 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-center text-green-600 dark:text-green-400">
                  <CheckCircleIcon className="w-5 h-5 mr-2" />
                  <span className="font-medium">You're enrolled in this activity</span>
                </div>
              </div>
            ) : canEnroll ? (
              <Button
                variant="primary"
                size="lg"
                className="w-full mt-6"
                onClick={() => setShowEnrollModal(true)}
              >
                Enroll Now
              </Button>
            ) : canJoinWaitlist ? (
              <Button
                variant="secondary"
                size="lg"
                className="w-full mt-6"
                onClick={() => setShowEnrollModal(true)}
              >
                Join Waitlist
              </Button>
            ) : !user ? (
              <Link to="/login">
                <Button variant="primary" size="lg" className="w-full mt-6">
                  Login to Enroll
                </Button>
              </Link>
            ) : activity.availableSlots === 0 ? (
              <Button variant="outline" size="lg" className="w-full mt-6" disabled>
                Fully Booked
              </Button>
            ) : null}
          </Card>
        </div>
      </div>

      {/* Enrollment Confirmation Modal */}
      <Modal
        isOpen={showEnrollModal}
        onClose={() => setShowEnrollModal(false)}
        title="Confirm Enrollment"
      >
        <div className="space-y-4">
          {enrollError && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{enrollError}</p>
            </div>
          )}

          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to enroll in <strong>{activity.title}</strong>?
          </p>

          <div className="p-4 rounded-lg bg-primary-50 dark:bg-primary-900/20">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              📅 {formatDate(activity.startDate)} at {formatTime(activity.startDate)}
              <br />
              📍 {activity.location}
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowEnrollModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleEnroll}
              isLoading={enrollMutation.isPending}
            >
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
