import React from 'react';
import GradeCalculator from '@/components/GradeCalculator';
import MarkItHeader from '@/components/MarkItHeader';
import { useTheme } from 'next-themes';
import { useBottomNav } from '@/hooks/use-mobile';

const GradeCalculatorPage: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { bottomNavClass } = useBottomNav();
  return (
    <div className={`min-h-screen flex flex-col ${bottomNavClass} ${isDark ? 'bg-[#0F1A2B] text-white' : 'bg-background'}`}>
      <MarkItHeader subtitle="Calculator" />
      <div className="flex-1 pb-mobile-content">
        <GradeCalculator />
      </div>
    </div>
  );
};

export default GradeCalculatorPage; 