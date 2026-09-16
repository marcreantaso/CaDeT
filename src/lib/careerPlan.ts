import { ACTOR_STAGE_META, type ActorEvent, type ActorState } from "../types/actor";
import type { CareerPathDefinition } from "../types/career-path";
import { buildRecord } from "./records";
import { db } from "./db";

export async function createActorCareerExperiment(
  userId: string,
  path: CareerPathDefinition,
  skillNames: string[],
  includeProofProject: boolean,
) {
  if (!userId) throw new Error("Workspace unavailable.");
  if (!skillNames.length && !includeProofProject)
    throw new Error("Choose at least one simulation change first.");

  const existing = await db.experiments
    .where("userId")
    .equals(userId)
    .filter(
      (experiment) =>
        experiment.status !== "completed" &&
        experiment.status !== "abandoned" &&
        experiment.hypothesis === `I can increase my evidence alignment with ${path.title}.`,
    )
    .first();
  if (existing)
    throw new Error("An active ACTOR experiment for this career path already exists.");

  const now = new Date();
  const nowIso = now.toISOString();
  const due = new Date(now);
  due.setUTCDate(due.getUTCDate() + 14);
  const dueDate = due.toISOString().slice(0, 10);
  const experiment = buildRecord(
    "experiment",
    {
      hypothesis: `I can increase my evidence alignment with ${path.title}.`,
      experiment: [
        skillNames.length ? `Develop and document: ${skillNames.join(", ")}.` : "",
        includeProofProject ? path.proofProject : "",
      ]
        .filter(Boolean)
        .join(" "),
      timeline: "14 days",
    },
    userId,
    nowIso,
  ) as Record<string, unknown>;
  experiment.status = "active";

  const taskInputs = [
    ...skillNames.map((skillName) => ({
      title: `Create evidence for ${skillName}`,
      reason: `${skillName} is a measured gap for the ${path.title} path. Add practice output or project evidence rather than only changing a self-rating.`,
    })),
    ...(includeProofProject
      ? [{ title: path.proofProject, reason: `This project tests the ${path.title} path with concrete portfolio evidence.` }]
      : []),
  ];
  const tasks = taskInputs.map((task) =>
    buildRecord(
      "task",
      {
        ...task,
        priority: "high",
        period: "one_time",
        dueDate,
      },
      userId,
      nowIso,
    ),
  );

  await db.transaction(
    "rw",
    [db.experiments, db.tasks, db.actor_states, db.actor_events],
    async () => {
      await db.experiments.add(experiment as never);
      await db.tasks.bulkAdd(tasks as never[]);

      const actorState = await db.actor_states.where("userId").equals(userId).first();
      if (actorState) {
        const updated: ActorState = {
          ...actorState,
          currentStage: "test",
          stages: {
            ...actorState.stages,
            aim: { ...actorState.stages.aim, status: "completed", progress: 100 },
            compress: { ...actorState.stages.compress, status: "completed", progress: 100 },
            test: {
              ...actorState.stages.test,
              ...ACTOR_STAGE_META.test,
              id: "test",
              icon: "test",
              status: "active",
              progress: Math.max(actorState.stages.test.progress, 10),
              startedAt: actorState.stages.test.startedAt ?? nowIso,
            },
          },
          lastTransition: nowIso,
          updatedAt: nowIso,
        };
        await db.actor_states.put(updated);
      }
      const event: ActorEvent = {
        id: crypto.randomUUID(),
        userId,
        stage: "test",
        eventType: "experiment_started",
        title: `${path.title} what-if became a real experiment`,
        description: `${tasks.length} evidence task${tasks.length === 1 ? "" : "s"} created for a 14-day test.`,
        metadata: {
          pathId: path.id,
          experimentId: String(experiment.id),
          skillNames,
          includeProofProject,
        },
        createdAt: nowIso,
      };
      await db.actor_events.add(event);
    },
  );

  return { experimentId: String(experiment.id), taskCount: tasks.length };
}
