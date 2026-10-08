import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../../utils/cn';

const AnalyticsStat = ({ title, value, unit = '', subtitle, trend, icon: Icon, iconBg, iconColor, gradient }) => {
  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = trend > 0
    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10'
    : trend < 0
    ? 'text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10'
    : 'text-slate-400 bg-slate-50 dark:bg-white/5';

  return (
    <div className="quantum-card p-5 group relative overflow-hidden">
      {/* Gradient Glow blob */}
      <div className={cn(
        'absolute -top-8 -right-8 w-28 h-28 rounded-full blur-3xl opacity-15 group-hover:opacity-25 transition-opacity duration-500',
        gradient
      )} />

      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className={cn('p-2.5 rounded-xl', iconBg)}>
          <Icon className={cn('w-5 h-5', iconColor)} strokeWidth={1.8} />
        </div>
        {trend !== undefined && (
          <div className={cn(
            'flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full',
            trendColor
          )}>
            <TrendIcon className="w-3 h-3" />
            {trend !== 0 && <span>{Math.abs(trend)}%</span>}
          </div>
        )}
      </div>

      <div className="relative z-10">
        <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
          {title}
        </p>
        <div className="flex items-baseline gap-1 mb-1">
          <span className="text-2xl font-bold text-slate-900 dark:text-white">{value}</span>
          {unit && <span className="text-sm font-medium text-slate-400 dark:text-slate-500">{unit}</span>}
        </div>
        {subtitle && (
          <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

export default AnalyticsStat;
