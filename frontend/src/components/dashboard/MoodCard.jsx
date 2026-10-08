import React from 'react';
import EmotionBadge from './EmotionBadge';

const MoodCard = ({ date, time, emoji, label, note, emotion }) => {
  return (
    <div className="quantum-card p-4 flex items-start gap-4">
      {/* Emoji Circle */}
      <div className="flex-shrink-0">
        <div className="w-12 h-12 flex items-center justify-center rounded-2xl text-2xl
          bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-white/8 dark:to-white/4
          border border-white/50 dark:border-white/10 shadow-sm">
          {emoji}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-sm text-slate-900 dark:text-white">{label}</h4>
            <EmotionBadge emotion={emotion} />
          </div>
          <div className="text-right flex-shrink-0 ml-2">
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 block">{date}</span>
            <span className="text-[11px] text-slate-300 dark:text-slate-600">{time}</span>
          </div>
        </div>

        {note && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2
            bg-white/50 dark:bg-white/4 border border-white/40 dark:border-white/8
            px-3 py-2 rounded-xl leading-relaxed italic backdrop-blur-sm">
            "{note}"
          </p>
        )}
      </div>
    </div>
  );
};

export default MoodCard;
