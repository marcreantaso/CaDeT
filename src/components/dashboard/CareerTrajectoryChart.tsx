import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from 'recharts';
import { mockTrajectoryData } from '../../data/mock';

const DIRECTION_COLORS: Record<string, string> = {
  'Full-Stack Development': 'hsl(262, 83%, 58%)',
  'AI Engineering': 'hsl(172, 66%, 50%)',
  'Frontend Engineering': 'hsl(200, 83%, 55%)',
  'Cybersecurity': 'hsl(0, 72%, 51%)',
  'Data Engineering': 'hsl(45, 93%, 55%)',
};

// Transform trajectory data for Recharts
const chartData = mockTrajectoryData.map(point => ({
  date: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  ...point.directions,
}));

const directions = Object.keys(mockTrajectoryData[0]?.directions || {});

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ dataKey: string; value: number; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload) return null;

  const sorted = [...payload].sort((a, b) => (b.value as number) - (a.value as number));

  return (
    <div
      className="rounded-xl p-3 text-xs"
      style={{
        background: 'hsl(222, 35%, 10%)',
        border: '1px solid hsl(222, 25%, 18%)',
        boxShadow: '0 8px 32px hsl(0, 0%, 0%, 0.4)',
      }}
    >
      <p className="font-semibold mb-2" style={{ color: 'hsl(210, 40%, 96%)', fontFamily: 'var(--font-heading)' }}>
        {label}
      </p>
      {sorted.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 py-0.5">
          <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span style={{ color: 'hsl(215, 20%, 65%)' }}>{entry.dataKey}</span>
          <span className="ml-auto font-semibold" style={{ color: entry.color }}>{entry.value}%</span>
        </div>
      ))}
    </div>
  );
}

export function CareerTrajectoryChart() {
  return (
    <motion.div
      className="glass-card p-5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: 'hsl(215, 15%, 45%)', fontFamily: 'var(--font-heading)' }}
        >
          Career Trajectory
        </h3>
        <span className="text-[10px]" style={{ color: 'hsl(215, 15%, 45%)' }}>
          Confidence over time
        </span>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
        {directions.map(dir => (
          <div key={dir} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: DIRECTION_COLORS[dir] }} />
            <span className="text-[10px]" style={{ color: 'hsl(215, 20%, 65%)' }}>{dir}</span>
          </div>
        ))}
      </div>

      <div style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              {directions.map(dir => (
                <linearGradient key={dir} id={`gradient-${dir.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={DIRECTION_COLORS[dir]} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={DIRECTION_COLORS[dir]} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 25%, 14%)" />
            <XAxis
              dataKey="date"
              tick={{ fill: 'hsl(215, 15%, 45%)', fontSize: 10 }}
              axisLine={{ stroke: 'hsl(222, 25%, 14%)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'hsl(215, 15%, 45%)', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
              tickFormatter={(v: number) => `${v}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            {directions.map(dir => (
              <Area
                key={dir}
                type="monotone"
                dataKey={dir}
                stroke={DIRECTION_COLORS[dir]}
                fill={`url(#gradient-${dir.replace(/\s/g, '')})`}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, stroke: DIRECTION_COLORS[dir], strokeWidth: 2, fill: 'hsl(222, 47%, 6%)' }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
