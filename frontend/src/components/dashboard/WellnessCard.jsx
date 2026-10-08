import React, { useState } from 'react';
import { Heart, Clock, Zap } from 'lucide-react';

const DIFFICULTY_CONFIG = {
  Beginner:     { color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200/60 dark:border-emerald-500/20', dot: 'bg-emerald-500' },
  Intermediate: { color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200/60 dark:border-amber-500/20',         dot: 'bg-amber-500' },
  Advanced:     { color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-200/60 dark:border-rose-500/20',                 dot: 'bg-rose-500' },
};

const WellnessCard = ({ exercise, onStart }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  if (!exercise) return null;

  const { title, description, duration, difficulty, category, emoji, gradient, benefits = [] } = exercise;
  const diffCfg = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.Beginner;

  return (
    <div className="quantum-card overflow-hidden flex flex-col group">

      {/* ── Visual Header ── */}
      <div className={`relative h-44 bg-gradient-to-br ${gradient || 'from-indigo-500 to-violet-600'} flex items-center justify-center overflow-hidden`}>
        {/* Decorative blobs */}
        <div className="absolute top-4 left-4 w-24 h-24 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-4 right-4 w-20 h-20 rounded-full bg-black/10 blur-xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-white/5 blur-3xl" />

        {/* Big emoji */}
        <span className="text-7xl select-none drop-shadow-lg z-10 group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-500">
          {emoji || '✨'}
        </span>

        {/* Category pill */}
        <div className="absolute top-3 left-3 z-20">
          <span className="text-[11px] font-bold px-2.5 py-1 bg-white/20 backdrop-blur-md text-white rounded-full border border-white/25 shadow-sm tracking-wide uppercase">
            {category || 'Wellness'}
          </span>
        </div>

        {/* Favourite */}
        <button
          onClick={(e) => { e.stopPropagation(); setIsFavorite(f => !f); }}
          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/35 transition-colors border border-white/25 shadow-sm"
        >
          <Heart size={14} className={isFavorite ? 'fill-rose-400 text-rose-400' : 'text-white'} />
        </button>
      </div>

      {/* ── Content ── */}
      <div className="p-5 flex flex-col flex-1">

        {/* Meta row */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${diffCfg.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${diffCfg.dot}`} />
            {difficulty || 'Beginner'}
          </span>
          <span className="flex items-center gap-1 text-xs font-medium text-slate-400 dark:text-slate-500">
            <Clock size={11} /> {duration || '5 mins'}
          </span>
        </div>

        {/* Title + description */}
        <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {title || 'Exercise'}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 flex-1 mb-4">
          {description || 'A wellness exercise to help you feel better.'}
        </p>

        {/* Benefits chips */}
        {benefits.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4 mt-auto">
            {benefits.slice(0, 3).map(b => (
              <span key={b} className="text-[10px] font-semibold px-2 py-0.5 rounded-full
                bg-white/60 dark:bg-white/6 text-slate-500 dark:text-slate-400
                border border-white/40 dark:border-white/10">
                {b}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={() => onStart(exercise)}
          className={`w-full py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r ${gradient || 'from-indigo-500 to-violet-600'}
            hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5 active:translate-y-0
            transition-all duration-200 flex items-center justify-center gap-2`}
        >
          <Zap size={16} className="fill-white/20" />
          Start Exercise
        </button>
      </div>
    </div>
  );
};

export default WellnessCard;
