import React, { createContext, useContext, useState } from 'react';

const ProfileContext = createContext(null);

export const useProfile = () => useContext(ProfileContext);

const defaultProfile = {
  firstName: 'Alex',
  lastName: 'Morgan',
  email: 'alex.morgan@email.com',
  age: '28',
  gender: 'Prefer not to say',
  occupation: 'Software Engineer',
  language: 'English',
  timezone: 'Asia/Kolkata',
  avatar: null,
  emergencyContact: {
    name: 'Jordan Morgan',
    relation: 'Sibling',
    phone: '+91 98765 43210',
  },
  goals: ['Reduce anxiety', 'Improve sleep quality', 'Build mindfulness habit'],
  achievements: [
    { id: 1, label: '7-Day Streak', icon: '🔥', earned: true },
    { id: 2, label: 'First Assessment', icon: '📋', earned: true },
    { id: 3, label: 'Wellness Warrior', icon: '💪', earned: true },
    { id: 4, label: '30-Day Streak', icon: '⭐', earned: false },
    { id: 5, label: 'Mindfulness Master', icon: '🧘', earned: false },
    { id: 6, label: 'Journal Champion', icon: '📓', earned: true },
  ],
};

const defaultSettings = {
  theme: 'system',
  language: 'English',
  notifications: {
    dailyReminder: true,
    weeklyReport: true,
    assessmentReminder: false,
    exerciseReminder: true,
    emailNotifications: false,
  },
  privacy: {
    shareDataForResearch: false,
    showActivityStatus: true,
    allowAnonymousAnalytics: true,
  },
  accessibility: {
    highContrast: false,
    reducedMotion: false,
    largeFont: false,
    focusIndicators: true,
    screenReaderMode: false,
  },
};

export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(defaultProfile);
  const [settings, setSettings] = useState(defaultSettings);

  const updateProfile = (updates) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  const updateSettings = (section, updates) => {
    if (section) {
      setSettings((prev) => ({
        ...prev,
        [section]: { ...prev[section], ...updates },
      }));
    } else {
      setSettings((prev) => ({ ...prev, ...updates }));
    }
  };

  return (
    <ProfileContext.Provider value={{ profile, updateProfile, settings, updateSettings }}>
      {children}
    </ProfileContext.Provider>
  );
};
