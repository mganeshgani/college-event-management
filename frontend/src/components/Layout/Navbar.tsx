import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import {
  SunIcon,
  MoonIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightStartOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Premium Logo SVG ─────────────────────────────────── */
function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0"
    >
      <rect width="40" height="40" rx="10" fill="url(#logo-grad)" />
      {/* Calendar icon stylised */}
      <path
        d="M13 14h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H13a2 2 0 0 1-2-2V16a2 2 0 0 1 2-2z"
        stroke="#fff"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="rgba(255,255,255,0.1)"
      />
      <path d="M11 20h18" stroke="#fff" strokeWidth="1.5" />
      <path d="M17 11v5M23 11v5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
      {/* Spark dot */}
      <circle cx="20" cy="25" r="2.5" fill="#fff" fillOpacity="0.9" />
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366f1" />
          <stop offset="1" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const linkClass = (path: string) =>
    `relative text-sm font-medium transition-all duration-200 py-1 ${
      isActive(path)
        ? 'text-primary-600 dark:text-primary-400'
        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
    }`;

  const mobileLinkClass = (path: string) =>
    `block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive(path)
        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60'
    }`;

  const getNavLinks = () => {
    const links: Array<{ path: string; label: string }> = [];

    if (isAuthenticated && user) {
      if (user.role === 'student') {
        links.push(
          { path: '/activities', label: 'Events' },
          { path: '/dashboard', label: 'Dashboard' },
          { path: '/my-activities', label: 'My Activities' }
        );
      } else if (user.role === 'faculty') {
        links.push(
          { path: '/activities', label: 'Events' },
          { path: '/faculty/dashboard', label: 'Dashboard' },
          { path: '/faculty/my-activities', label: 'My Events' },
          { path: '/create-activity', label: 'Create Event' }
        );
      } else if (user.role === 'admin') {
        links.push(
          { path: '/admin/dashboard', label: 'Dashboard' },
          { path: '/admin/activities', label: 'Activities' },
          { path: '/admin/users', label: 'Users' },
          { path: '/create-activity', label: 'Create Event' }
        );
      }
    } else {
      links.push({ path: '/activities', label: 'Events' });
    }

    return links;
  };

  const navLinks = getNavLinks();

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200/60 dark:border-gray-800/60">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2.5">
              <Logo size={34} />
              <span className="text-lg font-bold font-display text-gray-900 dark:text-white hidden sm:inline tracking-tight">
                Event<span className="text-primary-600 dark:text-primary-400">Hub</span>
              </span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} className={linkClass(link.path)}>
                {link.label}
                {isActive(link.path) && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -bottom-[1px] left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400 rounded-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <SunIcon className="w-5 h-5 text-amber-400" />
              ) : (
                <MoonIcon className="w-5 h-5 text-gray-500" />
              )}
            </motion.button>

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-1">
                <Link
                  to="/profile"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center ring-2 ring-white dark:ring-gray-900">
                    <span className="text-white text-xs font-bold">
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[100px] truncate">
                    {user?.name}
                  </span>
                </Link>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                  aria-label="Logout"
                >
                  <ArrowRightStartOnRectangleIcon className="w-5 h-5" />
                </motion.button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Sign In
                  </motion.button>
                </Link>
                <Link to="/register">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 text-sm font-semibold bg-primary-600 text-white rounded-xl hover:bg-primary-700 shadow-sm transition-all"
                  >
                    Get Started
                  </motion.button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-gray-200/60 dark:border-gray-800/60 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={mobileLinkClass(link.path)}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              <div className="border-t border-gray-200 dark:border-gray-800 my-3" />

              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    className={mobileLinkClass('/profile')}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {user?.name?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{user?.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                      </div>
                    </div>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="space-y-2 pt-2">
                  <Link
                    to="/login"
                    className="block w-full text-center px-4 py-3 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="block w-full text-center px-4 py-3 rounded-xl text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
