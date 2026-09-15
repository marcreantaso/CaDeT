import { ProgressRing } from "../shared/ProgressRing";
import { useCareerData } from "../../hooks/useCareerData";
import { calculateCareerReadiness } from "../../utils/scoring";
export function CareerReadinessScore() {
  const { data, error, retry } = useCareerData();
  if (error)
    return (
      <section className="glass-card p-5">
        <p role="alert">{error}</p>
        <button className="btn btn-secondary" onClick={retry}>
          Retry
        </button>
      </section>
    );
  if (!data)
    return (
      <section className="glass-card p-5" role="status">
        Loading readiness…
      </section>
    );
  const readiness = calculateCareerReadiness(
    data.targets,
    data.experiments,
    data.skills,
    data.projects,
    data.tasks,
  );
  const hasData = Boolean(
    data.targets.length ||
      data.experiments.length ||
      data.skills.length ||
      data.projects.length ||
      data.tasks.length,
  );
  const rows = [
    {
      key: "clarity" as const,
      label: "Clarity",
      weight: 25,
      present: data.targets.some((t) => t.isActive),
    },
    {
      key: "skills" as const,
      label: "Skills",
      weight: 25,
      present: !!data.skills.length,
    },
    {
      key: "evidence" as const,
      label: "Evidence",
      weight: 20,
      present:
        data.projects.some((p) => p.status === "completed") ||
        data.skills.some((s) => s.evidenceCount > 0),
    },
    {
      key: "experiments" as const,
      label: "Experiments",
      weight: 15,
      present: !!data.experiments.length,
    },
    {
      key: "execution" as const,
      label: "Execution",
      weight: 15,
      present: !!data.tasks.length,
    },
  ];
  return (
    <section className="glass-card p-5 readiness-card">
      <h2 className="text-base mb-4">Career readiness</h2>
      {!hasData ? (
        <p>
          No evidence yet. Add a skill, target, project, experiment, or task to
          establish your baseline.
        </p>
      ) : (
        <div className="readiness-content">
          <ProgressRing value={readiness.overall} size={110} label="/ 100" />
          <div className="min-w-0 flex-1 space-y-3">
            {rows.map((row) => (
              <div key={row.key}>
                <div className="flex flex-wrap justify-between gap-2 text-sm">
                  <span>
                    {row.label} · {row.weight}% weight
                  </span>
                  <span>
                    {row.present
                      ? `${readiness.components[row.key]}%`
                      : "Not recorded"}
                  </span>
                </div>
                <div className="progress-bar mt-1">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${readiness.components[row.key]}%`,
                      background: "hsl(var(--accent-light))",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <details className="mt-5 text-sm">
        <summary className="cursor-pointer">How this score works</summary>
        <div className="space-y-2 mt-3">
          <p>
            This is a tracking rubric, not a prediction of employability.
            Missing records contribute zero; that does not mean poor ability.
          </p>
          <p>
            Clarity: average active-target clarity. Skills: average
            self-assessed confidence plus up to 20 points for recorded skills.
            Evidence: completed projects (15 each, capped at 50) plus skills
            with evidence (10 each, capped at 50).
          </p>
          <p>
            Experiments: completion rate contributes 40%, recorded interest,
            enjoyment, confidence, and performance contribute 60%. Execution:
            percentage of recorded tasks completed. The overall score uses the
            weights above.
          </p>
        </div>
      </details>
    </section>
  );
}
