import React from 'react';
import './Kangaroo.css';

const Kangaroo = () => {
  return (
    <div className="kangaroo-container">
      <svg
        className="kangaroo"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Simple Kangaroo Shape */}
        <path
          d="M20 80 Q 10 70 15 60 L 25 30 Q 30 10 50 10 Q 70 10 75 30 L 70 50 Q 80 40 90 45 Q 95 50 85 60 L 75 70 L 80 90 L 60 90 L 55 70 L 45 70 L 40 90 L 20 90 Z"
          fill="#D2691E" 
          stroke="none"
        />
        <circle cx="55" cy="25" r="3" fill="black" />
        <path d="M40 90 L 20 90" stroke="black" strokeWidth="2" />
        <path d="M80 90 L 60 90" stroke="black" strokeWidth="2" />
        
        {/* Tail */}
        <path d="M20 80 Q 5 80 5 60" stroke="#D2691E" strokeWidth="4" fill="none" />
        
        {/* Pouch area hint */}
        <path d="M45 50 Q 55 60 65 50" stroke="#8B4513" strokeWidth="1" fill="none" />
      </svg>
    </div>
  );
};

export default Kangaroo;
