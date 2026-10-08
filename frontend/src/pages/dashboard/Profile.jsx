import React, { useState, useRef } from 'react';
import {
  Edit3, Save, X, Camera, Phone, Target, Trophy,
  Plus, Trash2, User, Mail, Briefcase, Globe, Clock, Users
} from 'lucide-react';
import { useProfile } from '../../components/common/ProfileContext';
import { useToast } from '../../components/common/ToastContext';
import { ProfileField, SettingsSection } from '../../components/common/SettingsComponents';
import { cn } from '../../utils/cn';

const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];
const LANGUAGES = ['English', 'Hindi', 'Tamil', 'Spanish', 'French', 'German', 'Arabic'];
const TIMEZONES = ['Asia/Kolkata', 'Asia/Dubai', 'Europe/London', 'America/New_York', 'America/Los_Angeles', 'Australia/Sydney'];
const RELATIONS = ['Parent', 'Sibling', 'Spouse', 'Partner', 'Friend', 'Colleague', 'Other'];

// ─── Avatar Component ──────────────────────────────────────────────────────
const ProfileAvatar = ({ profile, onAvatarChange, editing }) => {
  const fileRef = useRef(null);

  const initials = `${profile.firstName?.[0] ?? ''}${profile.lastName?.[0] ?? ''}`.toUpperCase();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onAvatarChange(ev.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative inline-block">
      {profile.avatar ? (
        <img
          src={profile.avatar}
          alt={`${profile.firstName} ${profile.lastName}`}
          className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white dark:ring-slate-900 shadow-lg"
        />
      ) : (
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold ring-4 ring-white dark:ring-slate-900 shadow-lg select-none">
          {initials || <User className="w-10 h-10" />}
        </div>
      )}
      {editing && (
        <>
          <button
            onClick={() => fileRef.current?.click()}
            aria-label="Change profile picture"
            className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <Camera className="w-4 h-4" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} aria-label="Upload profile picture" />
        </>
      )}
    </div>
  );
};

// ─── Goals Manager ─────────────────────────────────────────────────────────
const GoalsManager = ({ goals, onChange, editing }) => {
  const [newGoal, setNewGoal] = useState('');

  const addGoal = () => {
    if (!newGoal.trim()) return;
    onChange([...goals, newGoal.trim()]);
    setNewGoal('');
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {goals.map((g, i) => (
          <div
            key={i}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium',
              'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
              editing && 'pr-1'
            )}
          >
            <Target className="w-3 h-3" />
            {g}
            {editing && (
              <button
                onClick={() => onChange(goals.filter((_, idx) => idx !== i))}
                aria-label={`Remove goal: ${g}`}
                className="ml-1 hover:text-red-500 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </div>
      {editing && (
        <div className="flex gap-2 mt-2">
          <input
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addGoal()}
            placeholder="Add a wellness goal…"
            className="flex-1 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="New wellness goal"
          />
          <button
            onClick={addGoal}
            aria-label="Add goal"
            className="px-3 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Achievements Grid ─────────────────────────────────────────────────────
const AchievementsGrid = ({ achievements }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
    {achievements.map((a) => (
      <div
        key={a.id}
        className={cn(
          'flex flex-col items-center gap-2 p-3 rounded-xl border transition-all',
          a.earned
            ? 'bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-800/50'
            : 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700 opacity-50 grayscale'
        )}
        aria-label={`Achievement: ${a.label}${a.earned ? ' (earned)' : ' (not yet earned)'}`}
      >
        <span className="text-2xl" role="img" aria-hidden="true">{a.icon}</span>
        <span className="text-xs font-medium text-center text-slate-700 dark:text-slate-300 leading-tight">{a.label}</span>
        {a.earned && (
          <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/40 px-2 py-0.5 rounded-full">Earned</span>
        )}
      </div>
    ))}
  </div>
);

// ─── Main Profile Page ─────────────────────────────────────────────────────
const Profile = () => {
  const { profile, updateProfile } = useProfile();
  const { addToast } = useToast();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(profile);

  const set = (key) => (val) => setDraft((p) => ({ ...p, [key]: val }));
  const setEmergency = (key) => (val) =>
    setDraft((p) => ({ ...p, emergencyContact: { ...p.emergencyContact, [key]: val } }));

  const handleSave = () => {
    updateProfile(draft);
    setEditing(false);
    addToast('Profile updated successfully!', 'success');
  };

  const handleCancel = () => {
    setDraft(profile);
    setEditing(false);
  };

  const data = editing ? draft : profile;

  return (
    <main className="space-y-6 animate-fade-in-up" aria-label="Profile Page">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">My Profile</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your personal information and wellness goals.</p>
        </div>
        <div className="flex items-center gap-3">
          {editing ? (
            <>
              <button
                onClick={handleCancel}
                aria-label="Cancel editing"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
              <button
                onClick={handleSave}
                aria-label="Save profile changes"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </>
          ) : (
            <button
              onClick={() => { setDraft(profile); setEditing(true); }}
              aria-label="Edit profile"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors border border-indigo-200 dark:border-indigo-800/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <Edit3 className="w-4 h-4" /> Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Profile Hero Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Cover */}
        <div className="h-28 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative" aria-hidden="true">
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Ccircle cx=\'20\' cy=\'20\' r=\'1\' fill=\'white\' /%3E%3C/svg%3E")' }} />
        </div>
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-12 mb-4">
            <ProfileAvatar
              profile={data}
              onAvatarChange={set('avatar')}
              editing={editing}
            />
            <div className="flex items-center gap-2 pb-1">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                Member since July 2026
              </span>
            </div>
          </div>
          {editing ? (
            <div className="flex gap-3">
              <div className="flex-1">
                <label htmlFor="firstName" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">First Name</label>
                <input id="firstName" value={data.firstName} onChange={(e) => set('firstName')(e.target.value)} className="mt-1 w-full text-lg font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="flex-1">
                <label htmlFor="lastName" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Name</label>
                <input id="lastName" value={data.lastName} onChange={(e) => set('lastName')(e.target.value)} className="mt-1 w-full text-lg font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{data.firstName} {data.lastName}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{data.occupation} · {data.email}</p>
            </div>
          )}
        </div>
      </div>

      {/* Personal Information */}
      <SettingsSection title="Personal Information" description="Your core demographic and contact details.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-6">
          <ProfileField id="email" label="Email Address" value={data.email} onChange={set('email')} type="email" editing={editing} />
          <ProfileField id="age" label="Age" value={data.age} onChange={set('age')} type="number" editing={editing} />
          <ProfileField id="gender" label="Gender" value={data.gender} onChange={set('gender')} type="select" options={GENDERS} editing={editing} />
          <ProfileField id="occupation" label="Occupation" value={data.occupation} onChange={set('occupation')} editing={editing} />
          <ProfileField id="language" label="Preferred Language" value={data.language} onChange={set('language')} type="select" options={LANGUAGES} editing={editing} />
          <ProfileField id="timezone" label="Time Zone" value={data.timezone} onChange={set('timezone')} type="select" options={TIMEZONES} editing={editing} />
        </div>
      </SettingsSection>

      {/* Emergency Contact */}
      <SettingsSection title="Emergency Contact" description="A trusted contact we can reach in urgent situations.">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 p-6">
          <ProfileField id="ecName" label="Full Name" value={data.emergencyContact.name} onChange={setEmergency('name')} editing={editing} />
          <ProfileField id="ecRelation" label="Relationship" value={data.emergencyContact.relation} onChange={setEmergency('relation')} type="select" options={RELATIONS} editing={editing} />
          <ProfileField id="ecPhone" label="Phone Number" value={data.emergencyContact.phone} onChange={setEmergency('phone')} type="tel" editing={editing} />
        </div>
      </SettingsSection>

      {/* Wellness Goals */}
      <SettingsSection title="Wellness Goals" description="What you want to work on. These guide your AI recommendations.">
        <div className="p-6">
          <GoalsManager goals={data.goals} onChange={set('goals')} editing={editing} />
        </div>
      </SettingsSection>

      {/* Achievements */}
      <SettingsSection title="Achievements" description="Badges you've earned through consistent engagement.">
        <div className="p-6">
          <AchievementsGrid achievements={data.achievements} />
        </div>
      </SettingsSection>
    </main>
  );
};

export default Profile;
