import React, { forwardRef, useState } from 'react';
import { cn } from '../../utils/cn';
import { Eye, EyeOff } from 'lucide-react';

const Input = forwardRef(({
  className,
  type = "text",
  label,
  error,
  icon: Icon,
  hint,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="w-full">
      {label && (
        <label className={cn(
          "block text-sm font-semibold mb-2 transition-colors duration-200",
          isFocused
            ? "text-indigo-600 dark:text-indigo-400"
            : "text-slate-700 dark:text-slate-300"
        )}>
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <div className={cn(
            "absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200",
            isFocused ? "text-indigo-500 dark:text-indigo-400" : "text-slate-400"
          )}>
            <Icon size={17} />
          </div>
        )}
        <input
          type={inputType}
          className={cn(
            "glass-input w-full h-12 px-4 text-sm",
            "text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500",
            Icon && "pl-10",
            isPassword && "pr-11",
            error && "border-rose-400/60 dark:border-rose-500/40 focus:!border-rose-400 focus:!ring-rose-400/20",
            "animate-shake" in (props || {}) && "animate-shake",
            className
          )}
          ref={ref}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-0.5"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        )}

        {/* Focus ring highlight */}
        <div className={cn(
          "absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-200",
          "bg-gradient-to-r from-blue-500/5 to-violet-500/5",
          isFocused ? "opacity-100" : "opacity-0"
        )} />
      </div>

      {hint && !error && (
        <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">{hint}</p>
      )}
      {error && (
        <p className="mt-1.5 text-xs text-rose-500 dark:text-rose-400 flex items-center gap-1 animate-fade-in-up">
          <span className="inline-block w-1 h-1 rounded-full bg-rose-500 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = "Input";

export default Input;
