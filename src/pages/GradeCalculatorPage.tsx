import React from 'react';
import GradeCalculator from '@/components/GradeCalculator';
import EducHubHeader from '@/components/EducHubHeader';
import { useTheme } from 'next-themes';

const GradeCalculatorPage: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <div className={`min-h-screen pb-20 flex flex-col ${isDark ? 'bg-[#0F1A2B] text-white' : 'bg-background'}`}>
      <EducHubHeader subtitle="Calculator" />
      <GradeCalculator />
    </div>
  );
};

export default GradeCalculatorPage; 