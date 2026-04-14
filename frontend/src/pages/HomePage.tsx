import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useQuery } from '@tanstack/react-query';
import { activityService } from '../services';
import {
  CalendarDaysIcon,
  UserGroupIcon,
  ArrowRightIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  ClockIcon,
  MapPinIcon,
  SparklesIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function HomePage() {
  const { isAuthenticated, getRedirectPath } = useAuthStore();
  const navigate = useNavigate();

  const { data: activitiesData } = useQuery({
    queryKey: ['activities', 'homepage'],
    queryFn: () => activityService.getActivities({ status: 'published', limit: 4 }),
  });

  const activities = activitiesData?.data || [];
  const totalEvents = activitiesData?.pagination?.total || 0;

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate(getRedirectPath());
    } else {
      navigate('/register');
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });

  const formatTime = (date: string) =>
    new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="overflow-hidden">
      {/* ======= HERO ======= */}
      <section className="relative min-h-[92vh] flex items-center">
        {/* Background Art */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20 blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-blue-500/15 to-primary-500/15 blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-gradient-radial from-primary-500/5 to-transparent" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
            style={{
              backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left - Copy */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
            >
              <motion.div
                variants={fadeUp}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/40 mb-6"
              >
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                  {totalEvents > 0 ? `${totalEvents} events live now` : 'Open for registrations'}
                </span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold font-display leading-[1.1] tracking-tight mb-6"
              >
                <span className="text-gray-900 dark:text-white">Your Campus.</span>
                <br />
                <span className="text-gray-900 dark:text-white">Your Events.</span>
                <br />
                <span className="bg-gradient-to-r from-primary-600 via-primary-400 to-secondary-500 bg-clip-text text-transparent">
                  One Platform.
                </span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-lg leading-relaxed"
              >
                Discover workshops, seminars, cultural fests, and tech events happening at your college. 
                Enroll in one click. Never miss what matters.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleGetStarted}
                  className="group px-7 py-3.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transition-all"
                >
                  {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
                  <ArrowRightIcon className="w-4 h-4 ml-2 inline group-hover:translate-x-1 transition-transform" />
                </motion.button>

                <Link to="/activities">
                  <motion.button
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-7 py-3.5 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:border-primary-300 dark:hover:border-primary-700 hover:text-primary-600 dark:hover:text-primary-400 transition-all"
                  >
                    Browse Events
                  </motion.button>
                </Link>
              </motion.div>

              {/* Trust indicators */}
              <motion.div variants={fadeUp} className="flex items-center gap-6 mt-10">
                {[
                  { icon: ShieldCheckIcon, text: 'Secure & Private' },
                  { icon: CheckBadgeIcon, text: 'Role-Based Access' },
                  { icon: SparklesIcon, text: 'Real-Time Updates' },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <item.icon className="w-4 h-4 text-primary-500" />
                    <span>{item.text}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right - Live Events Preview */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="relative hidden lg:block"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-secondary-500/10 rounded-3xl blur-2xl" />
              <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-200/60 dark:border-gray-700/60 p-6 shadow-2xl shadow-gray-900/5 dark:shadow-black/20">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <CalendarDaysIcon className="w-4 h-4 text-primary-500" />
                    Upcoming Events
                  </h3>
                  <span className="text-xs text-gray-400">{new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
                </div>

                <div className="space-y-3">
                  {activities.length > 0 ? activities.slice(0, 4).map((activity, i) => (
                    <motion.div
                      key={activity._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                    >
                      <Link
                        to={`/activities/${activity._id}`}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                      >
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/40 dark:to-primary-800/20 flex flex-col items-center justify-center">
                          <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase leading-none">
                            {new Date(activity.startDate).toLocaleDateString('en-IN', { month: 'short' })}
                          </span>
                          <span className="text-lg font-bold text-primary-700 dark:text-primary-300 leading-none">
                            {new Date(activity.startDate).getDate()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            {activity.title}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <ClockIcon className="w-3 h-3" />
                              {formatTime(activity.startDate)}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPinIcon className="w-3 h-3" />
                              {activity.location}
                            </span>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            activity.availableSlots < 5
                              ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                              : 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                          }`}>
                            {activity.availableSlots} left
                          </span>
                        </div>
                      </Link>
                    </motion.div>
                  )) : (
                    [1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-4 p-3">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 animate-pulse" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
                          <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {activities.length > 0 && (
                  <Link to="/activities" className="block mt-4 text-center">
                    <span className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
                      View all events →
                    </span>
                  </Link>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ======= HOW IT WORKS ======= */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-3">
              How It Works
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold font-display text-gray-900 dark:text-white">
              Three steps to get started
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          >
            {[
              {
                step: '01',
                title: 'Create your account',
                desc: 'Sign up as a student or faculty member with your college email. It takes less than a minute.',
                gradient: 'from-primary-500 to-primary-600',
              },
              {
                step: '02',
                title: 'Explore & Enroll',
                desc: 'Browse events by category, department, or date. Found something interesting? Enroll with one click.',
                gradient: 'from-blue-500 to-cyan-500',
              },
              {
                step: '03',
                title: 'Attend & Track',
                desc: 'Get event details on your dashboard. Track your enrolled events and never miss an important date.',
                gradient: 'from-green-500 to-emerald-500',
              },
            ].map((item) => (
              <motion.div
                key={item.step}
                variants={fadeUp}
                className="relative text-center group"
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mx-auto mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <span className="text-white font-bold text-lg">{item.step}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ======= FEATURES ======= */}
      <section className="py-24 bg-gray-50/50 dark:bg-gray-800/20">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-3">
              Features
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold font-display text-gray-900 dark:text-white mb-4">
              Built for how colleges actually work
            </motion.h2>
            <motion.p variants={fadeUp} className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              No bloat, no unnecessary complexity. Just the features your institution needs.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={stagger}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                className="group p-6 rounded-2xl bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-300"
              >
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ======= LIVE EVENTS SECTION (mobile & full) ======= */}
      {activities.length > 0 && (
        <section className="py-24">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={stagger}
            >
              <div className="flex items-end justify-between mb-10">
                <div>
                  <motion.p variants={fadeUp} className="text-sm font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-3">
                    Happening Now
                  </motion.p>
                  <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold font-display text-gray-900 dark:text-white">
                    Upcoming Events
                  </motion.h2>
                </div>
                <motion.div variants={fadeUp}>
                  <Link
                    to="/activities"
                    className="hidden md:flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400"
                  >
                    View All <ArrowRightIcon className="w-4 h-4" />
                  </Link>
                </motion.div>
              </div>

              <motion.div
                variants={stagger}
                className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
              >
                {activities.map((activity) => (
                  <motion.div key={activity._id} variants={fadeUp}>
                    <Link to={`/activities/${activity._id}`} className="group block">
                      <div className="rounded-2xl overflow-hidden bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:shadow-gray-900/5 dark:hover:shadow-black/20 transition-all duration-300 hover:-translate-y-1">
                        {/* Image / Date Header */}
                        <div className="relative h-40 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 overflow-hidden">
                          {activity.posterImage ? (
                            <img src={activity.posterImage} alt={activity.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <CalendarDaysIcon className="w-12 h-12 text-primary-300 dark:text-primary-700" />
                            </div>
                          )}
                          <div className="absolute top-3 left-3">
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white/90 dark:bg-gray-900/90 text-gray-700 dark:text-gray-300 backdrop-blur-sm shadow-sm">
                              {activity.category}
                            </span>
                          </div>
                        </div>

                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            {activity.title}
                          </h3>
                          <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1.5">
                              <CalendarDaysIcon className="w-3.5 h-3.5" />
                              <span>{formatDate(activity.startDate)}</span>
                              <span className="text-gray-300 dark:text-gray-600">·</span>
                              <ClockIcon className="w-3.5 h-3.5" />
                              <span>{formatTime(activity.startDate)}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <MapPinIcon className="w-3.5 h-3.5" />
                              <span className="truncate">{activity.location}</span>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-xs">
                              <UserGroupIcon className="w-3.5 h-3.5 text-gray-400" />
                              <span className="text-gray-500 dark:text-gray-400">
                                {activity.availableSlots}/{activity.capacity}
                              </span>
                            </div>
                            <span className="text-xs font-medium text-primary-600 dark:text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity">
                              View →
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>

              <div className="text-center mt-8 md:hidden">
                <Link to="/activities" className="text-sm font-semibold text-primary-600">
                  View all events →
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ======= CTA ======= */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-3xl overflow-hidden"
          >
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-primary-950 to-gray-900" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-500/20 via-transparent to-transparent" />
            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            <div className="relative z-10 px-8 py-16 md:px-16 md:py-20 text-center">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display text-white mb-4 leading-tight">
                Ready to streamline your
                <br />
                campus events?
              </h2>
              <p className="text-gray-300 mb-8 max-w-xl mx-auto">
                Join your fellow students and faculty. Create an account in 30 seconds and start exploring events today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleGetStarted}
                  className="px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold text-base shadow-xl hover:shadow-2xl transition-all"
                >
                  {isAuthenticated ? 'Go to Dashboard' : 'Create Free Account'}
                </motion.button>
                <Link to="/activities">
                  <motion.button
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-8 py-4 border-2 border-white/20 text-white rounded-xl font-semibold text-base hover:bg-white/10 transition-all w-full sm:w-auto"
                  >
                    Browse Events
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

const features = [
  {
    icon: CalendarDaysIcon,
    title: 'Event Management',
    description: 'Create, edit, and publish events with details like capacity, date, location, and poster images.',
    color: 'from-primary-500 to-primary-600',
  },
  {
    icon: UserGroupIcon,
    title: 'One-Click Enrollment',
    description: 'Students browse and enroll instantly. Real-time slot tracking prevents overbooking.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: ChartBarIcon,
    title: 'Dashboard & Analytics',
    description: 'Separate dashboards for students, faculty, and admins with enrollment stats and activity tracking.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: AcademicCapIcon,
    title: 'Role-Based Access',
    description: 'Students enroll, faculty manage events, admins oversee everything. Each role has tailored views.',
    color: 'from-indigo-500 to-primary-500',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Secure Authentication',
    description: 'JWT-based auth with refresh tokens, rate limiting, and encrypted passwords for production security.',
    color: 'from-orange-500 to-amber-500',
  },
  {
    icon: SparklesIcon,
    title: 'Department Filtering',
    description: 'Filter events by category, department, and date. Search across all activities instantly.',
    color: 'from-secondary-500 to-teal-500',
  },
];
