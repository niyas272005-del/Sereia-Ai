import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Activity, Brain, TrendingUp, Dumbbell, BookOpen, MessageCircle,
  Calendar, ChevronDown, Loader2
} from 'lucide-react';
import AnalyticsStat from '../../components/dashboard/AnalyticsStat';
import {
  MoodTrendChart, EmotionPieChart, StressHeatmapChart,
  ActivityTimelineChart, RecoveryCurveChart, MonthlyTrendChart
} from '../../components/dashboard/AnalyticsCharts';
import { useMood } from '../../components/common/MoodContext';
import { useData } from '../../components/common/DataContext';

// ─── Chart Card wrapper ───────────────────────────────────────────────────────
// ─── Chart Card wrapper ───────────────────────────────────────────────────────
const ChartCard = ({ title, subtitle, children, action, badge, id, isHighlighted }) => (
  <div id={id} className={`bg-white dark:bg-slate-900 rounded-2xl border ${isHighlighted ? 'border-indigo-500 ring-2 ring-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)] animate-pulse' : 'border-slate-200 dark:border-slate-800 shadow-sm'} overflow-hidden transition-all duration-500`}>
    <div className="flex items-start justify-between p-5 border-b border-slate-100 dark:border-slate-800">
      <div>
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{title}</h3>
          {badge && (
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
              Live
            </span>
          )}
        </div>
        {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
    <div className="p-5">{children}</div>
  </div>
);

// ─── Empty state placeholder ─────────────────────────────────────────────────
const EmptyChart = ({ message }) => (
  <div className="flex items-center justify-center h-40 text-slate-400 dark:text-slate-500 text-sm font-medium text-center leading-relaxed">
    {message}
  </div>
);

const RANGES = ['This Week', 'Last Month', 'Last 3 Months', 'All Time'];

const Analytics = () => {
  const [range, setRange] = useState('This Week');
  const [rangeOpen, setRangeOpen] = useState(false);
  const [highlightedChart, setHighlightedChart] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const chart = params.get('chart');
    if (chart) {
      setHighlightedChart(chart);
      setTimeout(() => {
        const el = document.getElementById(`chart-${chart}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500);
      
      setTimeout(() => setHighlightedChart(null), 5000);
    }
  }, [location.search]);

  const { isLoading: moodLoading } = useMood();
  const { analyticsData, isLoading: dataLoading } = useData();

  const isLoading = moodLoading || dataLoading;
  const hasData   = analyticsData?.has_data ?? false;
  const summary   = analyticsData?.summary_stats ?? {};

  // ── Live values from analytics API ───────────────────────────────────────
  const avgMood          = summary.avg_mood;
  const avgStress        = summary.avg_stress;
  const totalLogs        = summary.total_logs ?? 0;
  const totalMsgs        = summary.chat_sessions ?? 0;
  const recoveryProgress = summary.recovery_progress;

  // Recharts-friendly weekly data — only real data, no static fallback
  const weeklyChartData = (analyticsData?.weekly_trend ?? []).map(d => ({
    day:    d.day,
    mood:   d.mood,
    stress: d.stress,
    energy: d.energy,
  }));

  // Monthly trend
  const monthlyChartData = (analyticsData?.monthly_trend ?? []).map(d => ({
    week:   d.week,
    mood:   d.mood,
    stress: d.stress,
  }));

  // Emotion color map
  const EMOTION_COLORS = {
    joy: '#10b981', sadness: '#6366f1', anxiety: '#f59e0b', anger: '#ef4444',
    stress: '#f97316', loneliness: '#8b5cf6', burnout: '#64748b', neutral: '#94a3b8',
  };

  // Emotion pie data — only real data
  const emotionPieData = (analyticsData?.emotion_distribution ?? []).map(d => ({
    name:  d.emotion,
    value: d.percentage,
    color: EMOTION_COLORS[d.emotion?.toLowerCase()] || '#94a3b8',
  }));

  // Activity timeline — daily chat counts
  const activityTimeline = (analyticsData?.activity_timeline ?? []).map(d => ({
    date:      d.date,
    exercises: 0,
    journals:  0,
    chats:     d.sessions,
  }));


  const stats = [
    {
      title:    'Average Mood',
      value:    avgMood ?? '—',
      unit:     avgMood != null ? '/10' : '',
      subtitle: hasData ? `Based on ${totalLogs} AI chat logs` : 'Start chatting to see data',
      trend:    null,
      icon:     Activity,
      iconBg:   'bg-indigo-50 dark:bg-indigo-900/30',
      iconColor:'text-indigo-600 dark:text-indigo-400',
      gradient: 'bg-indigo-400',
    },
    {
      title:    'Stress Score',
      value:    avgStress ?? '—',
      unit:     avgStress != null ? '/100' : '',
      subtitle: 'Lower is better',
      trend:    null,
      icon:     Brain,
      iconBg:   'bg-orange-50 dark:bg-orange-900/30',
      iconColor:'text-orange-600 dark:text-orange-400',
      gradient: 'bg-orange-400',
    },
    {
      title:    'Recovery Progress',
      value:    recoveryProgress != null ? `${recoveryProgress}%` : '—',
      subtitle: 'Based on mood trend',
      trend:    null,
      icon:     TrendingUp,
      iconBg:   'bg-green-50 dark:bg-green-900/30',
      iconColor:'text-green-600 dark:text-green-400',
      gradient: 'bg-green-400',
    },
    {
      title: 'Exercise Completion',
      value: `${analyticsData?.summary_stats?.exercise_completion ?? SUMMARY_STATS.exerciseCompletion}%`,
      subtitle: analyticsData?.summary_stats?.exercises_completed != null
        ? `${analyticsData.summary_stats.exercises_completed} exercises done`
        : '14 of 17 exercises done',
      trend: 5,
      icon: Dumbbell,
      iconBg: 'bg-purple-50 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
      gradient: 'bg-purple-400',
    },
    {
      title:    'Mood Logs',
      value:    totalLogs > 0 ? totalLogs : (hasData ? 0 : '—'),
      unit:     '',
      subtitle: 'Total AI conversation logs',
      trend:    null,
      icon:     BookOpen,
      iconBg:   'bg-teal-50 dark:bg-teal-900/30',
      iconColor:'text-teal-600 dark:text-teal-400',
      gradient: 'bg-teal-400',
    },
    {
      title: 'Chat Sessions',
      value: analyticsData?.summary_stats?.chat_sessions ?? (hasData ? Math.floor(totalMsgs / 2) : SUMMARY_STATS.aiUsage),
      unit: 'sessions',
      subtitle: hasData ? `${totalLogs} mood logs recorded` : 'Total interactions',
      trend: 3,
      icon: MessageCircle,
      iconBg: 'bg-blue-50 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      gradient: 'bg-blue-400',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Analytics
            </h1>
            {isLoading && <Loader2 size={20} className="animate-spin text-indigo-500" />}
            {hasData && !isLoading && (
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full">
                Showing live data
              </span>
            )}
          </div>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Track your mental wellness trends and patterns.
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="relative">
          <button
            onClick={() => setRangeOpen(!rangeOpen)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium text-slate-700 dark:text-slate-300 hover:border-indigo-400 transition-colors shadow-sm"
          >
            <Calendar className="w-4 h-4 text-indigo-500" />
            {range}
            <ChevronDown className={`w-4 h-4 transition-transform ${rangeOpen ? 'rotate-180' : ''}`} />
          </button>
          {rangeOpen && (
            <div className="absolute right-0 top-full mt-2 z-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 min-w-[160px]">
              {RANGES.map((r) => (
                <button
                  key={r}
                  onClick={() => { setRange(r); setRangeOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    range === r
                      ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 font-medium'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((s) => (
          <AnalyticsStat key={s.title} {...s} />
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard
            id="chart-mood_trend"
            isHighlighted={highlightedChart === 'mood_trend'}
            title="Weekly Mood Trend"
            subtitle="Daily mood score (0–10) derived from your AI conversations"
            badge={hasData && weeklyChartData.some(d => d.mood != null)}
          >
            {weeklyChartData.some(d => d.mood != null) ? (
              <MoodTrendChart data={weeklyChartData} />
            ) : (
              <EmptyChart message="💬 Send a message in AI Chat to generate your weekly mood trend." />
            )}
          </ChartCard>
        </div>
        <div>
          <ChartCard
            title="Emotion Distribution"
            subtitle={hasData ? 'Based on your AI chat sessions' : 'How you\'ve felt this month'}
            badge={hasData && emotionPieData.length > 0}
          >
            {emotionPieData.length > 0 ? (
              <EmotionPieChart data={emotionPieData} />
            ) : (
              <EmptyChart message="💬 Chat with the AI to see your real emotion breakdown here." />
            )}
          </ChartCard>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Monthly Mood vs Stress"
          subtitle="Week-by-week comparison"
          badge={hasData && monthlyChartData.some(d => d.mood != null)}
        >
          {monthlyChartData.some(d => d.mood != null) ? (
            <MonthlyTrendChart data={monthlyChartData} />
          ) : (
            <EmptyChart message="💬 Keep chatting with the AI — monthly trends appear after a few days of data." />
          )}
        </ChartCard>
        <ChartCard
          title="Recovery Progress"
          subtitle="Your overall mental wellness recovery score over time"
          badge={hasData}
        >
          {hasData && recoveryProgress != null ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" stroke="#e2e8f0" strokeWidth="12" fill="none" />
                  <circle
                    cx="60" cy="60" r="50"
                    stroke="#6366f1" strokeWidth="12" fill="none"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - recoveryProgress / 100)}`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">{recoveryProgress}%</span>
                  <span className="text-xs text-slate-400">Recovery</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 text-center">Based on mood average and engagement</p>
            </div>
          ) : (
            <EmptyChart message="💬 Chat with the AI to track your recovery progress over time." />
          )}
        </ChartCard>
      </div>

      {/* Activity Timeline */}
      <div>
        <ChartCard
          title="Activity Timeline"
          subtitle="Daily breakdown of AI chat sessions (last 14 days)"
          badge={hasData}
        >
          {activityTimeline.some(d => d.chats > 0) ? (
            <ActivityTimelineChart data={activityTimeline} />
          ) : (
            <EmptyChart message="💬 Your daily AI chat activity will appear here once you start conversations." />
          )}
        </ChartCard>
      </div>
    </div>
  );
};

export default Analytics;
