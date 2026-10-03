import React from 'react';

interface RobotBuddyProps {
  className?: string;
  size?: number;
  animate?: boolean;
}

export const RobotBuddy: React.FC<RobotBuddyProps> = ({
  className = '',
  size = 90,
  animate = true,
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className} ${
        animate ? 'animate-float' : ''
      }`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-xl"
      >
        <defs>
          {/* Body Gradient: Glossy Ceramic White with soft lavender shading */}
          <linearGradient id="bodyGrad" x1="30" y1="20" x2="170" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#F1F4FD" />
            <stop offset="100%" stopColor="#D9E2F8" />
          </linearGradient>

          {/* Face Visor Gradient: Deep glossy indigo-violet */}
          <linearGradient id="visorGrad" x1="50" y1="60" x2="150" y2="140" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1E1238" />
            <stop offset="60%" stopColor="#140C28" />
            <stop offset="100%" stopColor="#0B0616" />
          </linearGradient>

          {/* Eye Glow Gradient: Electric violet-cyan */}
          <linearGradient id="eyeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818CF8" />
            <stop offset="60%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#A855F7" />
          </linearGradient>

          {/* Ear / Headphone Accent: Purple-indigo metallic */}
          <linearGradient id="earGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9333EA" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>

          {/* Soft Shadow Filter */}
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Headphone Band */}
        <path
          d="M 38 90 C 38 40, 162 40, 162 90"
          stroke="url(#earGrad)"
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
        />

        {/* Left Ear / Headphone Cup */}
        <rect x="24" y="70" width="18" height="42" rx="9" fill="url(#earGrad)" />
        <rect x="28" y="76" width="10" height="30" rx="5" fill="#311B65" />
        <circle cx="33" cy="91" r="2.5" fill="#C084FC" />

        {/* Right Ear / Headphone Cup */}
        <rect x="158" y="70" width="18" height="42" rx="9" fill="url(#earGrad)" />
        <rect x="162" y="76" width="10" height="30" rx="5" fill="#311B65" />
        <circle cx="167" cy="91" r="2.5" fill="#C084FC" />

        {/* Little Antenna on Top */}
        <rect x="96" y="24" width="8" height="18" rx="4" fill="url(#earGrad)" />
        <circle cx="100" cy="22" r="7" fill="#EC4899" filter="url(#softGlow)" />
        <circle cx="100" cy="22" r="3" fill="#FFFFFF" />

        {/* Robot Head Body (Soft rounded squircle) */}
        <rect x="36" y="44" width="128" height="106" rx="46" fill="url(#bodyGrad)" />

        {/* Head Gloss Highlight */}
        <ellipse cx="90" cy="56" rx="40" ry="12" fill="#FFFFFF" opacity="0.8" />

        {/* Visor Screen (Dark glossy screen inside head) */}
        <rect x="50" y="66" width="100" height="66" rx="28" fill="url(#visorGrad)" />

        {/* Visor Screen Reflection Gloss */}
        <ellipse cx="85" cy="74" rx="26" ry="7" fill="#FFFFFF" opacity="0.15" />

        {/* Left Glowing Eye */}
        <ellipse cx="78" cy="96" rx="10" ry="14" fill="url(#eyeGrad)" filter="url(#softGlow)" />
        <ellipse cx="78" cy="96" rx="7" ry="11" fill="#C084FC" />
        <circle cx="75" cy="91" r="3" fill="#FFFFFF" />

        {/* Right Glowing Eye */}
        <ellipse cx="122" cy="96" rx="10" ry="14" fill="url(#eyeGrad)" filter="url(#softGlow)" />
        <ellipse cx="122" cy="96" rx="7" ry="11" fill="#C084FC" />
        <circle cx="119" cy="91" r="3" fill="#FFFFFF" />

        {/* Cute Smiling Mouth Indicator on Visor */}
        <path
          d="M 94 112 Q 100 117 106 112"
          stroke="#C084FC"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Cute Pink Cheeks */}
        <circle cx="64" cy="110" r="5" fill="#F472B6" opacity="0.4" />
        <circle cx="136" cy="110" r="5" fill="#F472B6" opacity="0.4" />

        {/* Small Robot Body under head */}
        <rect x="74" y="146" width="52" height="34" rx="16" fill="url(#bodyGrad)" />
        {/* Chest Core Button */}
        <circle cx="100" cy="160" r="6" fill="#6366F1" />
        <circle cx="100" cy="160" r="2.5" fill="#FFFFFF" />

        {/* Left Arm */}
        <rect x="56" y="148" width="16" height="26" rx="8" fill="url(#bodyGrad)" />
        {/* Right Arm */}
        <rect x="128" y="148" width="16" height="26" rx="8" fill="url(#bodyGrad)" />
      </svg>
    </div>
  );
};
