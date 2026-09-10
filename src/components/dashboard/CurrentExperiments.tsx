import { motion } from 'framer-motion';
import { FlaskConical, Clock, CheckCircle } from 'lucide-react';
import { useExperiments } from '../../hooks/useExperiments';

export function CurrentExperiments() {
  const { experiments } = useExperiments();

  return (
    <motion.div
      className="glass-card p-5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: 'hsl(var(--text-muted))', fontFamily: 'var(--font-heading)' }}
        >
          Experiments
        </h3>
        <span className="badge badge-warning">
          {experiments.filter(e => e.status === 'active').length} active
        </span>
      </div>

      <div className="space-y-3">
        {experiments.map((exp: any, index: number) => {
          const isActive = exp.status === 'active';
          const isCompleted = exp.status === 'completed';

          return (
            <motion.div
              key={exp.id}
              className="p-3 rounded-xl"
              style={{
                background: isActive ? 'hsl(45, 93%, 55%, 0.06)' : 'hsl(222, 30%, 12%)',
                border: isActive ? '1px solid hsl(45, 93%, 55%, 0.2)' : '1px solid transparent',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 + index * 0.06 }}
            >
              <div className="flex items-start gap-2 mb-2">
                {isActive ? (
                  <Clock size={14} style={{ color: 'hsl(45, 93%, 55%)', marginTop: 1 }} />
                ) : isCompleted ? (
                  <CheckCircle size={14} style={{ color: 'hsl(150, 70%, 45%)', marginTop: 1 }} />
                ) : (
                  <FlaskConical size={14} style={{ color: 'hsl(var(--text-muted))', marginTop: 1 }} />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium" style={{ color: 'hsl(210, 40%, 96%)' }}>
                    {exp.hypothesis}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'hsl(var(--text-muted))' }}>
                    {exp.timeline} • {exp.status}
                  </p>
                </div>
              </div>

              {/* Scores for completed experiments */}
              {isCompleted && exp.scores && (
                <div className="flex gap-2 mt-2 pt-2" style={{ borderTop: '1px solid hsl(222, 25%, 16%)' }}>
                  {[
                    { label: 'Interest', value: exp.scores.interest },
                    { label: 'Enjoy', value: exp.scores.enjoyment },
                    { label: 'Conf', value: exp.scores.confidence },
                    { label: 'Perf', value: exp.scores.performance },
                  ].map(score => (
                    <div key={score.label} className="text-center flex-1">
                      <p className="text-xs font-bold" style={{
                        color: score.value >= 7 ? 'hsl(150, 70%, 45%)' : score.value >= 5 ? 'hsl(45, 93%, 55%)' : 'hsl(0, 72%, 51%)'
                      }}>
                        {score.value}
                      </p>
                      <p className="text-xs" style={{ color: 'hsl(var(--text-muted))' }}>
                        {score.label}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
