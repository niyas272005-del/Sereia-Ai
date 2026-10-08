import React from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useTheme } from '../common/ThemeProvider';

// ─── Shared Tooltip Styles ─────────────────────────────────────────────────
const useTooltipStyle = (isDarkMode) => ({
  backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
  borderColor: isDarkMode ? '#334155' : '#e2e8f0',
  color: isDarkMode ? '#f8fafc' : '#0f172a',
  borderRadius: '0.5rem',
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  fontSize: '12px',
});

const useAxisStyle = (isDarkMode) => ({
  fill: isDarkMode ? '#94a3b8' : '#64748b',
  fontSize: 11,
});

const useGridColor = (isDarkMode) => (isDarkMode ? '#334155' : '#e2e8f0');

// ─── Area / Line Chart ─────────────────────────────────────────────────────
export const MoodTrendChart = ({ data }) => {
  const { isDarkMode } = useTheme();
  const tooltipStyle = useTooltipStyle(isDarkMode);
  const axisStyle = useAxisStyle(isDarkMode);
  const gridColor = useGridColor(isDarkMode);

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="stressGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={axisStyle} />
          <YAxis axisLine={false} tickLine={false} tick={axisStyle} domain={[0, 10]} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
          <Area
            type="monotone" dataKey="mood" name="Mood (0-10)"
            stroke="#6366f1" strokeWidth={2.5} fill="url(#moodGrad)"
            connectNulls={true}
            dot={{ r: 4, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
            activeDot={{ r: 6 }}
          />
          <Area
            type="monotone" dataKey="energy" name="Energy %"
            stroke="#10b981" strokeWidth={2} strokeDasharray="4 2" fill="none"
            connectNulls={true}
            dot={{ r: 3, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// ─── Emotion Distribution (Pie) ────────────────────────────────────────────
const RADIAN = Math.PI / 180;
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
  if (percent < 0.06) return null;
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export const EmotionPieChart = ({ data }) => {
  const { isDarkMode } = useTheme();
  const tooltipStyle = useTooltipStyle(isDarkMode);

  return (
    <div className="w-full h-64 flex flex-col">
      <ResponsiveContainer width="100%" height="80%">
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" outerRadius={90} dataKey="value" labelLine={false} label={renderCustomLabel}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${value}%`, '']} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
            {entry.name}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Stress Heatmap (Bar) ──────────────────────────────────────────────────
const getHeatColor = (value) => {
  if (value >= 70) return '#ef4444';
  if (value >= 55) return '#f97316';
  if (value >= 40) return '#f59e0b';
  if (value >= 25) return '#84cc16';
  return '#22c55e';
};

export const StressHeatmapChart = ({ data }) => {
  const { isDarkMode } = useTheme();
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="w-full overflow-auto">
      <div className="grid gap-1 min-w-[340px]" style={{ gridTemplateColumns: `60px repeat(7, 1fr)` }}>
        {/* Header */}
        <div className="text-xs text-slate-400" />
        {days.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-slate-500 dark:text-slate-400 pb-1">{d}</div>
        ))}
        {/* Rows */}
        {data.map((row) => (
          <React.Fragment key={row.hour}>
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center pr-2 font-medium">{row.hour}</div>
            {days.map((d) => {
              const val = row[d];
              return (
                <div
                  key={d}
                  title={`${row.hour} ${d}: ${val}`}
                  className="h-8 rounded-md flex items-center justify-center text-white text-xs font-semibold transition-transform hover:scale-110 cursor-default"
                  style={{ backgroundColor: getHeatColor(val) }}
                >
                  {val}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3 text-xs text-slate-500 dark:text-slate-400">
        <span>Low</span>
        {['#22c55e', '#84cc16', '#f59e0b', '#f97316', '#ef4444'].map(c => (
          <span key={c} className="w-4 h-4 rounded" style={{ backgroundColor: c }} />
        ))}
        <span>High</span>
      </div>
    </div>
  );
};

// ─── Activity Timeline (Bar) ───────────────────────────────────────────────
export const ActivityTimelineChart = ({ data }) => {
  const { isDarkMode } = useTheme();
  const tooltipStyle = useTooltipStyle(isDarkMode);
  const axisStyle = useAxisStyle(isDarkMode);
  const gridColor = useGridColor(isDarkMode);

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={8} barGap={2}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={axisStyle} interval={2} />
          <YAxis axisLine={false} tickLine={false} tick={axisStyle} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
          <Bar dataKey="exercises" name="Exercises" fill="#6366f1" radius={[3, 3, 0, 0]} />
          <Bar dataKey="journals" name="Journals" fill="#10b981" radius={[3, 3, 0, 0]} />
          <Bar dataKey="chats" name="AI Chats" fill="#f59e0b" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// ─── Recovery Curve (Line) ─────────────────────────────────────────────────
export const RecoveryCurveChart = ({ data }) => {
  const { isDarkMode } = useTheme();
  const tooltipStyle = useTooltipStyle(isDarkMode);
  const axisStyle = useAxisStyle(isDarkMode);
  const gridColor = useGridColor(isDarkMode);

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="recoveryGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={axisStyle} />
          <YAxis axisLine={false} tickLine={false} tick={axisStyle} domain={[0, 100]} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}`, 'Recovery Score']} />
          <Line
            type="monotone"
            dataKey="score"
            stroke="url(#recoveryGrad)"
            strokeWidth={3}
            connectNulls={true}
            dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// ─── Monthly Mood vs Stress (Double Bar) ──────────────────────────────────
export const MonthlyTrendChart = ({ data }) => {
  const { isDarkMode } = useTheme();
  const tooltipStyle = useTooltipStyle(isDarkMode);
  const axisStyle = useAxisStyle(isDarkMode);
  const gridColor = useGridColor(isDarkMode);

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
          <XAxis dataKey="week" axisLine={false} tickLine={false} tick={axisStyle} />
          <YAxis axisLine={false} tickLine={false} tick={axisStyle} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
          <Bar dataKey="mood" name="Avg Mood (x10)" fill="#6366f1" radius={[4, 4, 0, 0]} />
          <Bar dataKey="stress" name="Stress %" fill="#f59e0b" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
