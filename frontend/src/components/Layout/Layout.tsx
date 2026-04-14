import { Outlet, Link } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-gray-200/60 dark:border-gray-800/60 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-2.5 group">
              <svg width="24" height="24" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="40" rx="10" fill="url(#footer-grad)" />
                <path d="M13 14h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H13a2 2 0 0 1-2-2V16a2 2 0 0 1 2-2z" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="rgba(255,255,255,0.1)" />
                <path d="M11 20h18" stroke="#fff" strokeWidth="1.5" />
                <path d="M17 11v5M23 11v5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
                <circle cx="20" cy="25" r="2.5" fill="#fff" fillOpacity="0.9" />
                <defs><linearGradient id="footer-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse"><stop stopColor="#6366f1" /><stop offset="1" stopColor="#06b6d4" /></linearGradient></defs>
              </svg>
              <span className="text-sm font-bold font-display text-gray-700 dark:text-gray-300 tracking-tight">
                Event<span className="text-primary-600 dark:text-primary-400">Hub</span>
              </span>
            </Link>
            <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
              <Link to="/activities" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Browse Events</Link>
              <Link to="/register" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Create Account</Link>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-600">
              &copy; {new Date().getFullYear()} EventHub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
