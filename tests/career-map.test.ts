import "fake-indexeddb/auto";
import assert from "node:assert/strict";
import { after, beforeEach, test } from "node:test";
import { CAREER_PATH_BY_ID, CAREER_PATHS } from "../src/data/careerPaths";
import { db } from "../src/lib/db";
import { createActorCareerExperiment } from "../src/lib/careerPlan";
import type { ActorState } from "../src/types/actor";
import type { CareerTwinInput } from "../src/types/career-path";
import type { Skill } from "../src/types/skills";
import {
  calculateCareerAlignment,
  selectPrimaryPath,
  simulateCareerAlignment,
} from "../src/utils/careerAlignment";

const userId = "career-map-user";
const now = "2026-09-16T00:00:00.000Z";

function actorState(): ActorState {
  const stage = (id: "aim" | "compress" | "test" | "own" | "run", status: "active" | "locked" | "completed", progress: number) => ({
    id,
    label: id,
    description: id,
    icon: id,
    color: "purple",
    status,
    progress,
  });
  return {
    id: userId,
    userId,
    currentStage: "compress",
    stages: {
      aim: stage("aim", "completed", 100),
      compress: stage("compress", "active", 50),
      test: stage("test", "locked", 0),
      own: stage("own", "locked", 0),
      run: stage("run", "locked", 0),
    },
    cycleCount: 1,
    lastTransition: now,
    createdAt: now,
    updatedAt: now,
  };
}

function skill(skillName: string, confidence: number, evidenceCount = 0): Skill {
  return {
    id: skillName,
    userId,
    skillName,
    category: "technical",
    level: confidence >= 75 ? "advanced" : "intermediate",
    confidence,
    evidenceCount,
    linkedProjects: [],
    linkedExperiments: [],
    createdAt: now,
    updatedAt: now,
  };
}

function input(): CareerTwinInput {
  return {
    skills: [
      skill("HTML", 90, 1),
      skill("CSS", 85, 1),
      skill("TypeScript", 75, 1),
      skill("React", 70, 1),
      skill("Git", 70, 1),
      skill("Python", 45),
    ],
    projects: [
      {
        id: "project-1",
        userId,
        title: "React portfolio dashboard",
        description: "Responsive frontend PWA",
        skills: ["React", "TypeScript", "CSS"],
        evidence: "https://example.test/repository",
        status: "completed",
        startDate: "2026-09-01",
        endDate: "2026-09-10",
        createdAt: now,
        updatedAt: now,
      },
    ],
    experiments: [],
    experiences: [],
    goals: [],
    targets: [
      {
        id: "target-1",
        userId,
        originalGoal: "Become a frontend developer",
        compressedTarget: "Get a frontend developer internship",
        roleClarity: 80,
        skillClarity: 70,
        industryClarity: 50,
        experienceClarity: 50,
        evidenceClarity: 70,
        overallClarity: 64,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ],
    actorState: actorState(),
  };
}

beforeEach(async () => {
  await db.delete();
  await db.open();
});

after(async () => {
  await db.delete();
});

test("declared target selects the original path while all scores remain explainable", () => {
  const data = input();
  assert.equal(selectPrimaryPath(CAREER_PATHS, data), "frontend-developer");
  const alignment = calculateCareerAlignment(CAREER_PATH_BY_ID["frontend-developer"], data);
  assert.equal(alignment.factors.reduce((sum, factor) => sum + factor.contribution, 0), alignment.score);
  assert.equal(alignment.factors.reduce((sum, factor) => sum + factor.weight, 0), 100);
  assert.ok(alignment.strengths.some((item) => item.startsWith("React")));
  assert.ok(alignment.gaps.includes("Testing"));
});

test("what-if changes raise only the simulated model and leave input records untouched", () => {
  const data = input();
  const before = structuredClone(data);
  const simulation = simulateCareerAlignment(
    CAREER_PATH_BY_ID["full-stack-developer"],
    data,
    { skillNames: ["Node.js", "SQL", "REST APIs"], includeProofProject: true },
    userId,
  );
  assert.ok(simulation.delta > 0);
  assert.ok(simulation.simulated.score > simulation.baseline.score);
  assert.deepEqual(data, before);
});

test("ACTOR handoff atomically persists an active experiment, tasks, event, and TEST stage", async () => {
  await db.actor_states.add(actorState());
  const result = await createActorCareerExperiment(
    userId,
    CAREER_PATH_BY_ID["ai-application-developer"],
    ["Python", "Model Evaluation"],
    true,
  );
  assert.equal(result.taskCount, 3);
  assert.equal(await db.experiments.where("userId").equals(userId).count(), 1);
  assert.equal((await db.experiments.toArray())[0].status, "active");
  assert.equal(await db.tasks.where("userId").equals(userId).count(), 3);
  assert.equal((await db.actor_states.get(userId))?.currentStage, "test");
  assert.equal((await db.actor_states.get(userId))?.stages.test.status, "active");
  assert.equal((await db.actor_events.toArray())[0].eventType, "experiment_started");
  await assert.rejects(
    createActorCareerExperiment(
      userId,
      CAREER_PATH_BY_ID["ai-application-developer"],
      ["Python"],
      false,
    ),
    /already exists/,
  );
});
