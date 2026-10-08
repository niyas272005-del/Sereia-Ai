import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { format, subDays } from 'date-fns';
import { chatService } from '../../services/chatService';

// ─── Helpers ────────────────────────────────────────────────────────────────

const EMOTION_COLORS = {
  joy:       '#10b981',
  sadness:   '#6366f1',
  anxiety:   '#f59e0b',
  anger:     '#ef4444',
  stress:    '#f97316',
  loneliness:'#8b5cf6',
  burnout:   '#64748b',
  neutral:   '#94a3b8',
  calm:      '#06b6d4',
  fear:      '#dc2626',
  surprise:  '#0ea5e9',
};

const EMOTION_LABEL = {
  joy:       'Joy / Happy',
  sadness:   'Sad',
  anxiety:   'Anxious',
  anger:     'Angry',
  stress:    'Stressed',
  loneliness:'Lonely',
  burnout:   'Burnout',
  neutral:   'Neutral',
  calm:      'Calm',
  fear:      'Fearful',
  surprise:  'Surprised',
};

/** Extract YYYY-MM-DD key from a timestamp string, handling both ISO and date-only strings. */
function toDateKey(timestamp) {
  if (!timestamp) return null;
  // If it already looks like a date-only string
  if (/^\d{4}-\d{2}-\d{2}$/.test(timestamp)) return timestamp;
  // Parse ISO string — split on 'T' first to avoid timezone shift issues
  return timestamp.split('T')[0];
}

/** Build last-7-days array for the mood trend chart, aggregating by calendar day. */
function buildWeeklyTrend(moodLogs) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    return { key: format(d, 'yyyy-MM-dd'), label: format(d, 'EEE') };
  });

  const grouped = {};
  for (const log of moodLogs) {
    const key = toDateKey(log.timestamp);
    if (!key) continue;
    if (!grouped[key]) grouped[key] = { total: 0, count: 0 };
    grouped[key].total += Number(log.mood_value) || 0;
    grouped[key].count += 1;
  }

  return days.map(({ key, label }) => ({
    day: label,
    name: label,
    // Return undefined (not null) so connectNulls works correctly in recharts
    mood: grouped[key] ? +(grouped[key].total / grouped[key].count).toFixed(1) : undefined,
  }));
}

/** Build monthly trend (last 4 weeks). */
function buildMonthlyTrend(moodLogs) {
  const weeks = [
    { label: 'Week 1', start: 28, end: 22 },
    { label: 'Week 2', start: 21, end: 15 },
    { label: 'Week 3', start: 14, end:  8 },
    { label: 'Week 4', start:  7, end:  1 },
  ];
  return weeks.map(({ label, start, end }) => {
    const slice = moodLogs.filter(log => {
      if (!log.timestamp) return false;
      const daysAgo = Math.floor((Date.now() - new Date(log.timestamp)) / 86400000);
      return daysAgo >= end && daysAgo <= start;
    });
    const avg = slice.length
      ? +(slice.reduce((s, l) => s + (Number(l.mood_value) || 0), 0) / slice.length).toFixed(1)
      : undefined;
    const stress = slice.length
      ? +(slice.reduce((s, l) => s + (Number(l.score) || 0) * 100, 0) / slice.length).toFixed(0)
      : undefined;
    return { week: label, mood: avg, stress };
  });
}

/** Calendar heatmap data: { 'yyyy-MM-dd': moodValue } */
function buildCalendarData(moodLogs) {
  const map = {};
  for (const log of moodLogs) {
    const key = toDateKey(log.timestamp);
    if (!key) continue;
    const val = Number(log.mood_value) || 0;
    // Keep highest mood value for the day
    if (!map[key] || val > map[key]) map[key] = val;
  }
  return map;
}

/** Emotion distribution for pie / progress bars. */
function buildEmotionDistribution(emotionCounts) {
  const total = Object.values(emotionCounts).reduce((s, v) => s + v, 0);
  if (total === 0) return [];
  return Object.entries(emotionCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([emotion, count]) => ({
      emotion,
      name: EMOTION_LABEL[emotion] || emotion.charAt(0).toUpperCase() + emotion.slice(1),
      count,
      value: Math.round((count / total) * 100),
      color: EMOTION_COLORS[emotion] || '#94a3b8',
    }));
}

/** Generate an AI insight string based on recent mood data. */
function generateInsight(summary, emotionDist) {
  if (!summary || summary.total_logs === 0) {
    return 'Start chatting with the AI or log your mood to see personalised insights here.';
  }
  const avg = summary.average_mood;
  const top = emotionDist[0];
  if (avg >= 8) return `You've been feeling great lately! Your average mood is ${avg}/10. Keep up what's working — maybe journal about it.`;
  if (avg >= 6) return `Your mood is generally positive at ${avg}/10. ${top ? `You've been feeling mostly ${top.name.toLowerCase()} (${top.value}%).` : ''} Small consistent habits make a big difference.`;
  if (avg >= 4) return `Your average mood is ${avg}/10 — some challenging moments. ${top ? `${top.name} has been your most common emotion.` : ''} Consider a breathing exercise or journaling your thoughts.`;
  return `It looks like you've been going through a tough time (avg ${avg}/10). Reaching out and talking about how you feel is a great first step. You're doing well by tracking your mood.`;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const MoodContext = createContext(null);

export const MoodProvider = ({ children }) => {
  const [moodLogs, setMoodLogs]           = useState([]);
  const [summary, setSummary]             = useState(null);
  const [emotionDist, setEmotionDist]     = useState([]);
  const [calendarData, setCalendarData]   = useState({});
  const [weeklyTrend, setWeeklyTrend]     = useState([]);
  const [monthlyTrend, setMonthlyTrend]   = useState([]);
  const [isLoading, setIsLoading]         = useState(false);
  const [lastRefresh, setLastRefresh]     = useState(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await chatService.getUserTrends();
      if (!data) return; // backend unavailable

      const logs = data.mood_logs || [];
      const sum  = data.summary   || {};
      const ec   = sum.emotion_counts || {};

      setMoodLogs(logs);
      setSummary(sum);
      setEmotionDist(buildEmotionDistribution(ec));
      setCalendarData(buildCalendarData(logs));
      setWeeklyTrend(buildWeeklyTrend(logs));
      setMonthlyTrend(buildMonthlyTrend(logs));
      setLastRefresh(new Date());
    } catch (err) {
      console.warn('[MoodContext] Failed to refresh mood data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => { refresh(); }, [refresh]);

  const insight = generateInsight(summary, emotionDist);

  const value = {
    moodLogs,
    summary,
    emotionDist,
    calendarData,
    weeklyTrend,
    monthlyTrend,
    isLoading,
    lastRefresh,
    insight,
    refreshMood: refresh,
  };

  return <MoodContext.Provider value={value}>{children}</MoodContext.Provider>;
};

export const useMood = () => {
  const ctx = useContext(MoodContext);
  if (!ctx) throw new Error('useMood must be used inside <MoodProvider>');
  return ctx;
};
