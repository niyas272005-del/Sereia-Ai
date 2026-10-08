import React from 'react';
import { cn } from '../../utils/cn';

const Loader = ({ className, size = 24, fullScreen = false }) => {
  const Spinner = (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* Outer ring */}
      <svg
        className="animate-spin"
        style={{ width: size, height: size }}
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle
          className="opacity-10"
          cx="12" cy="12" r="10"
          stroke="url(#spinnerGrad)"
          strokeWidth="2.5"
        />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke="url(#spinnerGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="spinnerGrad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4"
        style={{ background: 'var(--q-bg)' }}>
        <div className="relative">
          {/* Glow blob behind spinner */}
          <div className="absolute inset-0 -m-8 rounded-full opacity-30 animate-pulse"
            style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)' }}
          />
          <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl
            bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600 shadow-xl shadow-indigo-500/30">
            {Spinner}
          </div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Loading</p>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce-soft animation-delay-${i * 150}`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-6">
      {Spinner}
    </div>
  );
};

export default Loader;
