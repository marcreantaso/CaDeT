interface ConfidenceBadgeProps {
  value: number;
  size?: 'sm' | 'md';
}

export function ConfidenceBadge({ value, size = 'sm' }: ConfidenceBadgeProps) {
  const color = value >= 70 ? 'hsl(150, 70%, 45%)' : value >= 40 ? 'hsl(45, 93%, 55%)' : 'hsl(0, 72%, 51%)';
  const label = value >= 70 ? 'High' : value >= 40 ? 'Medium' : 'Low';

  const sizeClasses = size === 'sm'
    ? 'text-[10px] px-2 py-0.5'
    : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full ${sizeClasses}`}
      style={{
        background: `${color}15`,
        color: color,
        fontFamily: 'var(--font-heading)',
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {Math.round(value)}% {label}
    </span>
  );
}
