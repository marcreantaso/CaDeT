import "fake-indexeddb/auto";
import assert from "node:assert/strict";
import { beforeEach, after, test } from "node:test";
import { db } from "../src/lib/db";
import {
  buildRecord,
  saveRecord,
  updateRecord,
  recordKinds,
  recordTables,
} from "../src/lib/records";
import { exportBackup, parseBackup, restoreBackup } from "../src/lib/backup";
import { calculateCareerReadiness } from "../src/utils/scoring";
import { chooseNextAction, type ActionData } from "../src/utils/nextAction";

beforeEach(async () => {
  await db.delete();
  await db.open();
});
after(async () => {
  await db.delete();
});
const userId = "test-user";
const fields = {
  goal: { title: "Software engineer" },
  target: {
    originalGoal: "Build software",
    compressedTarget: "Ship a tested PWA by December",
  },
  skill: { skillName: "TypeScript", confidence: "40" },
  task: { title: "Write tests", reason: "Demonstrate reliable software" },
  project: {
    title: "Portfolio PWA",
    skills: "TypeScript, CSS",
    status: "completed",
  },
  experiment: {
    hypothesis: "I enjoy frontend work",
    experiment: "Build a PWA",
    timeline: "14 days",
  },
  achievement: { title: "Finished project", dateEarned: "2026-09-15" },
  reflection: {
    content: "Testing clarified my assumptions.",
    tags: "learning, testing",
  },
  experience: {
    title: "Intern",
    organization: "Test lab",
    startDate: "2026-09-01",
  },
};
test("all Quick Add kinds persist and round-trip through backup", async () => {
  for (const kind of recordKinds) await saveRecord(kind, fields[kind], userId);
  for (const table of Object.values(recordTables))
    assert.equal(await db.table(table).count(), 1, table);
  const backup = parseBackup(JSON.stringify(await exportBackup(userId)));
  await db.delete();
  await db.open();
  assert.deepEqual(await restoreBackup(backup, "new-user"), {
    added: 9,
    skipped: 0,
  });
  assert.deepEqual(await restoreBackup(backup, "new-user"), {
    added: 0,
    skipped: 9,
  });
  for (const table of Object.values(recordTables))
    assert.equal((await db.table(table).toArray())[0].userId, "new-user");
});
test("skill creation and confidence updates change readiness after reopening the database", async () => {
  const id = await saveRecord("skill", fields.skill, userId);
  const before = calculateCareerReadiness(
    [],
    [],
    await db.skills.toArray(),
    [],
    [],
  ).overall;
  await updateRecord(
    "skill",
    id,
    { confidence: "80", level: "advanced" },
    userId,
  );
  db.close();
  await db.open();
  const skills = await db.skills.toArray();
  assert.equal(skills[0].confidence, 80);
  assert.ok(calculateCareerReadiness([], [], skills, [], []).overall > before);
});
test("invalid input is rejected before writing", async () => {
  for (const confidence of ["-1", "101", "NaN", "3.5", ""])
    assert.throws(() =>
      buildRecord("skill", { skillName: "Testing", confidence }, userId),
    );
  assert.throws(() => buildRecord("skill", { skillName: "   " }, userId));
  assert.throws(() =>
    buildRecord(
      "achievement",
      { title: "Test", dateEarned: "2026-02-31" },
      userId,
    ),
  );
  assert.throws(() =>
    buildRecord(
      "experience",
      { ...fields.experience, endDate: "2026-08-01" },
      userId,
    ),
  );
  assert.equal(await db.skills.count(), 0);
});
test("ownership and update allowlists protect records", async () => {
  const id = await saveRecord("skill", fields.skill, userId);
  await assert.rejects(
    updateRecord(
      "skill",
      id,
      { confidence: 90, level: "expert" },
      "another-user",
    ),
  );
  await updateRecord(
    "skill",
    id,
    {
      confidence: 50,
      level: "intermediate",
      userId: "another-user",
      id: "replacement",
    },
    userId,
  );
  assert.equal((await db.skills.get(id))?.userId, userId);
});
test("only one target is active and other workspaces are untouched", async () => {
  const foreign = await saveRecord("target", fields.target, "other-user");
  const first = await saveRecord("target", fields.target, userId);
  const second = await saveRecord("target", fields.target, userId);
  assert.equal((await db.career_targets.get(first))?.isActive, false);
  assert.equal((await db.career_targets.get(second))?.isActive, true);
  await updateRecord("target", first, {}, userId);
  assert.equal((await db.career_targets.get(second))?.isActive, false);
  assert.equal((await db.career_targets.get(foreign))?.isActive, true);
});
test("restoring preserves edits and rolls back every import on an ownership collision", async () => {
  const id = await saveRecord("skill", fields.skill, userId);
  await saveRecord("goal", fields.goal, userId);
  const backup = await exportBackup(userId);
  await updateRecord("skill", id, { confidence: 88, level: "expert" }, userId);
  await restoreBackup(backup, userId);
  assert.equal((await db.skills.get(id))?.confidence, 88);
  await assert.rejects(restoreBackup(backup, "foreign-user"));
  assert.equal(
    await db.career_goals.where("userId").equals("foreign-user").count(),
    0,
  );
});
test("malformed backup collections, nested data, duplicate IDs and unsupported versions fail validation", async () => {
  await saveRecord("skill", fields.skill, userId);
  const backup = await exportBackup(userId);
  for (const mutate of [
    (b: any) => {
      b.version = 2;
    },
    (b: any) => {
      delete b.tables.skills;
    },
    (b: any) => {
      b.tables.skills[0].confidence = "90";
    },
    (b: any) => {
      b.tables.skills[0].linkedProjects = {};
    },
    (b: any) => {
      b.tables.skills.push(b.tables.skills[0]);
    },
    (b: any) => {
      b.tables.profiles = [];
    },
  ]) {
    const copy = structuredClone(backup);
    mutate(copy);
    assert.throws(() => parseBackup(JSON.stringify(copy)));
  }
});
test("task recommendations prioritize overdue work and disappear after completion", async () => {
  const a = await saveRecord(
    "task",
    {
      ...fields.task,
      title: "Overdue",
      dueDate: "2026-09-01",
      priority: "low",
    },
    userId,
  );
  await saveRecord(
    "task",
    {
      ...fields.task,
      title: "Upcoming",
      dueDate: "2026-10-01",
      priority: "high",
    },
    userId,
  );
  const data: ActionData = {
    tasks: await db.tasks.toArray(),
    goals: [],
    targets: [],
    skills: [],
    experiments: [],
    projects: [],
  };
  assert.equal(chooseNextAction(data, "run", "2026-09-15").title, "Overdue");
  await updateRecord("task", a, { status: "completed" }, userId);
  assert.ok((await db.tasks.get(a))?.completedAt);
  data.tasks = await db.tasks.toArray();
  assert.equal(chooseNextAction(data, "run", "2026-09-15").title, "Upcoming");
  await updateRecord("task", a, { status: "pending" }, userId);
  assert.equal((await db.tasks.get(a))?.completedAt, undefined);
});
test("empty data gives a concrete first step without fabricated scores", () => {
  const data: ActionData = {
    tasks: [],
    goals: [],
    targets: [],
    skills: [],
    experiments: [],
    projects: [],
  };
  assert.equal(chooseNextAction(data, "aim").title, "Define one career goal");
  assert.equal(calculateCareerReadiness([], [], [], [], []).overall, 0);
});

test("completed project evidence connects to skills without double counting", async () => {
  const skillId = await saveRecord("skill", fields.skill, userId);
  const projectId = await saveRecord(
    "project",
    { ...fields.project, evidence: "Repository and test results" },
    userId,
  );
  assert.equal((await db.skills.get(skillId))?.evidenceCount, 1);
  await updateRecord("project", projectId, { status: "completed" }, userId);
  assert.equal((await db.skills.get(skillId))?.evidenceCount, 1);
  await updateRecord("project", projectId, { status: "in_progress" }, userId);
  assert.equal((await db.skills.get(skillId))?.evidenceCount, 0);
});
test("experiment ratings reject partial input and preserve the previous state on failure", async () => {
  const id = await saveRecord("experiment", fields.experiment, userId);
  await assert.rejects(
    updateRecord(
      "experiment",
      id,
      { status: "completed", interest: "8" },
      userId,
    ),
  );
  assert.equal((await db.experiments.get(id))?.status, "planned");
  await updateRecord(
    "experiment",
    id,
    {
      status: "completed",
      interest: "8",
      enjoyment: "7",
      difficulty: "5",
      confidence: "8",
      performance: "9",
      wouldRepeat: "on",
    },
    userId,
  );
  assert.equal((await db.experiments.get(id))?.scores?.performance, 9);
});
test("daily history keeps one snapshot per day, preserves prior days, and exports real values", async () => {
  const { saveDailyProgress } = await import("../src/lib/history");
  const empty = calculateCareerReadiness([], [], [], [], []);
  await saveDailyProgress(userId, empty, "2026-09-14");
  await saveRecord("skill", fields.skill, userId);
  const score = calculateCareerReadiness(
    [],
    [],
    await db.skills.toArray(),
    [],
    [],
  );
  await saveDailyProgress(userId, score, "2026-09-15");
  await saveDailyProgress(userId, score, "2026-09-15");
  assert.equal(await db.progress_history.count(), 2);
  assert.equal(
    (await db.progress_history.get(`${userId}:2026-09-14`))?.overall,
    0,
  );
  assert.equal((await exportBackup(userId)).tables.progress_history.length, 2);
});

test("version 3 career data survives the version 4 schema upgrade", async () => {
  const { default: Dexie } = await import("dexie");
  await db.delete();
  const legacy = new Dexie("CadetDatabase");
  legacy.version(3).stores({
    profiles: "id",
    skills: "id, userId, category, skillName",
    tasks: "id, userId, status, linkedTargetId, period, createdAt",
    projects: "id, userId, status",
    experiments: "id, userId, status",
    career_targets: "id, userId, isActive",
    career_goals: "id, userId, category",
    insights: "id, userId, type, isRead",
    forecasts: "id, userId, direction, confidence",
    actor_states: "id, userId",
    actor_events: "id, userId, stage, eventType",
  });
  await legacy.open();
  const skill = buildRecord("skill", fields.skill, userId);
  await legacy.table("skills").add(skill);
  legacy.close();
  await db.open();
  assert.equal(
    (await db.skills.get(String(skill.id)))?.skillName,
    "TypeScript",
  );
  await saveRecord("achievement", fields.achievement, userId);
  assert.equal(await db.achievements.count(), 1);
});
test("forecast history uses the latest saved forecast and excludes other users", async () => {
  const { saveDailyForecasts } = await import("../src/lib/history");
  const forecast = {
    id: "f1",
    userId,
    direction: "Frontend",
    confidence: 40,
    trend: "stable" as const,
    positiveSignals: [],
    negativeSignals: [],
    behavioralEvidence: [],
    skillEvidence: [],
    experimentResults: [],
    missingEvidence: [],
    explanation: "Recorded evidence",
    createdAt: "2026-09-14T00:00:00.000Z",
    updatedAt: "2026-09-14T00:00:00.000Z",
  };
  await saveDailyForecasts(
    userId,
    [
      {
        ...forecast,
        id: "f2",
        confidence: 70,
        updatedAt: "2026-09-15T00:00:00.000Z",
      },
      forecast,
      { ...forecast, id: "f3", userId: "other", confidence: 99 },
    ],
    "2026-09-15",
  );
  const rows = await db.forecast_history.toArray();
  assert.equal(rows.length, 1);
  assert.equal(rows[0].confidence, 70);
  assert.equal(rows[0].date, "2026-09-15");
});
