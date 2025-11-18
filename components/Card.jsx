import React from 'react';

const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-gray-800 border border-gray-700 rounded-lg p-4 sm:p-6 flex flex-col ${className}`}>
      {children}
    </div>
  );
};

export default Card;
