import { db } from "./db";
import { recordTables } from "./records";

type Row = Record<string, unknown> & { id: string; userId: string };
type Check = (value: unknown) => boolean;
const text: Check = (v) => typeof v === "string" && v.length <= 20000;
const nonempty: Check = (v) => text(v) && (v as string).trim().length > 0;
const number =
  (min: number, max: number): Check =>
  (v) =>
    typeof v === "number" && Number.isFinite(v) && v >= min && v <= max;
const percent = number(0, 100);
const bool: Check = (v) => typeof v === "boolean";
const date: Check = (v) =>
  nonempty(v) && Number.isFinite(Date.parse(v as string));
const list =
  (check: Check): Check =>
  (v) =>
    Array.isArray(v) && v.length <= 10000 && v.every(check);
const oneOf =
  (...values: unknown[]): Check =>
  (v) =>
    values.includes(v);
const optional =
  (check: Check): Check =>
  (v) =>
    v === undefined || check(v);
const object =
  (fields: Record<string, Check>): Check =>
  (v) =>
    !!v &&
    typeof v === "object" &&
    !Array.isArray(v) &&
    Object.entries(fields).every(([key, check]) =>
      check((v as Record<string, unknown>)[key]),
    );
const components = {
  clarity: percent,
  skills: percent,
  evidence: percent,
  experiments: percent,
  execution: percent,
};
const base = { id: nonempty, userId: nonempty, createdAt: date };
const updated = { ...base, updatedAt: date };
const status = (...values: string[]) => oneOf(...values);
const scores = object({
  interest: number(1, 10),
  enjoyment: number(1, 10),
  difficulty: number(1, 10),
  confidence: number(1, 10),
  performance: number(1, 10),
  wouldRepeat: bool,
});
const schemas: Record<string, Check> = {
  skills: object({
    ...updated,
    skillName: nonempty,
    category: status(
      "technical",
      "soft",
      "domain",
      "tool",
      "language",
      "framework",
    ),
    level: status("beginner", "intermediate", "advanced", "expert"),
    confidence: percent,
    evidenceCount: number(0, 100000),
    linkedProjects: list(text),
    linkedExperiments: list(text),
    lastPracticed: optional(date),
  }),
  tasks: object({
    ...updated,
    title: nonempty,
    reason: text,
    status: status("pending", "in_progress", "completed", "deferred"),
    priority: status("high", "medium", "low"),
    period: status("daily", "weekly", "one_time"),
    linkedTargetId: optional(text),
    linkedSkillId: optional(text),
    dueDate: optional(date),
    completedAt: optional(date),
  }),
  projects: object({
    ...updated,
    title: nonempty,
    description: text,
    skills: list(text),
    evidence: text,
    status: status("planned", "in_progress", "completed"),
    startDate: date,
    endDate: optional(date),
    linkedTargetId: optional(text),
  }),
  experiments: object({
    ...updated,
    hypothesis: nonempty,
    experiment: text,
    timeline: text,
    startDate: date,
    endDate: optional(date),
    status: status("planned", "active", "completed", "abandoned"),
    scores: (v) => v === null || scores(v),
    reflection: optional(text),
    linkedTargetId: optional(text),
  }),
  career_goals: object({
    ...updated,
    title: nonempty,
    description: text,
    category: status(
      "ambition",
      "role",
      "interest",
      "value",
      "environment",
      "long_term",
      "industry",
      "lifestyle",
    ),
    priority: number(1, 5),
  }),
  career_targets: object({
    ...updated,
    originalGoal: text,
    compressedTarget: nonempty,
    roleClarity: percent,
    skillClarity: percent,
    industryClarity: percent,
    experienceClarity: percent,
    evidenceClarity: percent,
    overallClarity: percent,
    isActive: bool,
  }),
  achievements: object({
    ...base,
    title: nonempty,
    description: text,
    type: status(
      "certification",
      "award",
      "milestone",
      "project_completion",
      "skill_mastery",
    ),
    evidence: optional(text),
    dateEarned: date,
  }),
  reflections: object({
    ...base,
    content: nonempty,
    sentiment: status("positive", "neutral", "negative"),
    tags: list(text),
    linkedEntityType: optional(
      status("experiment", "project", "task", "general"),
    ),
    linkedEntityId: optional(text),
  }),
  experiences: object({
    ...updated,
    title: nonempty,
    organization: text,
    description: text,
    startDate: date,
    endDate: optional(date),
  }),
  progress_history: object({
    id: nonempty,
    userId: nonempty,
    date,
    overall: percent,
    components: object(components),
    signature: text,
  }),
  forecast_history: object({
    id: nonempty,
    userId: nonempty,
    date,
    direction: nonempty,
    confidence: percent,
  }),
  forecasts: object({
    ...updated,
    direction: nonempty,
    confidence: percent,
    trend: status("rising", "stable", "declining"),
    positiveSignals: list(text),
    negativeSignals: list(text),
    behavioralEvidence: list(text),
    skillEvidence: list(text),
    experimentResults: list(text),
    missingEvidence: list(text),
    explanation: text,
  }),
  insights: object({
    ...base,
    type: status(
      "career_direction",
      "skill_gap",
      "pattern_detected",
      "experiment_recommendation",
      "trajectory_shift",
      "next_action",
      "milestone_approaching",
      "evidence_gap",
    ),
    title: text,
    description: text,
    explanation: text,
    evidence: list(text),
    actionItems: list(text),
    confidence: percent,
    priority: status("high", "medium", "low"),
    isRead: bool,
  }),
};
export const backupTables = [
  ...Object.values(recordTables),
  "progress_history",
  "forecast_history",
  "forecasts",
  "insights",
];
export type Backup = {
  app: "CaDeT";
  version: 1;
  exportedAt: string;
  tables: Record<string, Row[]>;
};
export const MAX_BACKUP_BYTES = 5 * 1024 * 1024;

export function parseBackup(raw: string): Backup {
  if (new TextEncoder().encode(raw).length > MAX_BACKUP_BYTES)
    throw new Error("Backup must be 5 MB or smaller.");
  const data = JSON.parse(raw);
  if (
    !data ||
    data.app !== "CaDeT" ||
    data.version !== 1 ||
    !date(data.exportedAt) ||
    !data.tables ||
    typeof data.tables !== "object" ||
    Array.isArray(data.tables)
  )
    throw new Error("This is not a supported CaDeT backup.");
  if (
    Object.keys(data.tables).length !== backupTables.length ||
    Object.keys(data.tables).some((key) => !backupTables.includes(key))
  )
    throw new Error("Backup collections are missing or unsupported.");
  for (const table of backupTables) {
    const rows = data.tables[table];
    if (!Array.isArray(rows) || rows.length > 10000)
      throw new Error(`Invalid ${table} collection.`);
    const ids = new Set();
    for (const row of rows) {
      if (!schemas[table](row) || ids.has(row.id))
        throw new Error(`Invalid or duplicate record in ${table}.`);
      // Only plain JSON is accepted; reject prototype keys anywhere in imported records.
      const visit = (value: unknown) => {
        if (value && typeof value === "object")
          for (const [key, child] of Object.entries(value)) {
            if (["__proto__", "constructor", "prototype"].includes(key))
              throw new Error("Unsupported backup property.");
            visit(child);
          }
      };
      visit(row);
      ids.add(row.id);
    }
  }
  return data as Backup;
}
export async function exportBackup(userId: string): Promise<Backup> {
  if (!userId) throw new Error("Workspace unavailable.");
  const tables: Record<string, Row[]> = {};
  await db.transaction(
    "r",
    backupTables.map((name) => db.table(name)),
    async () => {
      for (const name of backupTables)
        tables[name] = await db
          .table(name)
          .where("userId")
          .equals(userId)
          .toArray();
    },
  );
  return {
    app: "CaDeT",
    version: 1,
    exportedAt: new Date().toISOString(),
    tables,
  };
}
export async function restoreBackup(input: Backup, userId: string) {
  if (!userId) throw new Error("Workspace unavailable.");
  const backup = parseBackup(JSON.stringify(input));
  let added = 0,
    skipped = 0;
  await db.transaction(
    "rw",
    backupTables.map((name) => db.table(name)),
    async () => {
      let hasActiveTarget = (
        await db.career_targets.where("userId").equals(userId).toArray()
      ).some((t) => t.isActive);
      for (const name of backupTables)
        for (const source of backup.tables[name]) {
          const row: Row = { ...source, userId };
          // Daily snapshots use the destination workspace's identity to remain idempotent.
          if (name === "progress_history") row.id = `${userId}:${row.date}`;
          if (name === "forecast_history")
            row.id = `${userId}:${row.date}:${row.direction}`;
          const existing = await db.table(name).get(row.id);
          if (existing) {
            if (existing.userId !== userId)
              throw new Error(
                "A record ID belongs to another workspace. Nothing was imported.",
              );
            skipped++;
            continue;
          }
          if (name === "career_targets" && row.isActive) {
            row.isActive = !hasActiveTarget;
            hasActiveTarget = true;
          }
          await db.table(name).add(row);
          added++;
        }
    },
  );
  return { added, skipped };
}
