import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

const Button = forwardRef(({
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  disabled,
  ...props
}, ref) => {
  const baseStyles = [
    "inline-flex items-center justify-center font-semibold rounded-xl",
    "transition-all duration-200 ease-out",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500",
    "disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed",
    "select-none",
  ].join(' ');

  const variants = {
    primary: [
      "bg-gradient-to-r from-blue-600 to-violet-600 text-white",
      "shadow-md shadow-indigo-500/25",
      "hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/35",
      "active:translate-y-0 active:shadow-sm",
    ].join(' '),

    secondary: [
      "bg-white/70 dark:bg-white/5 text-slate-700 dark:text-slate-200",
      "border border-slate-200/80 dark:border-white/10",
      "backdrop-blur-sm",
      "hover:bg-white dark:hover:bg-white/10 hover:-translate-y-0.5",
      "active:translate-y-0",
      "shadow-sm hover:shadow-md",
    ].join(' '),

    outline: [
      "bg-transparent text-slate-700 dark:text-slate-200",
      "border-2 border-slate-200 dark:border-white/12",
      "hover:bg-white/60 dark:hover:bg-white/6 hover:border-indigo-300/60 dark:hover:border-indigo-500/30",
      "hover:-translate-y-0.5 active:translate-y-0",
      "transition-all",
    ].join(' '),

    ghost: [
      "bg-transparent text-slate-600 dark:text-slate-300",
      "hover:bg-slate-100/80 dark:hover:bg-white/6",
      "hover:text-slate-900 dark:hover:text-slate-100",
      "active:bg-slate-200/80 dark:active:bg-white/10",
    ].join(' '),

    danger: [
      "bg-gradient-to-r from-rose-500 to-red-600 text-white",
      "shadow-md shadow-rose-500/20",
      "hover:-translate-y-0.5 hover:shadow-lg hover:shadow-rose-500/30",
      "active:translate-y-0",
    ].join(' '),
  };

  const sizes = {
    xs: "h-7 px-3 text-xs gap-1",
    sm: "h-9 px-4 text-sm gap-1.5",
    md: "h-11 px-5 text-sm gap-2",
    lg: "h-13 px-7 text-base gap-2",
    xl: "h-14 px-8 text-base gap-2.5",
  };

  return (
    <button
      ref={ref}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="animate-spin flex-shrink-0" size={size === 'sm' ? 14 : 16} />
      ) : null}
      {children}
    </button>
  );
});

Button.displayName = "Button";

export default Button;
