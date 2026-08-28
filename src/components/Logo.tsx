import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'footer' | 'monochrome' | 'badge' | 'stacked';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  iconOnly?: boolean;
  layout?: 'horizontal' | 'stacked';
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  variant = 'light',
  size = 'md',
  iconOnly = false,
  layout = 'horizontal',
}) => {
  const isDark = variant === 'dark';
  const isStacked = layout === 'stacked' || variant === 'stacked';

  // Sizing configurations
  const iconSizes = {
    sm: isStacked ? 'w-16 h-16' : 'w-9 h-9',
    md: isStacked ? 'w-24 h-24' : 'w-11 h-11',
    lg: isStacked ? 'w-32 h-32' : 'w-14 h-14',
    xl: isStacked ? 'w-44 h-44' : 'w-20 h-20',
    '2xl': isStacked ? 'w-56 h-56' : 'w-28 h-28',
  };

  const titleSizes = {
    sm: 'text-sm font-black tracking-wider',
    md: isStacked ? 'text-xl font-black tracking-widest' : 'text-base sm:text-lg font-black tracking-wider',
    lg: isStacked ? 'text-2xl sm:text-3xl font-black tracking-widest' : 'text-xl sm:text-2xl font-black tracking-wider',
    xl: isStacked ? 'text-4xl font-black tracking-widest' : 'text-3xl sm:text-4xl font-black tracking-wider',
    '2xl': 'text-5xl font-black tracking-widest',
  };

  const subSizes = {
    sm: 'text-[7.5px] tracking-[0.25em]',
    md: isStacked ? 'text-[11px] tracking-[0.32em]' : 'text-[9px] sm:text-[10px] tracking-[0.28em]',
    lg: isStacked ? 'text-[13px] tracking-[0.36em]' : 'text-[11px] sm:text-[12px] tracking-[0.32em]',
    xl: isStacked ? 'text-[16px] tracking-[0.4em]' : 'text-[14px] sm:text-[15px] tracking-[0.36em]',
    '2xl': 'text-[20px] tracking-[0.45em]',
  };

  return (
    <div
      className={`select-none ${
        isStacked ? 'flex flex-col items-center text-center' : 'inline-flex items-center gap-3'
      } ${className}`}
      id="capitabee-brand-logo"
    >
      {/* Exact Capita Bee House & CB Emblem */}
      <div
        className={`${iconSizes[size]} relative flex-shrink-0 flex items-center justify-center rounded-2xl transition-transform duration-300 hover:scale-105`}
      >
        <svg
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md"
        >
          <defs>
            {/* 3D Blue Gradient for 'C' */}
            <linearGradient id="cbLogoBlueGrad" x1="15%" y1="10%" x2="85%" y2="90%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="35%" stopColor="#0284C7" />
              <stop offset="75%" stopColor="#0369A1" />
              <stop offset="100%" stopColor="#075985" />
            </linearGradient>

            {/* 3D Orange Gradient for 'B' */}
            <linearGradient id="cbLogoOrangeGrad" x1="15%" y1="10%" x2="85%" y2="90%">
              <stop offset="0%" stopColor="#FB923C" />
              <stop offset="35%" stopColor="#EA580C" />
              <stop offset="75%" stopColor="#C2410C" />
              <stop offset="100%" stopColor="#9A3412" />
            </linearGradient>

            {/* House Outline 3D Silver Metallic Gradient */}
            <linearGradient id="cbHouseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="45%" stopColor="#E2E8F0" />
              <stop offset="80%" stopColor="#94A3B8" />
              <stop offset="100%" stopColor="#64748B" />
            </linearGradient>

            {/* Inner Metallic Highlight */}
            <linearGradient id="cbHouseInnerGrad" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="50%" stopColor="#CBD5E1" />
              <stop offset="100%" stopColor="#94A3B8" />
            </linearGradient>

            {/* Subtle 3D Shadow */}
            <filter id="cb3DShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" floodOpacity="0.3" floodColor="#0F172A" />
            </filter>
          </defs>

          {/* 1. OUTER ROOF & CHIMNEY & RIGHT WALL */}
          {/* Left Roof Slope */}
          <path
            d="M48 88 L100 40 L136 72"
            stroke="url(#cbHouseGrad)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#cb3DShadow)"
          />

          {/* Chimney on Right Slope */}
          <path
            d="M136 72 V46 C136 43 138 41 141 41 H147 C150 41 152 43 152 46 V86"
            stroke="url(#cbHouseGrad)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#cb3DShadow)"
          />

          {/* Right Slope Continuation & Wall */}
          <path
            d="M152 86 L158 91 V142"
            stroke="url(#cbHouseGrad)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#cb3DShadow)"
          />

          {/* 2. INNER PARALLEL ROOF & INNER WALL */}
          <path
            d="M58 96 L100 56 L148 98 V142"
            stroke="url(#cbHouseInnerGrad)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.95"
          />

          {/* 3. INNER MONOGRAM 'C' (ROYAL BLUE CRESCENT) */}
          <path
            d="M98 76 C70 76 56 90 56 108 C56 126 70 140 98 140 C80 133 72 121 72 108 C72 95 80 83 98 76 Z"
            fill="url(#cbLogoBlueGrad)"
            filter="url(#cb3DShadow)"
          />

          {/* 4. INNER MONOGRAM 'B' (WARM ORANGE / AMBER WINGS + STEM) */}
          {/* Top Arc of B */}
          <path
            d="M102 76 C124 76 138 86 138 98 C138 106 130 109 116 109 C126 107 130 102 130 96 C130 88 120 82 102 82 Z"
            fill="url(#cbLogoOrangeGrad)"
            filter="url(#cb3DShadow)"
          />

          {/* Bottom Arc of B */}
          <path
            d="M116 109 C132 109 142 114 142 124 C142 136 126 140 102 140 C120 138 132 132 132 124 C132 117 124 113 108 111 Z"
            fill="url(#cbLogoOrangeGrad)"
            filter="url(#cb3DShadow)"
          />

          {/* Central Vertical Stem for B */}
          <rect
            x="98"
            y="88"
            width="8"
            height="40"
            rx="4"
            fill="url(#cbLogoOrangeGrad)"
            filter="url(#cb3DShadow)"
          />
          {/* Middle Connecting Bar */}
          <rect
            x="102"
            y="105"
            width="18"
            height="7"
            rx="3.5"
            fill="url(#cbLogoOrangeGrad)"
          />
        </svg>
      </div>

      {/* Brand Typography */}
      {!iconOnly && (
        <div className={`flex flex-col leading-none ${isStacked ? 'mt-3 items-center' : ''}`}>
          {/* Primary Wordmark: CAPITA BEE */}
          <div
            className={`${titleSizes[size]} font-black uppercase tracking-[0.14em] flex items-center gap-1.5 ${
              isDark ? 'text-white' : 'text-[#2D332E]'
            }`}
          >
            <span>CAPITA</span>
            <span className={isDark ? 'text-[#F8FAFC]' : 'text-[#2D332E]'}>BEE</span>
          </div>

          {/* Secondary Subtitle: — FINANCIAL SERVICES — */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="h-[1.5px] w-3 sm:w-4 bg-[#EA580C] rounded-full inline-block"></span>
            <span
              className={`${subSizes[size]} font-extrabold text-[#EA580C] uppercase tracking-[0.24em] whitespace-nowrap`}
            >
              FINANCIAL SERVICES
            </span>
            <span className="h-[1.5px] w-3 sm:w-4 bg-[#EA580C] rounded-full inline-block"></span>
          </div>
        </div>
      )}
    </div>
  );
};

