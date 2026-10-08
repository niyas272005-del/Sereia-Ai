import React, { useState } from 'react';
import Chart from './Chart';
import { TrendingUp } from 'lucide-react';

const STATIC_DATA = {
  Weekly: [
    { name: 'Mon', value: 6 },
    { name: 'Tue', value: 7 },
    { name: 'Wed', value: 5 },
    { name: 'Thu', value: 8 },
    { name: 'Fri', value: 7 },
    { name: 'Sat', value: 9 },
    { name: 'Sun', value: 8 },
  ],
  Monthly: [
    { name: 'Week 1', value: 6.5 },
    { name: 'Week 2', value: 7.2 },
    { name: 'Week 3', value: 5.8 },
    { name: 'Week 4', value: 8.1 },
  ],
};

/**
 * ProgressChart — Mood Wellness Line Chart
 *
 * WHY WE USE THIS:
 *   Shows how your mood (0–10) changes over time, giving a visual pattern
 *   that's hard to see from individual logs. A rising trend means you're
 *   improving; a dip can prompt you to take action early.
 *
 * Props:
 *   liveWeeklyData  — [{day, mood}] from MoodContext (from AI chat logs)
 *   liveMonthlyData — [{week, mood}] from MoodContext
 */
const ProgressChart = ({ liveWeeklyData, liveMonthlyData }) => {
  const [timeframe, setTimeframe] = useState('Weekly');

  const buildLiveWeekly = () =>
    (liveWeeklyData || []).map(d => ({
      name: d.day || d.name,
      value: d.mood != null ? d.mood : undefined,
    }));

  const buildLiveMonthly = () =>
    (liveMonthlyData || []).map(d => ({
      name: d.week || d.name,
      value: d.mood != null ? d.mood : undefined,
    }));

  const hasLiveWeekly  = liveWeeklyData  && liveWeeklyData.some(d => d.mood != null);
  const hasLiveMonthly = liveMonthlyData && liveMonthlyData.some(d => d.mood != null);

  const isLive = timeframe === 'Weekly' ? hasLiveWeekly : hasLiveMonthly;

  const dataMap = {
    Weekly:  hasLiveWeekly  ? buildLiveWeekly()  : STATIC_DATA.Weekly,
    Monthly: hasLiveMonthly ? buildLiveMonthly() : STATIC_DATA.Monthly,
  };

  const descriptions = {
    Weekly:  'Daily mood score (0–10) for the past 7 days, auto-detected from your AI conversations',
    Monthly: 'Average mood score per week for the past month, based on AI chat emotion analysis',
  };

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <TrendingUp size={15} className="text-emerald-500 mt-0.5 shrink-0" />
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {descriptions[timeframe]}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {isLive && (
            <span className="flex items-center gap-1 text-[11px] font-bold
              text-emerald-600 dark:text-emerald-400
              bg-emerald-50 dark:bg-emerald-500/10
              border border-emerald-200/60 dark:border-emerald-500/20
              px-2 py-0.5 rounded-full">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              Live
            </span>
          )}
          {['Weekly', 'Monthly'].map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all duration-200 ${
                timeframe === tf
                  ? 'bg-gradient-to-r from-blue-500 to-violet-600 text-white shadow-sm shadow-indigo-500/20'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-white/8'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Score scale legend */}
      <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500 px-1">
        <span className="font-medium">0 = Worst</span>
        <div className="flex-1 h-px bg-gradient-to-r from-rose-300 via-amber-300 to-emerald-400 rounded opacity-60" />
        <span className="font-medium">10 = Best</span>
      </div>

      {/* Chart */}
      <div className="h-56">
        <Chart
          data={dataMap[timeframe]}
          dataKey="value"
          xAxisKey="name"
          color="#10b981"
          domain={[0, 10]}
        />
      </div>

      {/* Bottom legend */}
      <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 px-1 pt-2
        border-t border-white/25 dark:border-white/6">
        {[
          { range: '0–3',  label: 'Struggling 😔', color: 'text-rose-400' },
          { range: '4–6',  label: 'Moderate 😐',   color: 'text-amber-400' },
          { range: '7–8',  label: 'Good 🙂',        color: 'text-emerald-400' },
          { range: '9–10', label: 'Excellent 😄',   color: 'text-green-500' },
        ].map(({ range, label, color }) => (
          <div key={range} className="flex flex-col items-center gap-0.5">
            <span className={`font-bold text-[11px] ${color}`}>{range}</span>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressChart;
