import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Users, FileText, Search, User, Settings, Calculator } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from './ui/badge';
import { motion } from 'framer-motion';

const navItems = [
  { id: 'sections', icon: Users, path: '/' },
  { id: 'reports', icon: FileText, path: '/reports' },
  { id: 'search', icon: Search, path: '/search' },
  { id: 'profile', icon: User, path: '/profile' },
  { id: 'settings', icon: Settings, path: '/settings' },
];

export function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { user } = useAuth();

  // Determine nav items based on user role
  let navItems = [
    { id: 'sections', icon: Users, path: '/' },
    { id: 'reports', icon: FileText, path: '/reports' },
    { id: 'search', icon: Search, path: '/search' },
    { id: 'profile', icon: User, path: '/profile' },
    { id: 'settings', icon: Settings, path: '/settings' },
  ];

  if (user?.role === 'student') {
    navItems = [
      { id: 'sections', icon: Users, path: '/' },
      { id: 'calculator', icon: Calculator, path: '/calculator' },
      { id: 'profile', icon: User, path: '/profile' },
      { id: 'settings', icon: Settings, path: '/settings' },
    ];
  }

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname.startsWith('/section');
    }
    return location.pathname === path;
  };

  // Color palette
  const isDark = theme === 'dark';
  const bgColor = isDark ? '#52677D' : '#2563eb'; // custom dark or blue
  const activeColor = isDark ? '#3d4e5e' : '#3b82f6'; // slightly darker than nav bar in dark mode, blue in light mode
  const inactiveColor = isDark ? '#e2e8f0' : '#dbeafe'; // light gray or blue-100
  const hoverColor = isDark ? '#3d4e5e' : '#1e40af'; // deeper custom or deep blue

  return (
    <div
      className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 w-[92%] max-w-md rounded-2xl flex items-center justify-between px-4 py-2"
      style={{ background: bgColor }}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.path);
        return (
          <motion.div
            key={item.id}
            className="flex flex-col items-center w-12"
            animate={active ? { y: -12, scale: 1.18 } : { y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            <button
              onClick={() => navigate(item.path)}
              className="flex items-center justify-center rounded-full transition-colors w-12 h-12"
              style={{
                background: active ? activeColor : 'transparent',
                color: active ? (isDark ? '#fff' : '#fff') : inactiveColor,
                outline: 'none',
                border: 'none',
              }}
              onMouseOver={e => {
                if (!active) e.currentTarget.style.background = hoverColor;
              }}
              onMouseOut={e => {
                if (!active) e.currentTarget.style.background = 'transparent';
              }}
            >
              <Icon className="w-7 h-7" strokeWidth={2.2} />
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}
