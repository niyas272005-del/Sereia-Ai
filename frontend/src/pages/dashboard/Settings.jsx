import React, { useState } from 'react';
import {
  Sun, Moon, Monitor, Bell, Shield, Lock, Trash2,
  Download, Eye, EyeOff, KeyRound, AlertTriangle, Type,
  Contrast, Zap, Keyboard, Volume2, ZoomIn, Focus
} from 'lucide-react';
import { useProfile } from '../../components/common/ProfileContext';
import { useTheme } from '../../components/common/ThemeProvider';
import { useToast } from '../../components/common/ToastContext';
import {
  SettingsSection, SettingsToggle, SettingsSelect,
  SettingsAction, SettingsInfo
} from '../../components/common/SettingsComponents';
import { cn } from '../../utils/cn';

// ─── Theme Picker ──────────────────────────────────────────────────────────
const ThemePicker = ({ value, onChange }) => {
  const options = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: Monitor },
  ];

  return (
    <div className="px-6 py-4">
      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-3">Color Theme</p>
      <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-label="Color theme selection">
        {options.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            role="radio"
            aria-checked={value === id}
            onClick={() => onChange(id)}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
              value === id
                ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 text-slate-600 dark:text-slate-400'
            )}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs font-semibold">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// ─── Change Password Modal ─────────────────────────────────────────────────
const ChangePasswordModal = ({ onClose }) => {
  const { addToast } = useToast();
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [show, setShow] = useState({ current: false, next: false, confirm: false });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const toggle = (k) => () => setShow((s) => ({ ...s, [k]: !s[k] }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.current || !form.next || !form.confirm) {
      addToast('Please fill all fields.', 'error'); return;
    }
    if (form.next !== form.confirm) {
      addToast('New passwords do not match.', 'error'); return;
    }
    if (form.next.length < 8) {
      addToast('Password must be at least 8 characters.', 'error'); return;
    }
    addToast('Password changed successfully!', 'success');
    onClose();
  };

  const strength = form.next.length >= 12 ? 'strong' : form.next.length >= 8 ? 'medium' : form.next.length > 0 ? 'weak' : null;

  const strengthConfig = {
    weak: { label: 'Weak', color: 'bg-red-500', width: '33%', text: 'text-red-500' },
    medium: { label: 'Fair', color: 'bg-orange-500', width: '66%', text: 'text-orange-500' },
    strong: { label: 'Strong', color: 'bg-green-500', width: '100%', text: 'text-green-500' },
  };

  const PwInput = ({ field, placeholder }) => (
    <div className="relative">
      <input
        type={show[field] ? 'text' : 'password'}
        value={form[field]}
        onChange={set(field)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 pr-10 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <button type="button" onClick={toggle(field)} aria-label={show[field] ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
        {show[field] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Change Password">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 space-y-5 animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30"><KeyRound className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /></div>
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white">Change Password</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Choose a strong, unique password.</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <PwInput field="current" placeholder="Current password" />
          <PwInput field="next" placeholder="New password" />
          {strength && (
            <div>
              <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className={cn('h-full rounded-full transition-all', strengthConfig[strength].color)} style={{ width: strengthConfig[strength].width }} />
              </div>
              <p className={cn('text-xs mt-1 font-medium', strengthConfig[strength].text)}>{strengthConfig[strength].label} password</p>
            </div>
          )}
          <PwInput field="confirm" placeholder="Confirm new password" />
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-500/20">Update Password</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Delete Account Modal ──────────────────────────────────────────────────
const DeleteAccountModal = ({ onClose }) => {
  const { addToast } = useToast();
  const [confirm, setConfirm] = useState('');

  const handleDelete = () => {
    if (confirm !== 'DELETE') { addToast('Type DELETE to confirm.', 'error'); return; }
    addToast('Account deletion requested. You will receive an email.', 'info', 5000);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Delete Account">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-red-200 dark:border-red-900/50 w-full max-w-md p-6 space-y-5 animate-fade-in-up">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-50 dark:bg-red-900/30"><AlertTriangle className="w-5 h-5 text-red-600" /></div>
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white">Delete Account</h2>
            <p className="text-xs text-red-500">This action is irreversible.</p>
          </div>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          All your data including mood logs, journal entries, assessment results, and wellness progress will be <strong>permanently deleted</strong>. This cannot be undone.
        </p>
        <div>
          <label htmlFor="deleteConfirm" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Type <span className="text-red-600 font-mono">DELETE</span> to confirm</label>
          <input id="deleteConfirm" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="DELETE" className="mt-2 w-full text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500 font-mono" />
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors">Cancel</button>
          <button onClick={handleDelete} disabled={confirm !== 'DELETE'} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Delete My Account</button>
        </div>
      </div>
    </div>
  );
};

// ─── Accessibility Panel ───────────────────────────────────────────────────
const AccessibilitySection = ({ acc, update }) => {
  const { addToast } = useToast();

  const apply = (key, val) => {
    update({ [key]: val });
    // Apply real DOM effects
    if (key === 'highContrast') {
      document.documentElement.classList.toggle('high-contrast', val);
    }
    if (key === 'reducedMotion') {
      document.documentElement.classList.toggle('reduce-motion', val);
    }
    if (key === 'largeFont') {
      document.documentElement.style.fontSize = val ? '18px' : '';
    }
    if (key === 'focusIndicators') {
      document.documentElement.classList.toggle('enhanced-focus', val);
    }
    addToast(`Accessibility setting updated.`, 'success');
  };

  return (
    <SettingsSection
      title="Accessibility"
      description="Make Sereia work better for your specific needs."
    >
      <SettingsToggle
        id="highContrast"
        label="High Contrast Mode"
        description="Increases color contrast for improved readability."
        checked={acc.highContrast}
        onChange={(v) => apply('highContrast', v)}
      />
      <SettingsToggle
        id="reducedMotion"
        label="Reduced Motion"
        description="Minimizes animations and transitions throughout the app."
        checked={acc.reducedMotion}
        onChange={(v) => apply('reducedMotion', v)}
      />
      <SettingsToggle
        id="largeFont"
        label="Large Font Size"
        description="Scales up base text size for easier reading."
        checked={acc.largeFont}
        onChange={(v) => apply('largeFont', v)}
      />
      <SettingsToggle
        id="focusIndicators"
        label="Enhanced Focus Indicators"
        description="Shows bold, high-visibility focus rings when navigating with keyboard."
        checked={acc.focusIndicators}
        onChange={(v) => apply('focusIndicators', v)}
      />
      <SettingsToggle
        id="screenReaderMode"
        label="Screen Reader Optimizations"
        description="Adds additional ARIA labels and adjusts layouts for assistive technology."
        checked={acc.screenReaderMode}
        onChange={(v) => apply('screenReaderMode', v)}
      />
      <div className="px-6 py-4 bg-indigo-50/50 dark:bg-indigo-900/10">
        <p className="text-xs text-indigo-700 dark:text-indigo-400 font-medium">
          💡 All interactive elements in Sereia support full keyboard navigation (Tab, Enter, Space, Arrow keys).
        </p>
      </div>
    </SettingsSection>
  );
};

// ─── Settings Page ─────────────────────────────────────────────────────────
const Settings = () => {
  const { settings, updateSettings } = useProfile();
  const { isDarkMode, toggleTheme } = useTheme();
  const { addToast } = useToast();
  const [modal, setModal] = useState(null); // 'password' | 'delete'

  const setNotif = (k) => (v) => {
    updateSettings('notifications', { [k]: v });
    addToast('Notification preference saved.', 'success');
  };
  const setPrivacy = (k) => (v) => {
    updateSettings('privacy', { [k]: v });
    addToast('Privacy setting saved.', 'success');
  };
  const setAcc = (updates) => updateSettings('accessibility', updates);

  const handleThemeChange = (theme) => {
    updateSettings(null, { theme });
    if (theme === 'dark' && !isDarkMode) toggleTheme();
    if (theme === 'light' && isDarkMode) toggleTheme();
    addToast(`Theme set to ${theme}.`, 'success');
  };

  const handleExport = () => {
    const data = { profile: 'User data would be exported here', date: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'sereia-my-data.json';
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
    addToast('Your data is downloading!', 'success');
  };

  return (
    <main className="space-y-6 animate-fade-in-up" aria-label="Settings Page">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Customize your Sereia experience and manage your account.</p>
      </div>

      {/* ── Appearance ── */}
      <SettingsSection title="Appearance" description="Control how Sereia looks on your device.">
        <ThemePicker value={settings.theme} onChange={handleThemeChange} />
        <SettingsSelect
          id="settingsLanguage"
          label="Display Language"
          description="The language used throughout the application."
          value={settings.language}
          onChange={(v) => { updateSettings(null, { language: v }); addToast(`Language set to ${v}.`, 'success'); }}
          options={[
            { value: 'English', label: 'English' },
            { value: 'Hindi', label: 'हिन्दी (Hindi)' },
            { value: 'Tamil', label: 'தமிழ் (Tamil)' },
            { value: 'Spanish', label: 'Español (Spanish)' },
            { value: 'French', label: 'Français (French)' },
          ]}
        />
      </SettingsSection>

      {/* ── Notifications ── */}
      <SettingsSection title="Notification Preferences" description="Choose what you want to be reminded about.">
        <SettingsToggle id="notif-daily" label="Daily Mood Reminder" description="A gentle nudge each morning to log how you're feeling." checked={settings.notifications.dailyReminder} onChange={setNotif('dailyReminder')} />
        <SettingsToggle id="notif-weekly" label="Weekly Report Ready" description="Get notified when your weekly wellness report is available." checked={settings.notifications.weeklyReport} onChange={setNotif('weeklyReport')} />
        <SettingsToggle id="notif-assessment" label="Assessment Reminders" description="Periodic reminders to retake assessments to track progress." checked={settings.notifications.assessmentReminder} onChange={setNotif('assessmentReminder')} />
        <SettingsToggle id="notif-exercise" label="Wellness Exercise Reminders" description="Reminders to complete your scheduled wellness exercises." checked={settings.notifications.exerciseReminder} onChange={setNotif('exerciseReminder')} />
        <SettingsToggle id="notif-email" label="Email Notifications" description="Receive reports and summaries via email." checked={settings.notifications.emailNotifications} onChange={setNotif('emailNotifications')} />
      </SettingsSection>

      {/* ── Privacy ── */}
      <SettingsSection title="Privacy" description="Control how your data is used and shared.">
        <SettingsToggle id="privacy-research" label="Share Data for Research" description="Contribute anonymised data to mental health research programs." checked={settings.privacy.shareDataForResearch} onChange={setPrivacy('shareDataForResearch')} />
        <SettingsToggle id="privacy-activity" label="Show Activity Status" description="Let your care team see when you were last active." checked={settings.privacy.showActivityStatus} onChange={setPrivacy('showActivityStatus')} />
        <SettingsToggle id="privacy-analytics" label="Anonymous App Analytics" description="Help us improve Sereia by sharing anonymous usage patterns." checked={settings.privacy.allowAnonymousAnalytics} onChange={setPrivacy('allowAnonymousAnalytics')} />
      </SettingsSection>

      {/* ── Security ── */}
      <SettingsSection title="Security" description="Manage your account security and credentials.">
        <SettingsInfo label="Account Created" value="July 1, 2026" />
        <SettingsInfo label="Last Login" value="Today at 11:03 PM" />
        <SettingsInfo label="Two-Factor Authentication" value="Not enabled" />
        <SettingsAction
          label="Change Password"
          description="Update your password regularly to keep your account secure."
          actionLabel="Change"
          action={() => setModal('password')}
          icon={KeyRound}
        />
        <SettingsAction
          label="Active Sessions"
          description="Review and revoke any active sessions from other devices."
          actionLabel="Manage"
          action={() => addToast('Session management coming soon.', 'info')}
          icon={Shield}
        />
      </SettingsSection>

      {/* ── Accessibility ── */}
      <AccessibilitySection acc={settings.accessibility} update={setAcc} />

      {/* ── Data ── */}
      <SettingsSection title="Your Data" description="Export or permanently delete your personal data.">
        <SettingsAction
          label="Export My Data"
          description="Download a copy of all your data including mood logs, journals, and assessments."
          actionLabel="Export"
          action={handleExport}
          icon={Download}
        />
        <SettingsAction
          label="Delete Account"
          description="Permanently delete your account and all associated data. This cannot be undone."
          actionLabel="Delete Account"
          actionVariant="danger"
          action={() => setModal('delete')}
          icon={Trash2}
        />
      </SettingsSection>

      {/* ── App Info ── */}
      <SettingsSection title="About">
        <SettingsInfo label="App Version" value="1.0.0-beta" />
        <SettingsInfo label="Build" value="2026.07.13" />
        <SettingsInfo label="Backend" value="FastAPI + SQLite" />
      </SettingsSection>

      {/* ── Modals ── */}
      {modal === 'password' && <ChangePasswordModal onClose={() => setModal(null)} />}
      {modal === 'delete' && <DeleteAccountModal onClose={() => setModal(null)} />}
    </main>
  );
};

export default Settings;
