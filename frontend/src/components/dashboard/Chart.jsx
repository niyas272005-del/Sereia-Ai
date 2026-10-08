import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { useTheme } from '../common/ThemeProvider';

const CustomTooltip = ({ active, payload, label, color }) => {
  if (!active || !payload || !payload.length) return null;
  const val = payload[0]?.value;
  if (val == null) return null;

  const emoji =
    val >= 8 ? '😄' :
    val >= 6 ? '🙂' :
    val >= 4 ? '😐' :
    val >= 2 ? '😟' : '😔';
  const label2 =
    val >= 8 ? 'Excellent' :
    val >= 6 ? 'Good' :
    val >= 4 ? 'Fair' :
    val >= 2 ? 'Low' : 'Very Low';

  return (
    <div className="glass-card-sm px-3.5 py-2.5 border border-white/30 dark:border-white/8 shadow-quantum">
      <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wider">
        {label}
      </p>
      <p className="font-bold text-lg leading-none" style={{ color }}>
        {val.toFixed(1)}<span className="text-xs font-medium text-slate-400 ml-1">/ 10</span>
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-1">
        <span>{emoji}</span>
        <span>{label2}</span>
      </p>
    </div>
  );
};

/**
 * Chart — Reusable area chart for mood trends.
 *
 * Props:
 *  data       — array of objects (each has xAxisKey + dataKey fields)
 *  dataKey    — field name for the Y-axis value  (default: "mood")
 *  xAxisKey   — field name for the X-axis labels (default: "name")
 *  color      — stroke/fill colour (hex)
 *  domain     — [min, max] for Y axis (default: [0, 10])
 *  label      — optional bottom label string
 */
const Chart = ({
  data,
  dataKey = 'mood',
  xAxisKey = 'name',
  color = '#6366f1',
  domain = [0, 10],
  label,
}) => {
  const { isDarkMode } = useTheme();

  const gridColor = isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(148,163,184,0.12)';
  const axisColor = isDarkMode ? '#475569' : '#94a3b8';
  const avgValue = data?.length
    ? data.reduce((s, d) => s + (d[dataKey] ?? 0), 0) / (data.filter(d => d[dataKey] != null).length || 1)
    : 0;

  // Build gradient id unique per dataKey
  const gradId = `qgrad_${dataKey}`;

  return (
    <div className="w-full h-64 flex flex-col gap-1">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 16, right: 8, left: -20, bottom: 4 }}
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={color} stopOpacity={0.32} />
              <stop offset="60%"  stopColor={color} stopOpacity={0.06} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 6"
            vertical={false}
            stroke={gridColor}
          />

          <XAxis
            dataKey={xAxisKey}
            axisLine={false}
            tickLine={false}
            tick={{ fill: axisColor, fontSize: 11, fontWeight: 500, fontFamily: 'Inter, sans-serif' }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: axisColor, fontSize: 11, fontFamily: 'Inter, sans-serif' }}
            domain={domain}
            tickCount={5}
          />

          <Tooltip
            content={<CustomTooltip color={color} />}
            cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '4 4', strokeOpacity: 0.4 }}
          />

          {/* Average reference line */}
          {avgValue > 0 && (
            <ReferenceLine
              y={+avgValue.toFixed(1)}
              stroke={color}
              strokeDasharray="5 4"
              strokeOpacity={0.35}
              strokeWidth={1.5}
            />
          )}

          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2.5}
            fillOpacity={1}
            fill={`url(#${gradId})`}
            connectNulls={true}
            dot={(props) => {
              const { cx, cy, payload } = props;
              if (payload[dataKey] == null) return null;
              return (
                <circle
                  key={`dot-${cx}-${cy}`}
                  cx={cx}
                  cy={cy}
                  r={4}
                  fill="#fff"
                  stroke={color}
                  strokeWidth={2.5}
                />
              );
            }}
            activeDot={{ r: 6, fill: color, stroke: '#fff', strokeWidth: 2.5 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {label && (
        <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 font-medium">{label}</p>
      )}
    </div>
  );
};

export default Chart;
