import React from 'react';

const ExpensesIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 10v4h1a2 2 0 0 1 0 4h-2a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h1Z"></path>
    <path d="M6 18h1"></path>
    <path d="M10 18h1"></path>
    <path d="M14 18h1"></path>
    <path d="M18 18h1"></path>
    <path d="M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z"></path>
  </svg>
);

export default ExpensesIcon;
