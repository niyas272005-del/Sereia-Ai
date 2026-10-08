import React from 'react';
import { Outlet } from 'react-router-dom';
import { Moon, Sun, Sparkles } from 'lucide-react';
import { useTheme } from '../common/ThemeProvider';
import Logo from '../common/Logo';

const AuthLayout = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden transition-colors duration-500"
      style={{ background: 'var(--q-bg)' }}
    >
      {/* Animated Background Gradient Blobs */}
      <div className="absolute inset-0 overflow-hidden z-0" aria-hidden="true">
        {/* Top-left — Blue */}
        <div
          className="absolute -top-[20%] -left-[15%] w-[55vw] h-[55vw] rounded-full animate-blob opacity-40 dark:opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.35) 0%, rgba(59,130,246,0.2) 40%, transparent 70%)' }}
        />
        {/* Top-right — Violet */}
        <div
          className="absolute -top-[15%] -right-[15%] w-[50vw] h-[50vw] rounded-full animate-blob animation-delay-2000 opacity-35 dark:opacity-18"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, rgba(167,139,250,0.15) 40%, transparent 70%)' }}
        />
        {/* Bottom-center — Cyan */}
        <div
          className="absolute -bottom-[25%] left-[15%] w-[55vw] h-[55vw] rounded-full animate-blob-slow animation-delay-4000 opacity-30 dark:opacity-15"
          style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.25) 0%, rgba(56,189,248,0.12) 40%, transparent 70%)' }}
        />

        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-5 right-5 z-20 p-2.5 rounded-xl
          glass-card border border-white/25 dark:border-white/8
          text-slate-600 dark:text-slate-300 hover:scale-105 active:scale-95
          transition-transform shadow-sm"
        aria-label="Toggle Theme"
      >
        {isDarkMode
          ? <Sun size={18} className="text-amber-400" />
          : <Moon size={18} />
        }
      </button>

      {/* Main Content Area */}
      <div className="relative z-10 w-full max-w-[420px] px-4 py-10 flex flex-col animate-fade-in-up">
        {/* Brand Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          {/* Logo */}
          <div className="mb-6">
            <Logo size="xl" className="justify-center" />
          </div>
          
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">
            Your compassionate mental health AI companion
          </p>

          {/* Premium Badge */}
          <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full
            bg-gradient-to-r from-blue-500/10 to-violet-500/10
            border border-indigo-200/40 dark:border-indigo-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 tracking-wide">
              AI-Powered · End-to-End Encrypted
            </span>
          </div>
        </div>

        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
