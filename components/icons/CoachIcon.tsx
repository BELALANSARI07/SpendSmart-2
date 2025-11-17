import React from 'react';

const CoachIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 6V2H8v4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3Z"></path>
    <path d="M12 6V1h4v5"></path>
    <path d="M10 13h4"></path>
    <path d="M12 11v4"></path>
  </svg>
);

export default CoachIcon;
