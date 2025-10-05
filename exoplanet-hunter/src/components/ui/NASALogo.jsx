import React from 'react';

const NASALogo = ({ className = "w-full h-full", ...props }) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={className}
      {...props}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* NASA Logo Blue Circle Background */}
      <circle 
        cx="50" 
        cy="50" 
        r="48" 
        fill="#0B3D91" 
        stroke="#ffffff" 
        strokeWidth="1"
      />
      
      {/* Stars */}
      <g fill="white">
        <circle cx="20" cy="25" r="0.8"/>
        <circle cx="25" cy="20" r="0.6"/>
        <circle cx="30" cy="18" r="0.4"/>
        <circle cx="75" cy="30" r="0.6"/>
        <circle cx="80" cy="25" r="0.8"/>
        <circle cx="85" cy="20" r="0.4"/>
        <circle cx="15" cy="75" r="0.6"/>
        <circle cx="20" cy="80" r="0.4"/>
        <circle cx="75" cy="75" r="0.8"/>
        <circle cx="80" cy="80" r="0.6"/>
        <circle cx="25" cy="70" r="0.4"/>
        <circle cx="70" cy="25" r="0.4"/>
      </g>
      
      {/* Bright Stars (4-pointed) */}
      <g fill="white" stroke="white" strokeWidth="0.3">
        <path d="M35,15 L36,17 L38,16 L36,18 L35,20 L34,18 L32,16 L34,17 Z"/>
        <path d="M65,35 L66,37 L68,36 L66,38 L65,40 L64,38 L62,36 L64,37 Z"/>
        <path d="M25,85 L26,87 L28,86 L26,88 L25,90 L24,88 L22,86 L24,87 Z"/>
        <path d="M85,65 L86,67 L88,66 L86,68 L85,70 L84,68 L82,66 L84,67 Z"/>
      </g>
      
      {/* Orbital Path */}
      <ellipse 
        cx="50" 
        cy="50" 
        rx="35" 
        ry="20" 
        fill="none" 
        stroke="white" 
        strokeWidth="1.5" 
        opacity="0.8"
      />
      
      {/* NASA Text */}
      <text 
        x="50" 
        y="60" 
        textAnchor="middle" 
        fill="white" 
        fontSize="24" 
        fontWeight="bold" 
        fontFamily="Arial, sans-serif"
        letterSpacing="2"
      >
        NASA
      </text>
      
      {/* Red Swoosh */}
      <path 
        d="M15,15 Q50,40 85,25 Q80,30 75,35 Q50,50 25,35 Q20,30 15,25 Z" 
        fill="#FC3D21" 
        opacity="0.9"
      />
      
      {/* Additional orbital detail */}
      <circle cx="50" cy="50" r="2" fill="white" opacity="0.6"/>
    </svg>
  );
};

export default NASALogo;