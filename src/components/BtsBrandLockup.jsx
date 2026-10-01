import React from 'react';

/**
 * Official Behind The Scenes Heart-Camera Emblem
 * Champagne/Cream (#F2E9D8) on Dark Background
 */
export function BtsEmblem({ className = "w-8 h-8", color = "#F2E9D8" }) {
  return (
    <div className={`relative ${className} flex items-center justify-center`}>
      <svg 
        viewBox="0 0 400 400" 
        className="w-full h-full" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Film Reel Circle (Top Left) */}
        <circle cx="160" cy="130" r="50" fill={color} />
        {/* Film Reel Spoke Cutouts */}
        <circle cx="160" cy="130" r="14" fill="#0d0e11" />
        <path d="M160 92 A38 38 0 0 1 190 108 L174 119 A18 18 0 0 0 160 110 Z" fill="#0d0e11" />
        <path d="M195 119 A38 38 0 0 1 195 150 L176 139 A18 18 0 0 0 176 127 Z" fill="#0d0e11" />
        <path d="M188 159 A38 38 0 0 1 160 168 L160 148 A18 18 0 0 0 173 143 Z" fill="#0d0e11" />
        <path d="M151 168 A38 38 0 0 1 126 150 L144 139 A18 18 0 0 0 148 149 Z" fill="#0d0e11" />
        <path d="M125 141 A38 38 0 0 1 130 108 L147 119 A18 18 0 0 0 143 130 Z" fill="#0d0e11" />

        {/* Right Lobe of Heart */}
        <path 
          d="M195 130 C195 85 245 80 270 115 C290 145 280 180 235 225 L200 258 L165 225" 
          fill={color} 
        />

        {/* Main Camera Body Block */}
        <rect x="130" y="175" width="140" height="120" rx="16" fill={color} />

        {/* Deep V-Neck Notch Separating Reel/Lobe from Body */}
        <path 
          d="M130 175 L200 248 L270 175" 
          stroke="#0d0e11" 
          strokeWidth="18" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />

        {/* Right Camera Lens Nozzle */}
        <path 
          d="M270 205 L280 205 L310 185 L310 265 L280 245 L270 245 Z" 
          fill={color} 
        />
      </svg>
    </div>
  );
}

/**
 * Official Behind The Scenes Full Brand Lockup
 * Emblem + "BEHIND" + Vertical Rotated "THE" + "SCENES"
 * High-fashion serif typography (#F2E9D8)
 */
export default function BtsBrandLockup({ size = "md", onClick }) {
  const isSm = size === "sm";

  return (
    <div 
      onClick={onClick}
      className="flex flex-col items-center select-none cursor-pointer group"
    >
      {/* Emblem */}
      <BtsEmblem className={isSm ? "w-8 h-8" : "w-14 h-14"} color="#F2E9D8" />

      {/* Typographic Lockup */}
      <div className={`mt-1 flex flex-col items-center ${isSm ? "scale-90" : "scale-100"}`}>
        {/* BEHIND */}
        <span 
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          className="text-[#F2E9D8] tracking-[0.18em] font-medium text-xs leading-none"
        >
          BEHIND
        </span>

        {/* Vertical THE + SCENES */}
        <div className="flex items-center gap-1.5 mt-0.5">
          {/* Vertical rotated THE */}
          <span 
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-[#F2E9D8] text-[8px] font-bold tracking-[0.25em] -rotate-90 transform origin-center -ml-1 inline-block"
          >
            THE
          </span>

          {/* SCENES */}
          <span 
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-[#F2E9D8] tracking-[0.18em] font-medium text-xs leading-none"
          >
            SCENES
          </span>
        </div>
      </div>
    </div>
  );
}
