import React, { useEffect, useState } from 'react';
import { cn } from '../../utils/cn';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  colorClass = "",
  gradient = "from-blue-500 to-indigo-600",
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  // Animated Counter Effect
  useEffect(() => {
    const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
    if (numValue === 0 || typeof value === 'string' && isNaN(parseFloat(value))) {
      setDisplayValue(value);
      return;
    }

    const duration = 900;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentNum = Math.floor(easedProgress * numValue);

      if (typeof value === 'string' && value.includes('%')) {
        setDisplayValue(`${currentNum}%`);
      } else {
        setDisplayValue(currentNum);
      }

      if (progress < 1) requestAnimationFrame(animate);
      else setDisplayValue(value);
    };

    const raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = trend > 0
    ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10"
    : trend < 0
    ? "text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10"
    : "text-slate-400 bg-slate-50 dark:bg-white/5";

  return (
    <div className="quantum-card p-5 group">
      {/* Header Row */}
      <div className="flex items-start justify-between mb-4">
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          {title}
        </p>
        {/* Gradient Icon Badge */}
        <div className={cn(
          "flex items-center justify-center w-10 h-10 rounded-xl text-white shadow-md",
          "bg-gradient-to-br",
          gradient,
          "group-hover:scale-110 group-hover:shadow-lg transition-all duration-300"
        )}>
          {Icon && <Icon size={20} strokeWidth={1.8} />}
        </div>
      </div>

      {/* Value */}
      <div className="mb-3">
        <span className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          {displayValue}
        </span>
      </div>

      {/* Trend Badge */}
      {(trend !== undefined || trendLabel) && (
        <div className="flex items-center gap-2">
          {trend !== undefined && (
            <span className={cn(
              "inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full",
              trendColor
            )}>
              <TrendIcon size={11} />
              {trend > 0 ? '+' : ''}{trend}%
            </span>
          )}
          {trendLabel && (
            <span className="text-xs text-slate-400 dark:text-slate-500">{trendLabel}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatCard;
