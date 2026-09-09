import { motion } from 'framer-motion';
import { Brain, ChevronRight, AlertTriangle, TrendingUp, Lightbulb } from 'lucide-react';
import { useInsights } from '../../hooks/useInsights';
import type { AiInsight } from '../../types/insights';

const INSIGHT_ICONS: Record<string, typeof Brain> = {
  pattern_detected: Lightbulb,
  skill_gap: AlertTriangle,
  trajectory_shift: TrendingUp,
  career_direction: Brain,
  next_action: ChevronRight,
};

const INSIGHT_COLORS: Record<string, string> = {
  pattern_detected: 'hsl(262, 83%, 58%)',
  skill_gap: 'hsl(0, 72%, 51%)',
  trajectory_shift: 'hsl(172, 66%, 50%)',
  career_direction: 'hsl(200, 83%, 55%)',
  next_action: 'hsl(45, 93%, 55%)',
};

export function AiInsights() {
  const { insights } = useInsights();
  const latestInsights = insights.slice(0, 3);

  return (
    <motion.div
      className="glass-card p-5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: 'hsl(215, 15%, 45%)', fontFamily: 'var(--font-heading)' }}
        >
          AI Insights
        </h3>
        <div className="flex items-center gap-1">
          <Brain size={12} style={{ color: 'hsl(262, 83%, 58%)' }} />
          <span className="text-[10px]" style={{ color: 'hsl(262, 83%, 68%)' }}>
            {insights.filter(i => !i.isRead).length} new
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {latestInsights.map((insight: AiInsight, index: number) => {
          const IconComponent = INSIGHT_ICONS[insight.type] || Brain;
          const color = INSIGHT_COLORS[insight.type] || 'hsl(262, 83%, 58%)';

          return (
            <motion.div
              key={insight.id}
              className="p-3 rounded-xl cursor-pointer transition-all"
              style={{
                background: !insight.isRead ? `${color}08` : 'hsl(222, 30%, 12%)',
                border: !insight.isRead ? `1px solid ${color}20` : '1px solid transparent',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 + index * 0.06 }}
              whileHover={{ borderColor: `${color}40` }}
            >
              <div className="flex items-start gap-2 mb-1.5">
                <IconComponent size={14} style={{ color, marginTop: 1 }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold truncate"
                      style={{ color: 'hsl(210, 40%, 96%)', fontFamily: 'var(--font-heading)' }}
                    >
                      {insight.title}
                    </p>
                    {!insight.isRead && (
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
                    )}
                  </div>
                  <p className="text-[11px] mt-1 mb-2 leading-relaxed" style={{ color: 'hsl(215, 20%, 65%)' }}>
                    {insight.description}
                  </p>
                  <ul className="space-y-1">
                    {insight.evidence.map((e: string, i: number) => (
                      <li key={i} className="text-xs flex items-start gap-2" style={{ color: 'hsl(215, 20%, 65%)' }}>
                        <span className="text-[10px] mt-0.5" style={{ color: INSIGHT_COLORS[insight.type as keyof typeof INSIGHT_COLORS] }}>•</span>
                        {e}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: '1px solid hsl(222, 25%, 16%)' }}>
                <span className="text-[9px]" style={{ color: 'hsl(215, 15%, 45%)' }}>
                  {insight.confidence}% confidence • {insight.evidence.length} evidence points
                </span>
                <ChevronRight size={12} style={{ color: 'hsl(215, 15%, 45%)' }} />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
