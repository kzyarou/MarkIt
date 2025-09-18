import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Users, FileText, Search, MessageCircle, Plus } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

export function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { t } = useLanguage();

  // Fixed bottom nav for mobile: Home, Dashboard, Create, Search, Messages
  const navItems = [
    { id: 'homepage', icon: Users, path: '/', label: t('nav_home') || 'Home' },
    { id: 'mydashboard', icon: FileText, path: '/mydashboard', label: t('nav_mydashboard') || 'My Dashboard' },
    { id: 'create', icon: Plus, path: '/create-harvest', label: t('nav_create') || 'Create' },
    { id: 'search', icon: Search, path: '/search', label: t('nav_search') || 'Search' },
    { id: 'messages', icon: MessageCircle, path: '/messages', label: t('nav_messages') || 'Messages' },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname.startsWith('/section');
    }
    if (path === '/create-harvest') {
      return location.pathname === '/create-harvest' || location.pathname.startsWith('/create-');
    }
    return location.pathname === path;
  };

  // Color palette
  const isDark = theme === 'dark';
  const bgColor = isDark ? 'rgba(20, 27, 34, 0.85)' : 'rgba(255, 255, 255, 0.85)';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
  const shadowColor = isDark ? 'rgba(0, 0, 0, 0.35)' : 'rgba(0, 0, 0, 0.08)';
  const activeColor = isDark ? '#3d4e5e' : '#3b82f6';
  const inactiveColor = isDark ? '#e2e8f0' : '#1f2937';

  const gridCols = 'grid-cols-5';

  return (
    <motion.nav
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="bottom-nav-fixed inset-x-0 z-50"
      style={{
        bottom: 'env(safe-area-inset-bottom, 0px)',
        position: 'fixed',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden'
      }}
      role="tablist"
      aria-label={t('bottom_nav') || 'Bottom navigation'}
    >
      <div
        className="mx-auto w-[calc(100%-24px)] max-w-md rounded-2xl px-2 py-1 backdrop-blur-md mb-2"
        style={{
          background: bgColor,
          border: `1px solid ${borderColor}`
,
          boxShadow: `0 8px 30px ${shadowColor}`
        }}
      >
        <div className={`relative grid ${gridCols} items-end gap-1`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <div key={item.id} className="relative flex flex-col items-center justify-end py-1">
                <motion.button
                  onClick={() => navigate(item.path)}
                  className="relative flex items-center justify-center w-14 h-14"
                  whileTap={{ scale: 0.92 }}
                  transition={{ type: 'spring', stiffness: 600, damping: 35 }}
                  role="tab"
                  aria-selected={active}
                  aria-label={item.label}
                >
                  {active && (
                    <motion.div
                      layoutId="activeBg"
                      className="absolute inset-0 rounded-full"
                      style={{ background: activeColor }}
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <Icon className="w-7 h-7 relative" strokeWidth={2.2} color={active ? '#ffffff' : inactiveColor} />
                </motion.button>

                <div className="h-5 mt-0.5">
                  <AnimatePresence initial={false}>
                    {active && (
                      <motion.span
                        key="label"
                        className="text-[11px] font-medium"
                        style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 0.95, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.18 }}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}
