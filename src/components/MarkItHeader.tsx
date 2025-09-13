import React from 'react';
import { useTheme } from 'next-themes';

interface MarkItHeaderProps {
  subtitle?: string;
  className?: string;
}

const MarkItHeader: React.FC<MarkItHeaderProps> = ({ subtitle, className = '' }) => {
  const { theme } = useTheme();
  const markItColor = theme === 'dark' ? '#16a34a' : '#15803d'; // Green colors for MarkIt
  return (
    <div className={`pt-6 pb-2 ${className}`}>
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-center" style={{ color: markItColor }}>MarkIt</h1>
      {subtitle && (
        <div className="text-lg font-medium text-center text-gray-500 dark:text-gray-300 mt-1">{subtitle}</div>
      )}
    </div>
  );
};

export default MarkItHeader;


