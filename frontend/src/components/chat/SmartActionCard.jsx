import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ChevronRight } from 'lucide-react';
import { recommendationService } from '../../services/recommendationService';
import { cn } from '../../utils/cn';

const SmartActionCard = ({ action, delayIndex }) => {
  const navigate = useNavigate();
  const [recId, setRecId] = useState(null);
  
  useEffect(() => {
    // Log this recommendation impression
    const logIt = async () => {
      const id = await recommendationService.logRecommendation(action.type, action.target_id);
      setRecId(id);
    };
    logIt();
  }, [action]);

  const handleClick = () => {
    if (recId) recommendationService.markClicked(recId);
    
    let url = action.route;
    if (action.target_id) {
       if (action.type === 'exercise' || action.type === 'assessment') {
           url += `?open=${encodeURIComponent(action.target_id)}`;
       } else if (action.type === 'journal') {
           url += `?focus=today`;
       } else if (action.type === 'mood') {
           url += `?highlight=today`;
       } else if (action.type === 'analytics') {
           url += `?chart=${encodeURIComponent(action.target_id)}`;
       } else if (action.type === 'report') {
           url += `?report=${encodeURIComponent(action.target_id)}`;
       }
    }
    navigate(url);
  };

  const animationDelay = `${delayIndex * 100}ms`;

  return (
    <div 
      className="smart-action-card quantum-card overflow-hidden group cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 opacity-0"
      style={{ animationDelay, animationFillMode: 'forwards' }}
      onClick={handleClick}
    >
      <div className={cn("p-4 flex items-start gap-4", "bg-white/40 dark:bg-slate-900/40")}>
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm bg-gradient-to-br", action.gradient)}>
           <span className="text-2xl drop-shadow-md">{action.emoji}</span>
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            {action.subtitle}
          </p>
          <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {action.title}
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
            {action.benefit}
          </p>
          
          <div className="flex items-center justify-between mt-3">
             <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
               <Clock size={12} />
               {action.duration}
             </div>
             
             <div className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
               <ChevronRight size={14} />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartActionCard;
