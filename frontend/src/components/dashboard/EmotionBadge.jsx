import React from 'react';
import { cn } from '../../utils/cn';

const EmotionBadge = ({ emotion, className }) => {
  if (!emotion) return null;

  // Quantum AI emotion palette
  const colorMap = {
    joy:       'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-500/20',
    happy:     'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-500/20',
    great:     'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-500/20',
    calm:      'bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-200/60 dark:border-sky-500/20',
    neutral:   'bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200/60 dark:border-white/10',
    okay:      'bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200/60 dark:border-white/10',
    anxious:   'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200/60 dark:border-amber-500/20',
    anxiety:   'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200/60 dark:border-amber-500/20',
    stress:    'bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200/60 dark:border-orange-500/20',
    stressed:  'bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200/60 dark:border-orange-500/20',
    sadness:   'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-200/60 dark:border-violet-500/20',
    sad:       'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-200/60 dark:border-violet-500/20',
    anger:     'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200/60 dark:border-rose-500/20',
    loneliness:'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200/60 dark:border-purple-500/20',
    lonely:    'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200/60 dark:border-purple-500/20',
    burnout:   'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200/60 dark:border-red-500/20',
    fear:      'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200/60 dark:border-indigo-500/20',
  };

  const normalizedEmotion = emotion.toLowerCase();
  const colorClass = colorMap[normalizedEmotion] || colorMap['okay'];

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border backdrop-blur-sm",
      colorClass,
      className
    )}>
      {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
    </span>
  );
};

export default EmotionBadge;
