import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  CalendarIcon, 
  UserGroupIcon, 
  SparklesIcon,
  ArrowRightIcon 
} from '@heroicons/react/24/outline';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-purple-500/5 to-pink-500/10" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold font-display mb-6">
              <span className="gradient-text">Discover</span> Amazing{' '}
              <span className="gradient-text">Events</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8">
              Join activities, connect with peers, and grow together in our vibrant campus community
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/activities">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary text-lg px-8 py-4"
                >
                  Explore Activities
                  <ArrowRightIcon className="w-5 h-5 ml-2 inline" />
                </motion.button>
              </Link>

              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-outline text-lg px-8 py-4"
                >
                  Get Started
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20"
          >
            <FeatureCard
              icon={CalendarIcon}
              title="Diverse Events"
              description="From tech workshops to cultural nights, discover events that match your interests"
            />
            <FeatureCard
              icon={UserGroupIcon}
              title="Easy Enrollment"
              description="Secure your spot with one click and receive instant confirmations"
            />
            <FeatureCard
              icon={SparklesIcon}
              title="Track Progress"
              description="Monitor your activities and earn achievements throughout the semester"
            />
          </motion.div>
        </div>
      </section>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="card-hover text-center"
    >
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
        <Icon className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </motion.div>
  );
}
