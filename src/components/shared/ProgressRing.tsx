import { motion } from 'framer-motion';

interface ProgressRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  sublabel?: string;
}

export function ProgressRing({
  value,
  size = 120,
  strokeWidth = 8,
  color,
  trackColor = 'hsl(222, 30%, 14%)',
  label,
  sublabel,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  const scoreColor = color || (value >= 75 ? 'hsl(150, 70%, 45%)' : value >= 50 ? 'hsl(45, 93%, 55%)' : value >= 25 ? 'hsl(25, 95%, 53%)' : 'hsl(0, 72%, 51%)');

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="score-ring">
        {/* Track */}
        <circle
          className="score-ring-bg"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          style={{ stroke: trackColor }}
        />
        {/* Fill */}
        <motion.circle
          className="score-ring-fill"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          style={{
            stroke: scoreColor,
            strokeDasharray: circumference,
            filter: `drop-shadow(0 0 6px color-mix(in srgb, ${scoreColor} 25.1%, transparent))`,
          }}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-2xl font-bold"
          style={{ color: scoreColor, fontFamily: 'var(--font-heading)' }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
        >
          {Math.round(value)}
        </motion.span>
        {label && (
          <span className="text-xs font-medium" style={{ color: 'hsl(215, 20%, 65%)' }}>
            {label}
          </span>
        )}
        {sublabel && (
          <span className="text-xs" style={{ color: 'hsl(var(--text-muted))' }}>
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}
