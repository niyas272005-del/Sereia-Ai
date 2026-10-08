import React from 'react';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, getDay, isToday } from 'date-fns';
import { cn } from '../../utils/cn';

const MoodCalendar = ({ date = new Date(), moodData = {} }) => {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Padding for the first day of the month
  const startDay = getDay(monthStart);
  const paddingDays = Array.from({ length: startDay }).map((_, i) => `pad-${i}`);

  const getMoodColor = (moodValue) => {
    if (!moodValue) return 'bg-white/40 dark:bg-white/4 hover:bg-white/60 dark:hover:bg-white/8 text-slate-400 dark:text-slate-600';
    if (moodValue >= 8) return 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-sm shadow-emerald-500/30';
    if (moodValue >= 6) return 'bg-gradient-to-br from-sky-400 to-blue-500 text-white shadow-sm shadow-blue-500/20';
    if (moodValue >= 4) return 'bg-gradient-to-br from-amber-400 to-orange-400 text-white shadow-sm shadow-amber-500/20';
    return 'bg-gradient-to-br from-rose-400 to-red-500 text-white shadow-sm shadow-rose-500/20';
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-100">
          {format(date, 'MMMM yyyy')}
        </h4>
      </div>

      <div className="grid grid-cols-7 gap-1.5 mb-2 text-center">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {paddingDays.map(pad => (
          <div key={pad} className="aspect-square rounded-xl" />
        ))}

        {days.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const mood = moodData[dateStr];

          return (
            <div
              key={dateStr}
              title={`${format(day, 'MMM d')}: ${mood ? `Mood ${mood}/10` : 'No data'}`}
              className={cn(
                "aspect-square rounded-xl flex items-center justify-center text-[11px] font-semibold",
                "transition-all duration-200 hover:scale-110 cursor-pointer",
                getMoodColor(mood),
                isToday(day) && !mood
                  ? "ring-2 ring-indigo-500/60 ring-offset-1 dark:ring-offset-transparent"
                  : "",
                isToday(day) && mood ? "ring-2 ring-white/50" : ""
              )}
            >
              {format(day, 'd')}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-4 flex-wrap">
        {[
          { label: 'Excellent', color: 'bg-gradient-to-br from-emerald-400 to-teal-500' },
          { label: 'Good', color: 'bg-gradient-to-br from-sky-400 to-blue-500' },
          { label: 'Fair', color: 'bg-gradient-to-br from-amber-400 to-orange-400' },
          { label: 'Low', color: 'bg-gradient-to-br from-rose-400 to-red-500' },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-md ${color}`} />
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MoodCalendar;
