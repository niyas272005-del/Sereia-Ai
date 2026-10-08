import React from 'react';
import { Play, Clock, ListChecks } from 'lucide-react';
import { cn } from '../../utils/cn';

const AssessmentCard = ({ title, description, timeEstimate, questionsCount, icon: Icon, color, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="quantum-card p-6 cursor-pointer overflow-hidden flex flex-col group"
    >
      {/* Gradient blob background */}
      <div className={cn(
        'absolute top-0 right-0 w-48 h-48 bg-gradient-to-br opacity-8 rounded-full blur-3xl -mr-16 -mt-16 transition-all duration-500 group-hover:scale-125 group-hover:opacity-12',
        color
      )} />

      {/* Icon + time estimate */}
      <div className="flex items-start justify-between mb-5 relative z-10">
        <div className={cn('p-3 rounded-2xl bg-gradient-to-br text-white shadow-lg shadow-black/10', color)}>
          <Icon className="w-5 h-5" strokeWidth={1.8} />
        </div>
        <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500
          bg-white/60 dark:bg-white/6 border border-white/40 dark:border-white/10
          px-2.5 py-1 rounded-full backdrop-blur-sm">
          <Clock size={10} /> {timeEstimate}
        </div>
      </div>

      {/* Text */}
      <div className="flex-1 relative z-10">
        <h3 className="text-[15px] font-bold text-slate-900 dark:text-white mb-2 leading-snug
          group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
          {description}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-5 pt-4
        border-t border-white/30 dark:border-white/6 relative z-10">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 dark:text-slate-500">
          <ListChecks size={13} className="text-indigo-400 dark:text-indigo-500" />
          {questionsCount} questions
        </div>

        <button className="flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400
          group-hover:gap-2.5 transition-all duration-200">
          Start
          <div className="w-7 h-7 rounded-xl bg-indigo-50 dark:bg-indigo-500/15
            group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:to-violet-600
            flex items-center justify-center transition-all duration-300 shadow-sm">
            <Play className="w-3 h-3 ml-0.5 text-indigo-600 dark:text-indigo-400
              group-hover:text-white transition-colors duration-300 fill-current" />
          </div>
        </button>
      </div>
    </div>
  );
};

export default AssessmentCard;
