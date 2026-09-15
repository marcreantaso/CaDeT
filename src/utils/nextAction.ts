import type {
  CareerTask,
  CareerGoal,
  CareerTarget,
  Experiment,
  Project,
} from "../types/career";
import type { Skill } from "../types/skills";
import type { ActorStage } from "../types/actor";
export type ActionData = {
  tasks: CareerTask[];
  goals: CareerGoal[];
  targets: CareerTarget[];
  skills: Skill[];
  experiments: Experiment[];
  projects: Project[];
};
export function chooseNextAction(
  data: ActionData,
  stage: ActorStage,
  today = new Date().toISOString().slice(0, 10),
) {
  const priorities = { high: 0, medium: 1, low: 2 };
  const pending = data.tasks
    .filter((task) => ["pending", "in_progress"].includes(task.status))
    .sort(
      (a, b) =>
        Number(Boolean(b.dueDate && b.dueDate < today)) -
          Number(Boolean(a.dueDate && a.dueDate < today)) ||
        priorities[a.priority] - priorities[b.priority] ||
        (a.dueDate || "9999").localeCompare(b.dueDate || "9999") ||
        a.createdAt.localeCompare(b.createdAt),
    );
  const task = pending[0];
  if (task)
    return {
      title: task.title,
      reason: `${task.dueDate && task.dueDate < today ? "Overdue task. " : ""}${task.reason}`,
      href: `/records?kind=task#record-${task.id}`,
      label: "Open task",
    };
  if (!data.goals.length)
    return {
      title: "Define one career goal",
      reason: "Your AIM stage needs a direction to work toward.",
      href: "/records?kind=goal",
      label: "Review goals",
    };
  if (!data.targets.some((target) => target.isActive))
    return {
      title: "Make your goal measurable",
      reason:
        "You have a goal but no active target. Add a specific outcome and assess its clarity.",
      href: "/records?kind=target",
      label: "Review targets",
    };
  const skill = [...data.skills]
    .filter((s) => s.confidence < 60 || s.evidenceCount === 0)
    .sort((a, b) => a.confidence - b.confidence)[0];
  if (stage === "test" && !data.experiments.some((e) => e.status === "active"))
    return {
      title: "Plan a small career experiment",
      reason:
        "Your TEST stage needs practical evidence to check your direction.",
      href: "/records?kind=experiment",
      label: "Review experiments",
    };
  if (skill)
    return {
      title: `Practice and document ${skill.skillName}`,
      reason: `${skill.confidence}% self-assessed confidence; ${skill.evidenceCount} linked evidence items. Add a task or project to close this gap.`,
      href: "/skills",
      label: "Review skills",
    };
  if (!data.skills.length)
    return {
      title: "Add your first skill",
      reason: "Document a capability so your progress can be tracked.",
      href: "/skills",
      label: "Add a skill",
    };
  if (!data.projects.some((p) => p.status === "completed"))
    return {
      title: "Build evidence of your skills",
      reason:
        "Complete a small portfolio project and record what it demonstrates.",
      href: "/records?kind=project",
      label: "Review projects",
    };
  return {
    title: "Choose your next purposeful task",
    reason: `Review your ${stage.toUpperCase()} stage and turn the next objective into a concrete task.`,
    href: "/records?kind=task",
    label: "Review tasks",
  };
}
