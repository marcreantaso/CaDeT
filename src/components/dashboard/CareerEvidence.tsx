import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../lib/db";
import { useAuth } from "../../contexts/AuthContext";
import { motion } from "framer-motion";
import { ExternalLink, FolderKanban, Trophy } from "lucide-react";
import { useProjects } from "../../hooks/useProjects";

export function CareerEvidence() {
  const { projects } = useProjects();
  const recentProjects = projects.slice(0, 3);
  const { user } = useAuth();
  const recentAchievements =
    useLiveQuery(
      () =>
        user
          ? db.achievements
              .where("userId")
              .equals(user.id)
              .reverse()
              .sortBy("dateEarned")
          : [],
      [user?.id],
      [],
    ) ?? [];

  return (
    <motion.div
      className="glass-card p-5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
    >
      <h3
        className="text-xs font-semibold uppercase tracking-wider mb-4"
        style={{
          color: "hsl(var(--text-muted))",
          fontFamily: "var(--font-heading)",
        }}
      >
        Career Evidence
      </h3>

      {/* Projects */}
      <div className="space-y-2 mb-4">
        <p
          className="text-xs font-semibold uppercase tracking-wider"
          style={{
            color: "hsl(var(--text-muted))",
            fontFamily: "var(--font-heading)",
          }}
        >
          Projects
        </p>
        {recentProjects.map((project, index) => (
          <motion.div
            key={project.id}
            className="flex items-start gap-3 p-3 rounded-lg"
            style={{ background: "hsl(var(--bg-secondary))" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 + index * 0.05 }}
          >
            <FolderKanban
              size={14}
              style={{ color: "hsl(45, 93%, 55%)", marginTop: 2 }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p
                  className="text-xs font-medium truncate"
                  style={{ color: "hsl(var(--text-primary))" }}
                >
                  {project.title}
                </p>
                <span
                  className={`badge ${project.status === "completed" ? "badge-success" : project.status === "in_progress" ? "badge-warning" : "badge-accent"}`}
                >
                  {project.status.replace("_", " ")}
                </span>
              </div>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {project.skills.slice(0, 3).map((skill: string) => (
                  <span
                    key={skill}
                    className="text-xs px-1.5 py-0.5 rounded"
                    style={{
                      background: "hsl(var(--border))",
                      color: "hsl(var(--text-secondary))",
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            {project.evidence && (
              <ExternalLink
                size={12}
                style={{ color: "hsl(var(--text-muted))", flexShrink: 0 }}
              />
            )}
          </motion.div>
        ))}
      </div>

      {/* Achievements */}
      <div className="space-y-2">
        <p
          className="text-xs font-semibold uppercase tracking-wider"
          style={{
            color: "hsl(var(--text-muted))",
            fontFamily: "var(--font-heading)",
          }}
        >
          Achievements
        </p>
        {recentAchievements.map((achievement) => (
          <div
            key={achievement.id}
            className="flex items-center gap-3 p-3 rounded-lg"
            style={{ background: "hsl(var(--bg-secondary))" }}
          >
            <Trophy size={14} style={{ color: "hsl(150, 70%, 45%)" }} />
            <div className="flex-1 min-w-0">
              <p
                className="text-xs font-medium truncate"
                style={{ color: "hsl(var(--text-primary))" }}
              >
                {achievement.title}
              </p>
              <p
                className="text-xs"
                style={{ color: "hsl(var(--text-muted))" }}
              >
                {new Date(achievement.dateEarned).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
