import React from 'react';
import { Brain, Sparkles } from 'lucide-react';
import { cn } from '../../utils/cn';

const Logo = ({ size = 'md', className, withText = true, animated = true }) => {
  // Configurable sizes
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20'
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 28,
    xl: 36
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl',
    xl: 'text-4xl'
  };

  const subTextSizes = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-xs',
    xl: 'text-sm'
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative group cursor-pointer">
        {/* Glow behind the logo */}
        <div className={cn(
          "absolute -inset-1 rounded-3xl blur-md opacity-40 group-hover:opacity-80 transition duration-500",
          "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500",
          animated && "group-hover:animate-pulse"
        )} />
        
        {/* Main Logo Container */}
        <div className={cn(
          "relative flex items-center justify-center rounded-[1.25rem]",
          "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500",
          "shadow-xl shadow-indigo-500/40 overflow-hidden",
          sizeClasses[size]
        )}>
          {/* Glass/Lighting overlays */}
          <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent mix-blend-overlay" />
          <div className="absolute top-0 right-0 w-full h-1/2 bg-gradient-to-b from-white/30 to-transparent mix-blend-overlay" />
          
          {/* Icons */}
          <div className={cn(
            "relative text-white z-10 transition-transform duration-500 flex items-center justify-center",
            animated && "group-hover:scale-110 group-hover:rotate-6"
          )}>
            <Brain size={iconSizes[size]} strokeWidth={2} />
          </div>
          
          {/* Floating Sparkle inside logo */}
          <div className={cn(
            "absolute top-[15%] right-[15%] text-amber-300",
            animated && "animate-pulse"
          )}>
             <Sparkles size={iconSizes[size] * 0.4} strokeWidth={3} />
          </div>
        </div>
        
        {/* Active Status Dot */}
        <span className={cn(
          "absolute -bottom-1 -right-1 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-900 shadow-sm z-20",
          size === 'sm' || size === 'md' ? "w-3.5 h-3.5" : "w-5 h-5"
        )} />
      </div>

      {/* Brand Text */}
      {withText && (
        <div className="flex flex-col justify-center select-none">
          <span className={cn(
            "font-extrabold tracking-tight bg-clip-text text-transparent",
            "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600",
            "dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400",
            textSizes[size]
          )}>
            Sereia
          </span>
          <p className={cn(
            "text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em]",
            subTextSizes[size]
          )}>
            Wellness AI
          </p>
        </div>
      )}
    </div>
  );
};

export default Logo;
