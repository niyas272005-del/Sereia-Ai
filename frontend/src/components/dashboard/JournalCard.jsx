import React from 'react';
import EmotionBadge from './EmotionBadge';
import { MoreHorizontal } from 'lucide-react';

const JournalCard = ({ date, title, preview, emotion }) => {
  return (
    <div className="quantum-card p-5 cursor-pointer group">
      <div className="flex items-start justify-between mb-2.5">
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          {date}
        </span>
        <button className="text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400
          opacity-0 group-hover:opacity-100 transition-all duration-200 p-0.5 rounded-lg hover:bg-white/60 dark:hover:bg-white/8">
          <MoreHorizontal size={15} />
        </button>
      </div>

      <h3 className="font-bold text-slate-900 dark:text-white text-[15px] mb-2 truncate
        group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
        {title}
      </h3>

      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
        {preview}
      </p>

      <div className="flex items-center gap-2">
        <EmotionBadge emotion={emotion} />
      </div>
    </div>
  );
};

export default JournalCard;
