import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import type { NextBestAction as NBA } from '../../types/insights';

export function NextBestAction() {
  const actions: NBA[] = [];
  const topAction = actions[0];
  if (!topAction) return (
    <section className="focus-card">
      <span className="eyebrow"><Sparkles size={16} aria-hidden="true" /> Next best action</span>
      <h2>Make room for your next step.</h2>
      <p>No recommended action is available yet. Review your ACTOR journey to see your current stage.</p>
      <Link className="btn btn-primary" to="/journey">View your journey <ArrowRight size={16} aria-hidden="true" /></Link>
    </section>
  );

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl p-5"
      style={{
        background: 'linear-gradient(135deg, hsl(262, 83%, 58%, 0.12), hsl(172, 66%, 50%, 0.08))',
        border: '1px solid hsl(262, 83%, 58%, 0.2)',
      }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
    >
      {/* Glow */}
      <div
        className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-3xl opacity-30"
        style={{ background: 'hsl(262, 83%, 58%)' }}
      />

      <div className="flex items-start gap-3 relative z-10">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'hsl(262, 83%, 58%, 0.2)' }}
        >
          <Sparkles size={18} style={{ color: 'hsl(262, 83%, 68%)' }} />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider mb-1"
            style={{ color: 'hsl(262, 83%, 68%)', fontFamily: 'var(--font-heading)' }}
          >
            Next Best Action
          </p>
          <p className="text-sm font-semibold mb-2"
            style={{ color: 'hsl(210, 40%, 96%)', fontFamily: 'var(--font-heading)' }}
          >
            {topAction.title}
          </p>
          <p className="text-xs leading-relaxed mb-3" style={{ color: 'hsl(215, 20%, 65%)' }}>
            {topAction.reason}
          </p>
          <button className="btn btn-primary btn-sm">
            Start now <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Other actions */}
      {actions.length > 1 && (
        <div className="mt-4 pt-3 space-y-2 relative z-10" style={{ borderTop: '1px solid hsl(262, 83%, 58%, 0.15)' }}>
          <p className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: 'hsl(var(--text-muted))', fontFamily: 'var(--font-heading)' }}
          >
            Also recommended
          </p>
          {actions.slice(1).map((action) => (
            <div key={action.id} className="flex items-start gap-2">
              <ArrowRight size={10} style={{ color: 'hsl(262, 83%, 58%)', marginTop: 3, flexShrink: 0 }} />
              <div>
                <p className="text-xs font-medium" style={{ color: 'hsl(210, 40%, 96%)' }}>
                  {action.title}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'hsl(var(--text-muted))' }}>
                  {action.reason.slice(0, 80)}...
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
