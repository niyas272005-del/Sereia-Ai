import React from 'react';
import { Activity, Brain, Shield, Flame, ChevronRight, PlayCircle, BookOpen, Clock, MoonStar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../components/dashboard/StatCard';
import Widget from '../../components/dashboard/Widget';
import Chart from '../../components/dashboard/Chart';
import { useMood } from '../../components/common/MoodContext';
import { useData } from '../../components/common/DataContext';
import { useProfile } from '../../components/common/ProfileContext';

const EMOTION_LABEL = {
  joy: 'Great', sadness: 'Sad', anxiety: 'Anxious', anger: 'Angry',
  stress: 'Stressed', loneliness: 'Lonely', neutral: 'Okay',
  calm: 'Calm', burnout: 'Tired', fear: 'Fearful',
};

const DashboardHome = () => {
  const { moodLogs, weeklyTrend } = useMood();
  const { dashboardData } = useData();
  const { profile } = useProfile();
  const navigate = useNavigate();

  // Dynamic greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
  const firstName = profile?.firstName || 'Friend';

  // Live dashboard stats
  const lastLog = moodLogs.length > 0 ? moodLogs[moodLogs.length - 1] : null;
  const todayEmotion = lastLog?.emotion ?? null;
  const todayMoodLabel = todayEmotion ? (EMOTION_LABEL[todayEmotion] || 'Good') : 'Great';
  
  const stressLabel  = dashboardData?.stress_label ?? 'N/A';
  const wellnessStatus = dashboardData?.wellness_status ?? 'N/A';
  const chatSessions = dashboardData?.total_conversations ?? 0;
  const latestRec    = dashboardData?.latest_recommendation ?? null;

  // Build chart data
  const chartData = weeklyTrend && weeklyTrend.length > 0
    ? weeklyTrend.map(d => ({ name: d.day, mood: d.mood ?? 0 }))
    : [];

  const recentLogs = [...moodLogs].reverse().slice(0, 3);

  return (
    <div className="space-y-6 animate-fade-in-up pb-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {greeting}, {firstName} 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Here is how you are doing today.</p>
        </div>
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-800 dark:text-indigo-200 px-5 py-3.5 rounded-2xl border border-indigo-100 dark:border-indigo-800/50 shadow-sm">
          <p className="text-sm italic font-semibold">"Healing takes time, and asking for help is a courageous step."</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Today's Mood"
          value={todayMoodLabel}
          icon={Activity}
          trend={15}
          trendLabel="vs last week"
          colorClass="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50"
        />
        <StatCard 
          title="Stress Level" 
          value={stressLabel}
          icon={Brain} 
          trend={-12} 
          trendLabel="vs last week"
          colorClass="text-sky-600 bg-sky-50 dark:bg-sky-900/30 dark:text-sky-400 border border-sky-100 dark:border-sky-800/50"
        />
        <StatCard 
          title="Wellness Status"
          value={wellnessStatus}
          icon={MoonStar} 
          trend={5} 
          trendLabel="from AI analysis"
          colorClass="text-purple-600 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-100 dark:border-purple-800/50"
        />
        <StatCard 
          title="Chat Sessions" 
          value={chatSessions} 
          icon={Flame} 
          trend={chatSessions > 0 ? 1 : 0} 
          trendLabel="total sessions"
          colorClass="text-orange-600 bg-orange-50 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-100 dark:border-orange-800/50"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Widget title="Weekly Mood Trends">
            {chartData.length > 0 ? (
              <Chart data={chartData} dataKey="mood" color="#6366f1" />
            ) : (
              <div className="flex items-center justify-center h-40 text-slate-400 dark:text-slate-500 text-sm font-medium">
                💬 Send a message to the AI to generate your mood trend chart.
              </div>
            )}
          </Widget>

          <Widget title="Today's Wellness Journey">
            <div className="space-y-5">
              <div className="group flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 hover:bg-white dark:hover:bg-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer" onClick={() => navigate('/dashboard/wellness')}>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl shadow-inner">
                    <PlayCircle size={22} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">
                      {latestRec || 'Mindful Breathing'}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">
                      {latestRec ? 'Recommended by AI' : '5 mins remaining'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                    {latestRec ? '100%' : '50%'}
                  </span>
                  <div className="w-24 mt-2 bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full" style={{ width: latestRec ? '100%' : '50%' }}></div>
                  </div>
                </div>
              </div>

              <div className="group flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 hover:bg-white dark:hover:bg-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer" onClick={() => navigate('/dashboard/journal')}>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-xl shadow-inner">
                    <BookOpen size={22} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Anxiety Journaling</h4>
                    <p className="text-xs text-slate-500 font-medium">Not started</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-slate-400 dark:text-slate-500">0%</span>
                  <div className="w-24 mt-2 bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div className="bg-slate-300 dark:bg-slate-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </Widget>
        </div>

        <div className="space-y-6">
          <Widget title="Quick Actions" noPadding>
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60 p-2">
              <button onClick={() => navigate('/dashboard/mood')} className="w-full p-4 rounded-xl flex items-center justify-between hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all text-left group">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl group-hover:scale-110 transition-transform">
                    <Activity size={18} strokeWidth={2.5} />
                  </div>
                  <span className="font-bold text-slate-700 dark:text-slate-200">Log new mood</span>
                </div>
                <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
              </button>

              <button onClick={() => navigate('/dashboard/chat')} className="w-full p-4 rounded-xl flex items-center justify-between hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-all text-left group mt-1">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-xl group-hover:scale-110 transition-transform">
                    <Brain size={18} strokeWidth={2.5} />
                  </div>
                  <span className="font-bold text-slate-700 dark:text-slate-200">Start AI Chat</span>
                </div>
                <ChevronRight size={18} className="text-slate-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
              </button>
            </div>
          </Widget>

          <Widget title="Recent Activity">
            <div className="space-y-6 pt-2">
              {recentLogs.length > 0 ? recentLogs.map((log, index) => (
                <div key={log.id || index} className={`relative pl-6 ${index !== recentLogs.length - 1 ? 'border-l-2 border-indigo-100 dark:border-indigo-900/50 pb-6' : ''}`}>
                  <div className="absolute w-3.5 h-3.5 bg-indigo-500 rounded-full -left-[8px] top-1 ring-4 ring-white dark:ring-slate-900 shadow-sm"></div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    Logged mood: <span className="capitalize text-indigo-600 dark:text-indigo-400">{log.emotion}</span>
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1.5 font-medium">
                    <Clock size={12} />
                    {log.timestamp ? new Date(log.timestamp).toLocaleDateString() : 'Today'}
                  </div>
                </div>
              )) : (
                <div className="text-center py-6 text-slate-500 text-sm font-medium">
                  No recent activity. Start a chat with the AI!
                </div>
              )}
            </div>
          </Widget>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
