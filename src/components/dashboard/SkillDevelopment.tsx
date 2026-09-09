import { motion } from 'framer-motion';
import { Zap, TrendingUp } from 'lucide-react';
import { useSkills } from '../../hooks/useSkills';
import { SKILL_LEVEL_COLORS, type SkillLevel } from '../../types/skills';

export function SkillDevelopment() {
  const { skills } = useSkills();
  const topSkills = [...skills]
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5);

  return (
    <motion.div
      className="glass-card p-5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: 'hsl(215, 15%, 45%)', fontFamily: 'var(--font-heading)' }}
        >
          Skill Development
        </h3>
        <span className="badge badge-info">
          <Zap size={10} /> {skills.length} skills
        </span>
      </div>

      <div className="space-y-3">
        {topSkills.map((skill: any, index: number) => {
          const levelColor = SKILL_LEVEL_COLORS[skill.level as SkillLevel];
          return (
            <motion.div
              key={skill.id}
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{
                  background: `${levelColor}15`,
                  color: levelColor,
                  fontFamily: 'var(--font-heading)',
                }}
              >
                {skill.skillName.slice(0, 2)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span
                    className="text-xs font-medium truncate"
                    style={{ color: 'hsl(210, 40%, 96%)', fontFamily: 'var(--font-heading)' }}
                  >
                    {skill.skillName}
                  </span>
                  <span className="text-[10px] font-semibold ml-2" style={{ color: levelColor }}>
                    {skill.confidence}%
                  </span>
                </div>
                <div className="progress-bar" style={{ height: 4 }}>
                  <motion.div
                    className="progress-bar-fill"
                    style={{ background: levelColor }}
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.confidence}%` }}
                    transition={{ duration: 0.6, delay: 0.4 + index * 0.05 }}
                  />
                </div>
              </div>

              {skill.evidenceCount > 0 && (
                <div className="flex items-center gap-0.5 flex-shrink-0" title="Evidence count">
                  <TrendingUp size={10} style={{ color: 'hsl(150, 70%, 45%)' }} />
                  <span className="text-[10px]" style={{ color: 'hsl(150, 70%, 45%)' }}>
                    {skill.evidenceCount}
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
