import "fake-indexeddb/auto";
import assert from "node:assert/strict";
import { test, beforeEach, after } from "node:test";
import { db } from "../src/lib/db";
import {
  emptyAim,
  validateAim,
  saveAim,
  learningModules,
} from "../src/lib/aim";
import { exportBackup, parseBackup, restoreBackup } from "../src/lib/backup";
import { updateRecord } from "../src/lib/records";
import { FIELDS } from "../src/data/aimCatalog";
import {
  resourcesForAim,
  supportSuggestion,
} from "../src/data/learningResources";
const choice = (id: string, other = "") => ({ id, other });
function input() {
  return {
    ...emptyAim(),
    status: choice("undergraduate-student"),
    experience: choice("no-professional-experience"),
    field: choice("technology"),
    specialization: choice("software"),
    role: choice("frontend-developer"),
    outcome: choice("build-a-portfolio"),
    value: choice("creativity"),
    environment: choice("hybrid"),
    format: choice("reading-documentation"),
    support: choice("campus-organization"),
    school: "Pilot College",
    milestone: "Publish 3 accessible pages and document keyboard checks.",
  };
}
async function profile(userId = "alice") {
  const now = new Date().toISOString();
  await db.profiles.add({
    id: userId,
    userId,
    fullName: userId,
    preferredIndustries: [],
    onboardingCompleted: false,
    onboardingStep: 0,
    createdAt: now,
    updatedAt: now,
  });
}
beforeEach(async () => {
  await db.delete();
  await db.open();
  await profile();
});
after(async () => {
  await db.delete();
});
test("hierarchical choices reject stale children and blank Other; exploration and custom paths work", () => {
  const data = input();
  assert.deepEqual(validateAim(data), []);
  data.field = choice("business");
  assert.ok(validateAim(data).length);
  data.field = choice("other", "  ");
  assert.ok(validateAim(data).length);
  data.field = choice("other", "Agriculture");
  data.specialization = choice("other", "Sustainable farming");
  data.role = choice("other", "Farm manager");
  assert.deepEqual(validateAim(data), []);
  data.field = choice("exploring");
  data.specialization = choice("exploring");
  data.role = choice("exploring");
  assert.deepEqual(validateAim(data), []);
  assert.match(learningModules(data)[0].title, /Compare two career roles/);
});
test("every catalogue field yields a valid non-forced career route", () => {
  for (const field of FIELDS)
    for (const spec of field.specializations) {
      const data = input();
      data.field = choice(field.id);
      data.specialization = choice(spec.id);
      data.role = choice(spec.roles[0].id);
      assert.deepEqual(validateAim(data), [], field.id);
      assert.ok(learningModules(data)[0].title.includes(spec.roles[0].label));
    }
});
test("save atomically creates goals, target, pending tasks and profile; duplicate saves are idempotent", async () => {
  const data = input();
  data.skills = [
    { name: "Communication", category: "soft", level: "beginner" },
  ];
  const [first, second] = await Promise.all([
    saveAim("alice", data),
    saveAim("alice", data),
  ]);
  assert.equal(first.id, second.id);
  assert.equal(await db.aim_plans.count(), 1);
  assert.equal(await db.career_goals.count(), 6);
  assert.equal(await db.tasks.count(), 4);
  const skills = await db.skills.toArray();
  assert.equal(skills[0].category, "soft");
  assert.equal(skills[0].confidence, 25);
  assert.equal(skills[0].evidenceCount, 0);
  assert.equal((await db.profiles.get("alice"))?.onboardingCompleted, true);
  assert.equal((await db.actor_states.get("alice"))?.currentStage, "compress");
  assert.ok(
    (await db.tasks.toArray()).every(
      (t) => t.status === "pending" && t.linkedTargetId === first.targetId,
    ),
  );
  db.close();
  await db.open();
  assert.equal(
    (await db.aim_plans.get(first.id))?.input.status.id,
    "undergraduate-student",
  );
});
test("failed transaction leaves no partially completed onboarding", async () => {
  const reject = () => {
    throw new Error("Storage failed");
  };
  db.tasks.hook("creating", reject);
  try {
    await assert.rejects(saveAim("alice", input()), /Storage failed/);
  } finally {
    db.tasks.hook("creating").unsubscribe(reject);
  }
  assert.equal(await db.career_goals.count(), 0);
  assert.equal(await db.career_targets.count(), 0);
  assert.equal(await db.aim_plans.count(), 0);
  assert.equal((await db.profiles.get("alice"))?.onboardingCompleted, false);
});
test("revisiting preserves completed work, user isolation, and later ACTOR progress", async () => {
  const data = input();
  const first = await saveAim("alice", data);
  await profile("bob");
  const bob = await saveAim("bob", data);
  await updateRecord(
    "task",
    first.taskIds[0],
    { status: "completed" },
    "alice",
  );
  await db.actor_states.update("alice", { currentStage: "test" });
  data.milestone = "Publish 4 reviewed pages";
  const second = await saveAim("alice", data);
  assert.notEqual(first.id, second.id);
  assert.equal((await db.tasks.get(first.taskIds[0]))?.status, "completed");
  assert.equal((await db.actor_states.get("alice"))?.currentStage, "test");
  assert.equal((await db.career_targets.get(first.targetId))?.isActive, false);
  assert.equal((await db.career_targets.get(bob.targetId))?.isActive, true);
  assert.equal(
    await db.career_goals.where("userId").equals("alice").count(),
    6,
  );
  await assert.rejects(
    updateRecord("task", bob.taskIds[0], { status: "completed" }, "alice"),
  );
});
test("AIM backups round-trip, old backups still import, malformed nested input is rejected", async () => {
  const plan = await saveAim("alice", input());
  const backup = await exportBackup("alice");
  assert.ok(backup.tables.aim_plans.length);
  assert.equal(Object.hasOwn(backup.tables, "accounts"), false);
  const legacy = structuredClone(backup);
  delete legacy.tables.aim_plans;
  assert.deepEqual(parseBackup(JSON.stringify(legacy)).tables.aim_plans, []);
  const emptyTasks = structuredClone(backup);
  emptyTasks.tables.aim_plans[0].taskIds = [];
  assert.throws(() => parseBackup(JSON.stringify(emptyTasks)));
  const broken = structuredClone(backup);
  (broken.tables.aim_plans[0].input as any).field = { id: "other", other: "" };
  assert.throws(() => parseBackup(JSON.stringify(broken)));
  await db.delete();
  await db.open();
  await restoreBackup(backup, "restored");
  assert.equal((await db.aim_plans.get(plan.id))?.userId, "restored");
  assert.ok(
    (await db.tasks.bulkGet(plan.taskIds)).every(
      (t) => t?.userId === "restored",
    ),
  );
});
test("resource and support suggestions follow selected field without inventing a partner", () => {
  const data = input();
  assert.ok(resourcesForAim(data).some((r) => r.id === "mdn"));
  data.field = choice("hospitality");
  data.specialization = choice("guest-services");
  data.role = choice("guest-services-associate");
  assert.ok(!resourcesForAim(data).some((r) => r.id === "mdn"));
  assert.ok(resourcesForAim(data).some((r) => r.id === "tesda"));
  assert.match(supportSuggestion(data).title, /Pilot College/);
});
