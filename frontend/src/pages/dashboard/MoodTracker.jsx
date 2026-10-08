import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import {
  CheckCircle2, RefreshCw, Loader2, TrendingUp,
  Calendar, BarChart2, Smile, MessageCircle, Brain,
  Activity, Hash, Heart, Zap,
} from 'lucide-react';
import Widget from '../../components/dashboard/Widget';
import MoodCalendar from '../../components/dashboard/MoodCalendar';
import ProgressChart from '../../components/dashboard/ProgressChart';
import { useToast } from '../../components/common/ToastContext';
import { useMood } from '../../components/common/MoodContext';
import { chatService } from '../../services/chatService';

// ─── Config ──────────────────────────────────────────────────────────────────

const MOODS = [
  {
    id: 'great', emoji: '😄', label: 'Great',
    activeBg:   'bg-emerald-50 dark:bg-emerald-500/15',
    activeRing: 'ring-2 ring-emerald-400/60',
    activeTxt:  'text-emerald-700 dark:text-emerald-300',
    gradient:   'from-emerald-400 to-teal-500',
  },
  {
    id: 'good',  emoji: '🙂', label: 'Good',
    activeBg:   'bg-sky-50 dark:bg-sky-500/15',
    activeRing: 'ring-2 ring-sky-400/60',
    activeTxt:  'text-sky-700 dark:text-sky-300',
    gradient:   'from-sky-400 to-blue-500',
  },
  {
    id: 'okay',  emoji: '😐', label: 'Okay',
    activeBg:   'bg-amber-50 dark:bg-amber-500/15',
    activeRing: 'ring-2 ring-amber-400/60',
    activeTxt:  'text-amber-700 dark:text-amber-300',
    gradient:   'from-amber-400 to-orange-400',
  },
  {
    id: 'bad',   emoji: '🙁', label: 'Bad',
    activeBg:   'bg-orange-50 dark:bg-orange-500/15',
    activeRing: 'ring-2 ring-orange-400/60',
    activeTxt:  'text-orange-700 dark:text-orange-300',
    gradient:   'from-orange-400 to-rose-400',
  },
  {
    id: 'awful', emoji: '😫', label: 'Awful',
    activeBg:   'bg-rose-50 dark:bg-rose-500/15',
    activeRing: 'ring-2 ring-rose-400/60',
    activeTxt:  'text-rose-700 dark:text-rose-300',
    gradient:   'from-rose-500 to-red-600',
  },
];

const EMOJI_MAP = {
  joy: '😄', sadness: '😢', anxiety: '😰', anger: '😠',
  stress: '😤', loneliness: '😔', neutral: '😐', calm: '😌',
  burnout: '😩', fear: '😱', surprise: '😮',
};

const CLASSIFICATION_COLOR = {
  Normal:   'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200/60 dark:border-emerald-500/20',
  Mild:     'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200/60 dark:border-amber-500/20',
  Moderate: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 border-orange-200/60 dark:border-orange-500/20',
  Severe:   'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-200/60 dark:border-rose-500/20',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionHeader = ({ icon: Icon, title, description }) => (
  <div className="flex items-start gap-3 mb-5">
    <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500/15 to-violet-500/15
      border border-indigo-200/40 dark:border-indigo-500/20 flex items-center justify-center">
      <Icon size={15} className="text-indigo-500 dark:text-indigo-400" />
    </div>
    <div>
      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug">{title}</p>
      {description && (
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 leading-relaxed">{description}</p>
      )}
    </div>
  </div>
);

const RecentLogCard = ({ log, highlight }) => {
  const moodVal = log.mood_value ?? +((1 - log.score) * 10).toFixed(1);
  const emotion = log.emotion
    ? log.emotion.charAt(0).toUpperCase() + log.emotion.slice(1)
    : 'Neutral';
  const ts  = log.timestamp ? new Date(log.timestamp) : null;
  const cls = CLASSIFICATION_COLOR[log.classification] || CLASSIFICATION_COLOR.Normal;

  return (
    <div className={`flex items-center gap-3 p-3.5 rounded-2xl
      bg-white/40 dark:bg-white/4 border 
      hover:bg-white/60 dark:hover:bg-white/8 transition-all duration-200 backdrop-blur-sm ${
      highlight ? 'ring-2 ring-indigo-500 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'border-white/50 dark:border-white/8'
      }`}>
      <span className="text-2xl shrink-0 leading-none">{EMOJI_MAP[log.emotion?.toLowerCase()] || '💭'}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 flex-wrap mb-0.5">
          <span className="font-semibold text-sm text-slate-800 dark:text-slate-100">{emotion}</span>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cls}`}>
              {log.classification || 'Normal'}
            </span>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              {Number(moodVal).toFixed(1)}/10
            </span>
          </div>
        </div>
        <p className="text-[11px] text-slate-400 dark:text-slate-500">
          {ts ? formatDistanceToNow(ts, { addSuffix: true }) : ''}
        </p>
      </div>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────

const MoodTracker = () => {
  const location = useLocation();
  const {
    moodLogs, summary, emotionDist,
    calendarData, weeklyTrend, monthlyTrend,
    isLoading, insight, refreshMood, hasData
  } = useMood();
  const { addToast } = useToast();

  const [selectedMood, setSelectedMood] = useState(null);
  const [intensity, setIntensity] = useState(5);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [highlightToday, setHighlightToday] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('highlight') === 'today') {
      setHighlightToday(true);
      setTimeout(() => {
        const el = document.getElementById('recent-logs');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500);
      
      // Remove highlight after a few seconds
      setTimeout(() => setHighlightToday(false), 5000);
    }
  }, [location.search]);

  const recentLogs = [...moodLogs].reverse().slice(0, 6);

  const handleSave = async () => {
    if (!selectedMood) return;
    setSaving(true);
    try {
      await chatService.logManualMood({ mood: selectedMood, intensity: +intensity, note: note.trim() });
      addToast('Mood logged successfully!', 'success');
      await refreshMood();
      setSelectedMood(null);
      setIntensity(5);
      setNote('');
    } catch {
      addToast('Failed to log mood — please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // KPI strip data
  const kpiCards = [
    {
      label:    'Avg Mood Score',
      value:    hasData ? `${summary?.average_mood}/10` : '7.8/10',
      desc:     'Mean of all AI-detected mood scores',
      icon:     Activity,
      gradient: 'from-blue-500 to-indigo-600',
      glow:     'shadow-blue-500/20',
    },
    {
      label:    'Total Chat Logs',
      value:    summary?.total_logs || 24,
      desc:     'Every AI chat creates a mood log',
      icon:     Hash,
      gradient: 'from-emerald-500 to-teal-600',
      glow:     'shadow-emerald-500/20',
    },
    {
      label:    'Top Emotion',
      value:    emotionDist[0]?.name || 'Joy / Happy',
      desc:     'Most frequent emotion detected',
      icon:     Heart,
      gradient: 'from-amber-500 to-orange-500',
      glow:     'shadow-amber-500/20',
    },
    {
      label:    'AI Messages',
      value:    summary?.total_messages || 156,
      desc:     'Total messages sent to the AI',
      icon:     Zap,
      gradient: 'from-violet-500 to-purple-600',
      glow:     'shadow-violet-500/20',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up pb-8">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Mood Tracker
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm max-w-xl leading-relaxed">
            Your emotional wellbeing is tracked automatically from every AI chat. Use this page to
            understand your patterns, catch early warning signs, and celebrate progress.
          </p>
        </div>
        <button
          onClick={refreshMood}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold
            glass-card border border-white/30 dark:border-white/10
            text-slate-600 dark:text-slate-300
            hover:-translate-y-0.5 hover:shadow-quantum transition-all duration-200
            disabled:opacity-50 shrink-0"
        >
          {isLoading
            ? <Loader2 size={15} className="animate-spin" />
            : <RefreshCw size={15} />
          }
          {isLoading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {/* ── KPI Summary Strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {kpiCards.map(({ label, value, desc, icon: Icon, gradient, glow }) => (
          <div
            key={label}
            title={desc}
            className="quantum-card p-4 group"
          >
            {/* Icon */}
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient}
              flex items-center justify-center text-white shadow-md ${glow}
              mb-3 group-hover:scale-110 transition-transform duration-300`}>
              <Icon size={18} strokeWidth={1.8} />
            </div>
            <p className="text-xl font-bold text-slate-900 dark:text-white leading-none mb-1">
              {value}
            </p>
            <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 leading-snug">
              {label}
            </p>
            <p className="text-[10px] text-slate-300 dark:text-slate-600 mt-0.5 hidden sm:block leading-relaxed">
              {desc}
            </p>
          </div>
        ))}
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── LEFT: Log + Recent ── */}
        <div className="lg:col-span-1 space-y-5">

          {/* Manual Log Widget */}
          <div className="quantum-card p-5">
            <SectionHeader
              icon={Smile}
              title="How are you feeling right now?"
              description="Log your current mood manually. Your note is also analysed by the AI to improve accuracy."
            />

            {/* Mood Selection Grid */}
            <div className="grid grid-cols-5 gap-2 mb-5">
              {MOODS.map((m) => {
                const active = selectedMood === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMood(m.id)}
                    title={m.label}
                    className={`flex flex-col items-center justify-center py-3 rounded-2xl
                      border transition-all duration-200 select-none
                      ${active
                        ? `${m.activeBg} ${m.activeRing} scale-105 shadow-md border-transparent`
                        : 'bg-white/40 dark:bg-white/5 border-white/40 dark:border-white/8 hover:scale-105 hover:bg-white/60 dark:hover:bg-white/10 hover:shadow-sm'
                      }`}
                  >
                    <span className={`text-2xl leading-none transition-transform duration-200 ${active ? 'scale-110' : ''}`}>
                      {m.emoji}
                    </span>
                    <span className={`text-[10px] font-semibold mt-1.5 leading-none ${active ? m.activeTxt : 'text-slate-400 dark:text-slate-500'}`}>
                      {m.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Intensity Slider — only when mood selected */}
            {selectedMood && (
              <div className="mb-5 space-y-2.5 animate-fade-in-up">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                    Intensity
                  </span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-xl
                    bg-gradient-to-r from-blue-500/10 to-violet-500/10
                    text-indigo-700 dark:text-indigo-300
                    border border-indigo-200/40 dark:border-indigo-500/20">
                    {intensity}/10
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={intensity}
                  onChange={(e) => setIntensity(e.target.value)}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer accent-indigo-600
                    bg-slate-200 dark:bg-slate-700"
                />
                <div className="flex justify-between text-[10px] font-medium text-slate-400 dark:text-slate-500">
                  <span>Mild</span>
                  <span>Intense</span>
                </div>
              </div>
            )}

            {/* Note Textarea */}
            <div className="mb-5 space-y-2">
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Note (optional — helps AI analyse context)
              </label>
              <textarea
                placeholder="What's making you feel this way? e.g. 'Had a rough meeting, feeling drained…'"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="w-full p-3 text-sm resize-none rounded-xl transition-all duration-200
                  glass-input text-slate-800 dark:text-slate-200
                  placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={!selectedMood || saving}
              className={`w-full py-3 rounded-xl font-bold text-sm text-white
                flex justify-center items-center gap-2 transition-all duration-200
                ${selectedMood && !saving
                  ? 'bg-gradient-to-r from-blue-600 to-violet-600 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/35 hover:-translate-y-0.5 active:translate-y-0'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                }`}
            >
              {saving
                ? <Loader2 size={18} className="animate-spin" />
                : <CheckCircle2 size={18} />
              }
              {saving ? 'Saving…' : 'Save Mood Log'}
            </button>
          </div>

          {/* Recent Logs */}
          <div className="quantum-card p-5" id="recent-logs">
            <SectionHeader
              icon={MessageCircle}
              title="Recent Mood Logs"
              description="Each AI conversation automatically creates a mood entry using NLP emotion detection."
            />
            {isLoading && !hasData ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 size={24} className="animate-spin text-indigo-400" />
              </div>
            ) : recentLogs.length > 0 ? (
              <div className="space-y-2">
                {recentLogs.map((log, index) => (
                  <RecentLogCard key={log.id} log={log} highlight={highlightToday && index === 0} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 space-y-2">
                <p className="text-4xl">💬</p>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No logs yet</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                  Start a chat with the AI — every message auto-creates a mood entry.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Charts ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Mood Trend Chart */}
          <div className="quantum-card p-5">
            <SectionHeader
              icon={TrendingUp}
              title="Mood Trend Over Time"
              description="Shows your mood wellness score (0–10) over the past 7 days or 4 weeks. Each data point is the average score computed from all AI conversations on that day using VADER sentiment analysis + keyword emotion detection."
            />
            <ProgressChart
              liveWeeklyData={weeklyTrend}
              liveMonthlyData={monthlyTrend}
            />
          </div>

          {/* Calendar + Emotion Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Calendar */}
            <div className="quantum-card p-5">
              <SectionHeader
                icon={Calendar}
                title="Mood Calendar"
                description="A heatmap showing which days you engaged with the AI."
              />
              <MoodCalendar moodData={calendarData} />
            </div>

            {/* Emotion Distribution */}
            <div className="quantum-card p-5">
              <SectionHeader
                icon={BarChart2}
                title="Emotion Distribution"
                description="Breakdown of all emotions detected across your AI chats."
              />

              {emotionDist.length > 0 ? (
                <div className="space-y-3">
                  {emotionDist.slice(0, 6).map(({ emotion, name, value, color }) => (
                    <div key={emotion}>
                      <div className="flex justify-between items-center text-xs mb-1.5">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{name}</span>
                        <span className="font-bold text-slate-500 dark:text-slate-400">{value}%</span>
                      </div>
                      <div className="w-full bg-slate-100/80 dark:bg-white/6 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-2 rounded-full transition-all duration-700"
                          style={{ width: `${value}%`, backgroundColor: color }}
                        />
                      </div>
                    </div>
                  ))}

                  {/* AI Insight */}
                  <div className="mt-4 p-3.5 rounded-xl
                    bg-gradient-to-br from-blue-50/80 to-violet-50/80 dark:from-blue-500/8 dark:to-violet-500/8
                    border border-indigo-100/60 dark:border-indigo-500/15
                    flex items-start gap-2.5">
                    <Brain size={15} className="text-indigo-500 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed">{insight}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Placeholder bars */}
                  {[
                    { name: 'Happy',   pct: 45, color: '#10b981' },
                    { name: 'Anxious', pct: 25, color: '#f59e0b' },
                    { name: 'Sad',     pct: 20, color: '#6366f1' },
                    { name: 'Calm',    pct: 10, color: '#06b6d4' },
                  ].map(({ name, pct, color }) => (
                    <div key={name}>
                      <div className="flex justify-between items-center text-xs mb-1.5">
                        <span className="font-medium text-slate-400 dark:text-slate-500">{name}</span>
                        <span className="text-slate-300 dark:text-slate-600">{pct}%</span>
                      </div>
                      <div className="w-full bg-slate-100/80 dark:bg-white/6 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-2 rounded-full opacity-25"
                          style={{ width: `${pct}%`, backgroundColor: color }}
                        />
                      </div>
                    </div>
                  ))}
                  <p className="text-xs text-center text-slate-400 dark:text-slate-500 mt-3
                    bg-white/40 dark:bg-white/4 border border-white/40 dark:border-white/8
                    p-3 rounded-xl backdrop-blur-sm">
                    💬 Chat with the AI to see your real emotion breakdown here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodTracker;
