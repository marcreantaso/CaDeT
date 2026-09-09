import { motion } from 'framer-motion';
import { Crosshair, ArrowUpRight } from 'lucide-react';
import { useCareerTargets } from '../../hooks/useCareerTargets';

export function CurrentTarget() {
  const { targets } = useCareerTargets();
  const target = targets.find(t => t.isActive);
  if (!target) return null;

  return (
    <motion.div
      className="glass-card p-5 relative overflow-hidden"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      {/* Subtle gradient accent */}
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 blur-3xl"
        style={{ background: 'hsl(262, 83%, 58%)' }}
      />

      <div className="flex items-start gap-3 mb-3 relative z-10">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'hsl(262, 83%, 58%, 0.12)' }}
        >
          <Crosshair size={16} style={{ color: 'hsl(262, 83%, 58%)' }} />
        </div>
        <div>
          <h3
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: 'hsl(215, 15%, 45%)', fontFamily: 'var(--font-heading)' }}
          >
            Current Career Target
          </h3>
        </div>
      </div>

      <p
        className="text-sm font-semibold leading-relaxed mb-3 relative z-10"
        style={{ color: 'hsl(210, 40%, 96%)', fontFamily: 'var(--font-heading)' }}
      >
        {target.compressedTarget}
      </p>

      <div className="flex items-center gap-2 relative z-10">
        <span
          className="badge badge-accent"
        >
          {target.overallClarity}% Clarity
        </span>
        <button
          className="ml-auto flex items-center gap-1 text-xs font-medium transition-colors"
          style={{ color: 'hsl(262, 83%, 68%)' }}
        >
          View details <ArrowUpRight size={12} />
        </button>
      </div>

      {/* Clarity breakdown */}
      <div className="mt-4 pt-3 relative z-10" style={{ borderTop: '1px solid hsl(222, 25%, 16%)' }}>
        <div className="grid grid-cols-5 gap-2">
          {[
            { label: 'Role', value: target.roleClarity },
            { label: 'Skill', value: target.skillClarity },
            { label: 'Industry', value: target.industryClarity },
            { label: 'Experience', value: target.experienceClarity },
            { label: 'Evidence', value: target.evidenceClarity },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <p className="text-xs font-bold" style={{
                color: item.value >= 70 ? 'hsl(150, 70%, 45%)' : item.value >= 40 ? 'hsl(45, 93%, 55%)' : 'hsl(0, 72%, 51%)'
              }}>
                {item.value}
              </p>
              <p className="text-[9px] mt-0.5" style={{ color: 'hsl(215, 15%, 45%)' }}>
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
