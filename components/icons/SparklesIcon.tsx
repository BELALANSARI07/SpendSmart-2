import React from 'react';

const SparklesIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2a2.83 2.83 0 0 0 2 5 2.83 2.83 0 0 0 5 2 2.83 2.83 0 0 0-2 5 2.83 2.83 0 0 0-5 2 2.83 2.83 0 0 0-2-5 2.83 2.83 0 0 0-5-2 2.83 2.83 0 0 0 2-5 2.83 2.83 0 0 0 5-2Z"></path>
  </svg>
);

export default SparklesIcon;
