import React from 'react';
import { cn } from '../../utils/cn';

const Widget = ({ title, className, children, action, noPadding = false }) => {
  return (
    <div className={cn(
      "quantum-card overflow-hidden flex flex-col",
      className
    )}>
      {title && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/20 dark:border-white/6">
          {/* Left accent bar + title */}
          <div className="flex items-center gap-3">
            <div className="w-0.5 h-4 rounded-full bg-gradient-to-b from-blue-500 to-violet-600" />
            <h3 className="font-semibold text-[13px] text-slate-700 dark:text-slate-200 tracking-tight">
              {title}
            </h3>
          </div>
          {action && (
            <div className="flex-shrink-0">{action}</div>
          )}
        </div>
      )}
      <div className={cn("flex-1", !noPadding && "p-5")}>
        {children}
      </div>
    </div>
  );
};

export default Widget;
