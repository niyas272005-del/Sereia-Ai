// Shared realistic analytics mock data used across Analytics and Reports pages

export const WEEKLY_MOOD = [
  { day: 'Mon', mood: 6.2, stress: 55, energy: 60 },
  { day: 'Tue', mood: 7.4, stress: 42, energy: 72 },
  { day: 'Wed', mood: 5.8, stress: 68, energy: 48 },
  { day: 'Thu', mood: 8.1, stress: 30, energy: 85 },
  { day: 'Fri', mood: 7.6, stress: 38, energy: 78 },
  { day: 'Sat', mood: 8.5, stress: 22, energy: 90 },
  { day: 'Sun', mood: 9.0, stress: 18, energy: 95 },
];

export const MONTHLY_MOOD = [
  { week: 'Week 1', mood: 6.5, stress: 52 },
  { week: 'Week 2', mood: 7.2, stress: 44 },
  { week: 'Week 3', mood: 6.8, stress: 48 },
  { week: 'Week 4', mood: 7.9, stress: 35 },
];

export const EMOTION_DISTRIBUTION = [
  { name: 'Calm', value: 34, color: '#6366f1' },
  { name: 'Anxious', value: 22, color: '#f59e0b' },
  { name: 'Happy', value: 28, color: '#10b981' },
  { name: 'Sad', value: 10, color: '#64748b' },
  { name: 'Angry', value: 6, color: '#ef4444' },
];

export const STRESS_HEATMAP = [
  { hour: '6am', Mon: 30, Tue: 25, Wed: 45, Thu: 20, Fri: 35, Sat: 10, Sun: 8 },
  { hour: '9am', Mon: 55, Tue: 48, Wed: 70, Thu: 40, Fri: 52, Sat: 20, Sun: 15 },
  { hour: '12pm', Mon: 65, Tue: 60, Wed: 80, Thu: 50, Fri: 62, Sat: 30, Sun: 22 },
  { hour: '3pm', Mon: 72, Tue: 65, Wed: 85, Thu: 55, Fri: 70, Sat: 25, Sun: 18 },
  { hour: '6pm', Mon: 58, Tue: 50, Wed: 68, Thu: 42, Fri: 48, Sat: 20, Sun: 15 },
  { hour: '9pm', Mon: 40, Tue: 35, Wed: 50, Thu: 30, Fri: 32, Sat: 18, Sun: 12 },
];

export const ACTIVITY_TIMELINE = [
  { date: 'Jul 1', exercises: 2, journals: 1, chats: 3 },
  { date: 'Jul 2', exercises: 1, journals: 2, chats: 2 },
  { date: 'Jul 3', exercises: 3, journals: 1, chats: 4 },
  { date: 'Jul 4', exercises: 0, journals: 3, chats: 1 },
  { date: 'Jul 5', exercises: 2, journals: 2, chats: 3 },
  { date: 'Jul 6', exercises: 4, journals: 1, chats: 2 },
  { date: 'Jul 7', exercises: 3, journals: 2, chats: 5 },
  { date: 'Jul 8', exercises: 2, journals: 3, chats: 3 },
  { date: 'Jul 9', exercises: 1, journals: 1, chats: 2 },
  { date: 'Jul 10', exercises: 3, journals: 2, chats: 4 },
  { date: 'Jul 11', exercises: 2, journals: 2, chats: 3 },
  { date: 'Jul 12', exercises: 4, journals: 3, chats: 5 },
  { date: 'Jul 13', exercises: 3, journals: 2, chats: 4 },
];

export const RECOVERY_CURVE = [
  { date: 'Day 1', score: 32 },
  { date: 'Day 5', score: 38 },
  { date: 'Day 10', score: 45 },
  { date: 'Day 15', score: 52 },
  { date: 'Day 20', score: 61 },
  { date: 'Day 25', score: 68 },
  { date: 'Day 30', score: 75 },
  { date: 'Day 35', score: 78 },
  { date: 'Day 40', score: 82 },
];

export const SUMMARY_STATS = {
  averageMood: 7.4,
  stressScore: 38,
  recoveryProgress: 78,
  exerciseCompletion: 82,
  journalCount: 24,
  aiUsage: 47,
};

export const REPORTS = [
  {
    id: 'weekly',
    title: 'Weekly Summary Report',
    description: 'An overview of your mood, stress, and wellness activities for the current week.',
    icon: '📊',
    date: 'Jul 7 – Jul 13, 2026',
    pages: 4,
    type: 'weekly',
  },
  {
    id: 'monthly',
    title: 'Monthly Wellness Report',
    description: 'A comprehensive view of your mental health trends throughout the month.',
    icon: '📅',
    date: 'July 2026',
    pages: 8,
    type: 'monthly',
  },
  {
    id: 'mood',
    title: 'Mood Analysis Report',
    description: 'Deep dive into your emotional patterns, triggers, and mood fluctuations.',
    icon: '🧠',
    date: 'Last 30 Days',
    pages: 6,
    type: 'mood',
  },
  {
    id: 'assessment',
    title: 'Assessment Summary',
    description: 'Collated results from PHQ-9, GAD-7, and all clinical assessments taken.',
    icon: '📋',
    date: 'July 2026',
    pages: 5,
    type: 'assessment',
  },
  {
    id: 'journal',
    title: 'Journal Summary Report',
    description: 'Key themes, emotion patterns, and insights extracted from your journal entries.',
    icon: '📓',
    date: 'Last 30 Days',
    pages: 7,
    type: 'journal',
  },
];
