import { motion } from 'framer-motion';
import { ProgressRing } from '../shared/ProgressRing';
import { useCareerTargets } from '../../hooks/useCareerTargets';
import { useExperiments } from '../../hooks/useExperiments';
import { useSkills } from '../../hooks/useSkills';
import { useProjects } from '../../hooks/useProjects';
import { useTasks } from '../../hooks/useTasks';
import { calculateCareerReadiness } from '../../utils/scoring';

export function CareerReadinessScore() {
  const { targets: mockCareerTargets } = useCareerTargets();
  const { experiments: mockExperiments } = useExperiments();
  const { skills: mockSkills } = useSkills();
  const { projects: mockProjects } = useProjects();
  const { tasks: mockTasks } = useTasks();

  const readiness = calculateCareerReadiness(
    mockCareerTargets,
    mockExperiments,
    mockSkills,
    mockProjects,
    mockTasks,
  );

  const components = [
    { label: 'Clarity', value: readiness.components.clarity, color: 'hsl(262, 83%, 58%)' },
    { label: 'Skills', value: readiness.components.skills, color: 'hsl(200, 83%, 55%)' },
    { label: 'Evidence', value: readiness.components.evidence, color: 'hsl(172, 66%, 50%)' },
    { label: 'Experiments', value: readiness.components.experiments, color: 'hsl(45, 93%, 55%)' },
    { label: 'Execution', value: readiness.components.execution, color: 'hsl(340, 80%, 55%)' },
  ];

  return (
    <motion.div
      className="glass-card p-5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <h3
        className="text-xs font-semibold uppercase tracking-wider mb-4"
        style={{ color: 'hsl(215, 15%, 45%)', fontFamily: 'var(--font-heading)' }}
      >
        Career Readiness
      </h3>

      <div className="flex items-center gap-5">
        <ProgressRing
          value={readiness.overall}
          size={110}
          strokeWidth={8}
          label="/ 100"
        />

        <div className="flex-1 space-y-2.5">
          {components.map((comp) => (
            <div key={comp.label} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-medium" style={{ color: 'hsl(215, 20%, 65%)', fontFamily: 'var(--font-heading)' }}>
                  {comp.label}
                </span>
                <span className="text-[11px] font-semibold" style={{ color: comp.color }}>
                  {comp.value}%
                </span>
              </div>
              <div className="progress-bar">
                <motion.div
                  className="progress-bar-fill"
                  style={{ background: comp.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${comp.value}%` }}
                  transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
