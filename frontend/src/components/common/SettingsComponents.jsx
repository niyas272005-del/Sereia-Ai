import React from 'react';
import { cn } from '../../utils/cn';

// ─── Section Wrapper ───────────────────────────────────────────────────────
export const SettingsSection = ({ title, description, children, className }) => (
  <section
    className={cn('bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden', className)}
    aria-labelledby={`section-${title.replace(/\s+/g, '-').toLowerCase()}`}
  >
    {(title || description) && (
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
        <h2
          id={`section-${title.replace(/\s+/g, '-').toLowerCase()}`}
          className="text-sm font-semibold text-slate-900 dark:text-white"
        >
          {title}
        </h2>
        {description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
        )}
      </div>
    )}
    <div className="divide-y divide-slate-100 dark:divide-slate-800">{children}</div>
  </section>
);

// ─── Toggle Row ────────────────────────────────────────────────────────────
export const SettingsToggle = ({ label, description, checked, onChange, id, disabled }) => (
  <div className="flex items-start justify-between px-6 py-4 gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
    <div className="flex-1 min-w-0">
      <label htmlFor={id} className="block text-sm font-medium text-slate-800 dark:text-slate-200 cursor-pointer">
        {label}
      </label>
      {description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{description}</p>
      )}
    </div>
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900',
        checked ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200',
          checked ? 'translate-x-5' : 'translate-x-0'
        )}
      />
    </button>
  </div>
);

// ─── Select Row ────────────────────────────────────────────────────────────
export const SettingsSelect = ({ label, description, value, onChange, options, id }) => (
  <div className="flex items-start justify-between px-6 py-4 gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
    <div className="flex-1 min-w-0">
      <label htmlFor={id} className="block text-sm font-medium text-slate-800 dark:text-slate-200">
        {label}
      </label>
      {description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
      )}
    </div>
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
      className="text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[120px]"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

// ─── Action Row ────────────────────────────────────────────────────────────
export const SettingsAction = ({ label, description, action, actionLabel, actionVariant = 'default', icon: Icon }) => {
  const variantClasses = {
    default: 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800',
    danger: 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800',
    warning: 'text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 border-orange-200 dark:border-orange-800',
  };

  return (
    <div className="flex items-start justify-between px-6 py-4 gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{label}</p>
        {description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{description}</p>
        )}
      </div>
      <button
        onClick={action}
        aria-label={actionLabel}
        className={cn(
          'flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
          variantClasses[actionVariant]
        )}
      >
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {actionLabel}
      </button>
    </div>
  );
};

// ─── Info Row ──────────────────────────────────────────────────────────────
export const SettingsInfo = ({ label, value }) => (
  <div className="flex items-center justify-between px-6 py-4">
    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{label}</p>
    <p className="text-sm text-slate-500 dark:text-slate-400">{value}</p>
  </div>
);

// ─── Profile Field ─────────────────────────────────────────────────────────
export const ProfileField = ({ label, value, onChange, type = 'text', options, editing, id }) => {
  if (!editing) {
    return (
      <div className="flex flex-col gap-0.5">
        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</label>
        <p className="text-sm text-slate-900 dark:text-white font-medium">{value || '—'}</p>
      </div>
    );
  }

  if (type === 'select') {
    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={id} className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</label>
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
        aria-label={label}
      />
    </div>
  );
};
