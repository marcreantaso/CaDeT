import "fake-indexeddb/auto";
import assert from "node:assert/strict";
import { after, beforeEach, test } from "node:test";
import { db } from "../src/lib/db";
import { distributePlan, saveStarterPlan } from "../src/lib/starterPlan";

const userId = "starter-user";

beforeEach(async () => {
  await db.delete();
  await db.open();
});

after(async () => {
  await db.delete();
});

test("starter plan distributes a bounded weekly time budget into four editable steps", () => {
  const steps = distributePlan("esports-analyst", 5);
  assert.equal(steps.length, 4);
  assert.equal(steps.reduce((sum, step) => sum + step.minutes, 0), 300);
  assert.deepEqual(steps.map((step) => step.day), [0, 2, 4, 6]);
  assert.ok(steps.every((step) => step.minutes > 0));
  assert.throws(() => distributePlan("unknown", 5), /path/);
  assert.throws(() => distributePlan("esports-analyst", 0), /1–20/);
});

test("saving a starter plan creates dated tasks and one ACTOR audit event", async () => {
  const steps = distributePlan("content-creator", 3);
  assert.equal(
    await saveStarterPlan(userId, "content-creator", "2026-09-20", steps),
    4,
  );
  const tasks = await db.tasks.where("userId").equals(userId).toArray();
  assert.equal(tasks.length, 4);
  assert.deepEqual(
    tasks.map((task) => task.dueDate),
    ["2026-09-20", "2026-09-22", "2026-09-24", "2026-09-26"],
  );
  assert.equal((await db.actor_events.toArray())[0].eventType, "task_created");
  await assert.rejects(
    saveStarterPlan(userId, "content-creator", "2026-09-20", steps),
    /already exists/,
  );
});
