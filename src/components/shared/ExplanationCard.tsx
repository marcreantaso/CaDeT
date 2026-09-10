import { type ReactNode } from 'react';
import { ChevronRight, Info } from 'lucide-react';

interface ExplanationCardProps {
  title: string;
  icon?: ReactNode;
  explanation: string;
  evidence?: string[];
  actions?: string[];
  accentColor?: string;
}

export function ExplanationCard({
  title,
  icon,
  explanation,
  evidence = [],
  actions = [],
  accentColor = 'hsl(262, 83%, 58%)',
}: ExplanationCardProps) {
  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-start gap-2">
        {icon || <Info size={16} style={{ color: accentColor, marginTop: 2 }} />}
        <h4
          className="text-sm font-semibold flex-1"
          style={{ color: 'hsl(210, 40%, 96%)', fontFamily: 'var(--font-heading)' }}
        >
          {title}
        </h4>
      </div>

      <p className="text-xs leading-relaxed" style={{ color: 'hsl(215, 20%, 65%)' }}>
        {explanation}
      </p>

      {evidence.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-1.5"
            style={{ color: 'hsl(var(--text-muted))', fontFamily: 'var(--font-heading)' }}
          >
            Supporting Evidence
          </p>
          <ul className="space-y-1">
            {evidence.map((e, i) => (
              <li key={i} className="flex items-start gap-2 text-xs" style={{ color: 'hsl(215, 20%, 65%)' }}>
                <ChevronRight size={12} style={{ color: accentColor, marginTop: 2, flexShrink: 0 }} />
                {e}
              </li>
            ))}
          </ul>
        </div>
      )}

      {actions.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-1.5"
            style={{ color: 'hsl(var(--text-muted))', fontFamily: 'var(--font-heading)' }}
          >
            Recommended Actions
          </p>
          <ul className="space-y-1">
            {actions.map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-xs" style={{ color: 'hsl(172, 66%, 50%)' }}>
                <span className="mt-0.5">→</span>
                {a}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
