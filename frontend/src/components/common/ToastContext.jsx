import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '../../utils/cn';

const ToastContext = createContext(null);

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 w-full max-w-[360px] pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onRemove={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem = ({ toast, onRemove }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // trigger entrance animation
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const configs = {
    success: {
      icon: CheckCircle2,
      iconBg: 'bg-gradient-to-br from-emerald-400 to-teal-500',
      border: 'border-emerald-200/50 dark:border-emerald-500/20',
      bar: 'bg-gradient-to-r from-emerald-400 to-teal-500',
    },
    error: {
      icon: AlertCircle,
      iconBg: 'bg-gradient-to-br from-rose-400 to-red-500',
      border: 'border-rose-200/50 dark:border-rose-500/20',
      bar: 'bg-gradient-to-r from-rose-400 to-red-500',
    },
    warning: {
      icon: AlertTriangle,
      iconBg: 'bg-gradient-to-br from-amber-400 to-orange-500',
      border: 'border-amber-200/50 dark:border-amber-500/20',
      bar: 'bg-gradient-to-r from-amber-400 to-orange-500',
    },
    info: {
      icon: Info,
      iconBg: 'bg-gradient-to-br from-blue-400 to-indigo-500',
      border: 'border-blue-200/50 dark:border-blue-500/20',
      bar: 'bg-gradient-to-r from-blue-400 to-indigo-500',
    },
  };

  const config = configs[toast.type] || configs.info;
  const IconComponent = config.icon;

  return (
    <div
      className={cn(
        "pointer-events-auto relative overflow-hidden",
        "glass-panel rounded-2xl border shadow-quantum-lg",
        config.border,
        "transition-all duration-400 ease-out",
        visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95"
      )}
      style={{ transitionDuration: '350ms' }}
    >
      {/* Top gradient accent bar */}
      <div className={cn("absolute top-0 left-0 right-0 h-0.5", config.bar)} />

      <div className="flex items-start gap-3 p-4 pt-4.5">
        {/* Icon */}
        <div className={cn(
          "flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center shadow-sm",
          config.iconBg
        )}>
          <IconComponent size={15} className="text-white" />
        </div>

        {/* Content */}
        <p className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed pt-0.5">
          {toast.message}
        </p>

        {/* Dismiss */}
        <button
          onClick={onRemove}
          className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200
            transition-colors p-0.5 rounded-lg hover:bg-white/40 dark:hover:bg-white/10 mt-0.5"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
};
