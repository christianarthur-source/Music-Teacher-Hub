import React from 'react';

interface LogoProps {
  collapsed?: boolean;
  teacherName?: string;
  appName?: string;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  collapsed = false,
  teacherName = 'Christian Arthur',
  appName = 'Music Teacher Hub',
  className = ''
}) => {
  return (
    <div className={`flex items-center gap-3 overflow-hidden select-none ${className}`}>
      {/* Musical Emblem Icon */}
      <div className="relative shrink-0 group">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 p-0.5 shadow-md shadow-rose-500/20 group-hover:shadow-rose-500/35 transition-all duration-300 transform group-hover:scale-105">
          <div className="w-full h-full bg-stone-900 rounded-[14px] flex items-center justify-center overflow-hidden relative">
            {/* Background soundwaves */}
            <svg
              viewBox="0 0 40 40"
              className="absolute inset-0 w-full h-full opacity-25"
              fill="none"
              stroke="currentColor"
            >
              <circle cx="20" cy="20" r="16" stroke="url(#logo-grad)" strokeWidth="1" strokeDasharray="2 3" />
              <circle cx="20" cy="20" r="10" stroke="url(#logo-grad)" strokeWidth="0.75" />
            </svg>

            {/* Glowing Clef & Notes SVG */}
            <svg
              viewBox="0 0 24 24"
              className="w-6 h-6 text-white drop-shadow relative z-10 transition-transform duration-300 group-hover:rotate-6"
              fill="none"
              stroke="url(#logo-grad)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <defs>
                <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="50%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#818cf8" />
                </linearGradient>
              </defs>
              {/* Connected eighth notes */}
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" fill="url(#logo-grad)" stroke="none" />
              <circle cx="18" cy="16" r="3" fill="url(#logo-grad)" stroke="none" />
              {/* Vibrant beam bar */}
              <line x1="9" y1="5" x2="21" y2="3" stroke="url(#logo-grad)" strokeWidth="3.5" />
            </svg>
          </div>
        </div>

        {/* Floating playful music dot */}
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-white dark:border-stone-900 animate-pulse" />
      </div>

      {/* Title & Teacher Subtitle */}
      {!collapsed && (
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h1 className="font-extrabold text-sm sm:text-[15px] tracking-tight text-stone-900 dark:text-white leading-tight whitespace-nowrap bg-clip-text text-transparent bg-gradient-to-r from-stone-900 via-stone-800 to-indigo-950 dark:from-white dark:via-stone-100 dark:to-indigo-200">
              {appName}
            </h1>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300/50">
              ♫ K-6
            </span>
          </div>
          <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 truncate leading-none mt-0.5 tracking-tight flex items-center gap-1">
            <span>{teacherName}</span>
          </p>
        </div>
      )}
    </div>
  );
};
