import React from 'react';
import { useTheme } from 'next-themes';

interface EducHubHeaderProps {
  subtitle?: string;
  className?: string;
}

const EducHubHeader: React.FC<EducHubHeaderProps> = ({ subtitle, className = '' }) => {
  const { theme } = useTheme();
  const hubColor = theme === 'dark' ? '#52677D' : '#2563eb';
  return (
    <div className={`pt-6 pb-2 ${className}`}>
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-center" style={{ color: hubColor }}>EducHub</h1>
      {subtitle && (
        <div className="text-lg font-medium text-center text-gray-500 dark:text-gray-300 mt-1">{subtitle}</div>
      )}
    </div>
  );
};

export default EducHubHeader; 