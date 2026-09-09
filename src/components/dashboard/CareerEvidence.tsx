import { motion } from 'framer-motion';
import { ExternalLink, FolderKanban, Trophy } from 'lucide-react';
import { useProjects } from '../../hooks/useProjects';

export function CareerEvidence() {
  const { projects } = useProjects();
  const recentProjects = projects.slice(0, 3);
  const recentAchievements: any[] = [];

  return (
    <motion.div
      className="glass-card p-5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
    >
      <h3
        className="text-xs font-semibold uppercase tracking-wider mb-4"
        style={{ color: 'hsl(215, 15%, 45%)', fontFamily: 'var(--font-heading)' }}
      >
        Career Evidence
      </h3>

      {/* Projects */}
      <div className="space-y-2 mb-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider"
          style={{ color: 'hsl(215, 15%, 45%)', fontFamily: 'var(--font-heading)' }}
        >
          Projects
        </p>
        {recentProjects.map((project, index) => (
          <motion.div
            key={project.id}
            className="flex items-start gap-3 p-3 rounded-lg"
            style={{ background: 'hsl(222, 30%, 12%)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 + index * 0.05 }}
          >
            <FolderKanban size={14} style={{ color: 'hsl(45, 93%, 55%)', marginTop: 2 }} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-xs font-medium truncate" style={{ color: 'hsl(210, 40%, 96%)' }}>
                  {project.title}
                </p>
                <span className={`badge ${project.status === 'completed' ? 'badge-success' : project.status === 'in_progress' ? 'badge-warning' : 'badge-accent'}`}>
                  {project.status.replace('_', ' ')}
                </span>
              </div>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {project.skills.slice(0, 3).map((skill: string) => (
                  <span key={skill} className="text-[9px] px-1.5 py-0.5 rounded"
                    style={{ background: 'hsl(222, 25%, 16%)', color: 'hsl(215, 20%, 65%)' }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            {project.evidence && (
              <ExternalLink size={12} style={{ color: 'hsl(215, 15%, 45%)', flexShrink: 0 }} />
            )}
          </motion.div>
        ))}
      </div>

      {/* Achievements */}
      <div className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider"
          style={{ color: 'hsl(215, 15%, 45%)', fontFamily: 'var(--font-heading)' }}
        >
          Achievements
        </p>
        {recentAchievements.map((achievement) => (
          <div
            key={achievement.id}
            className="flex items-center gap-3 p-3 rounded-lg"
            style={{ background: 'hsl(222, 30%, 12%)' }}
          >
            <Trophy size={14} style={{ color: 'hsl(150, 70%, 45%)' }} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: 'hsl(210, 40%, 96%)' }}>
                {achievement.title}
              </p>
              <p className="text-[10px]" style={{ color: 'hsl(215, 15%, 45%)' }}>
                {new Date(achievement.dateEarned).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
