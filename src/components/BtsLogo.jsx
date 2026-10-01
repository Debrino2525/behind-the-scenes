import React from 'react';

export default function BtsLogo({ className = "w-8 h-8", color = "currentColor", variant = "gradient" }) {
  if (variant === "gradient") {
    return (
      <div className={`relative ${className} flex items-center justify-center`}>
        <svg viewBox="0 0 400 400" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="btsLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFB800" />
              <stop offset="50%" stopColor="#E03638" />
              <stop offset="100%" stopColor="#008751" />
            </linearGradient>
            <linearGradient id="btsGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFE066" />
              <stop offset="100%" stopColor="#FFB800" />
            </linearGradient>
          </defs>

          {/* Film Reel (top left circle with spokes) */}
          <circle cx="150" cy="120" r="55" fill="url(#btsGoldGrad)" />
          {/* Spoke cutouts */}
          <circle cx="150" cy="120" r="14" fill="#0e1015" />
          <path d="M150 78 A42 42 0 0 1 182 96 L164 108 A20 20 0 0 0 150 99 Z" fill="#0e1015" />
          <path d="M188 108 A42 42 0 0 1 188 142 L168 130 A20 20 0 0 0 168 116 Z" fill="#0e1015" />
          <path d="M180 152 A42 42 0 0 1 150 162 L150 141 A20 20 0 0 0 164 135 Z" fill="#0e1015" />
          <path d="M140 162 A42 42 0 0 1 112 142 L132 130 A20 20 0 0 0 136 141 Z" fill="#0e1015" />
          <path d="M112 132 A42 42 0 0 1 118 96 L136 108 A20 20 0 0 0 132 120 Z" fill="#0e1015" />

          {/* Heart Right Lobe */}
          <path 
            d="M190 120 C190 70 250 65 275 105 C295 135 285 175 235 220 L195 255 L155 220 C145 210 135 200 130 190" 
            fill="url(#btsGoldGrad)" 
          />

          {/* Main Camera Body (rounded rectangle) */}
          <rect x="115" y="170" width="160" height="135" rx="20" fill="url(#btsLogoGrad)" />

          {/* Heart V cutout highlight on camera body */}
          <path 
            d="M115 170 L195 245 L275 170" 
            stroke="#0e1015" 
            strokeWidth="16" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />

          {/* Camera Lens (right nozzle) */}
          <path 
            d="M280 205 L292 205 L328 185 L328 270 L292 250 L280 250 Z" 
            fill="url(#btsGoldGrad)" 
          />
        </svg>
      </div>
    );
  }

  // Monochrome Solid Variant
  return (
    <div className={`relative ${className} flex items-center justify-center`}>
      <svg viewBox="0 0 400 400" className="w-full h-full" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        {/* Film Reel */}
        <circle cx="150" cy="120" r="55" fill="currentColor" />
        <circle cx="150" cy="120" r="14" fill="#0e1015" />
        <path d="M150 78 A42 42 0 0 1 182 96 L164 108 A20 20 0 0 0 150 99 Z" fill="#0e1015" />
        <path d="M188 108 A42 42 0 0 1 188 142 L168 130 A20 20 0 0 0 168 116 Z" fill="#0e1015" />
        <path d="M180 152 A42 42 0 0 1 150 162 L150 141 A20 20 0 0 0 164 135 Z" fill="#0e1015" />
        <path d="M140 162 A42 42 0 0 1 112 142 L132 130 A20 20 0 0 0 136 141 Z" fill="#0e1015" />
        <path d="M112 132 A42 42 0 0 1 118 96 L136 108 A20 20 0 0 0 132 120 Z" fill="#0e1015" />

        {/* Heart Right Lobe */}
        <path d="M190 120 C190 70 250 65 275 105 C295 135 285 175 235 220 L195 255 L155 220" fill="currentColor" />

        {/* Camera Body */}
        <rect x="115" y="170" width="160" height="135" rx="20" fill="currentColor" />

        {/* Cutout */}
        <path d="M115 170 L195 245 L275 170" stroke="#0e1015" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />

        {/* Lens */}
        <path d="M280 205 L292 205 L328 185 L328 270 L292 250 L280 250 Z" fill="currentColor" />
      </svg>
    </div>
  );
}
