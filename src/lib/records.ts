import { db } from "./db";

export const recordKinds = [
  "goal",
  "target",
  "skill",
  "task",
  "project",
  "experiment",
  "achievement",
  "reflection",
  "experience",
] as const;
export type RecordKind = (typeof recordKinds)[number];
export const recordTables = {
  goal: "career_goals",
  target: "career_targets",
  skill: "skills",
  task: "tasks",
  project: "projects",
  experiment: "experiments",
  achievement: "achievements",
  reflection: "reflections",
  experience: "experiences",
} as const;
export const recordLabels: Record<RecordKind, string> = {
  goal: "Goal",
  target: "Career target",
  skill: "Skill",
  task: "Task",
  project: "Project",
  experiment: "Experiment",
  achievement: "Achievement",
  reflection: "Reflection",
  experience: "Experience",
};
export type Field = {
  key: string;
  label: string;
  type?: "textarea" | "number" | "date";
  options?: string[];
  required?: boolean;
  min?: number;
  max?: number;
  value?: string;
};
const title = { key: "title", label: "Title", required: true };
const description: Field = {
  key: "description",
  label: "Description",
  type: "textarea",
};
export const recordFields: Record<RecordKind, Field[]> = {
  goal: [
    title,
    description,
    {
      key: "category",
      label: "Category",
      options: [
        "ambition",
        "role",
        "interest",
        "value",
        "industry",
        "long_term",
        "environment",
        "lifestyle",
      ],
    },
    {
      key: "priority",
      label: "Priority (1–5)",
      type: "number",
      min: 1,
      max: 5,
      value: "3",
    },
  ],
  target: [
    { key: "originalGoal", label: "Original ambition", required: true },
    {
      key: "compressedTarget",
      label: "Measurable target",
      type: "textarea",
      required: true,
    },
    ...["role", "skill", "industry", "experience", "evidence"].map((key) => ({
      key: `${key}Clarity`,
      label: `${key[0].toUpperCase() + key.slice(1)} clarity (0–100)`,
      type: "number" as const,
      min: 0,
      max: 100,
      value: "0",
    })),
  ],
  skill: [
    { key: "skillName", label: "Skill name", required: true },
    {
      key: "category",
      label: "Category",
      options: ["technical", "soft", "domain", "tool", "language", "framework"],
    },
    {
      key: "level",
      label: "Level",
      options: ["beginner", "intermediate", "advanced", "expert"],
    },
    {
      key: "confidence",
      label: "Self-assessed confidence (0–100)",
      type: "number",
      min: 0,
      max: 100,
      value: "20",
    },
  ],
  task: [
    title,
    {
      key: "reason",
      label: "Why this task matters",
      type: "textarea",
      required: true,
    },
    { key: "priority", label: "Priority", options: ["high", "medium", "low"] },
    {
      key: "period",
      label: "Schedule",
      options: ["one_time", "daily", "weekly"],
    },
    { key: "dueDate", label: "Due date", type: "date" },
  ],
  project: [
    title,
    description,
    { key: "skills", label: "Skills used (comma separated)" },
    {
      key: "evidence",
      label: "Evidence link or description",
      type: "textarea",
    },
    {
      key: "status",
      label: "Status",
      options: ["planned", "in_progress", "completed"],
    },
  ],
  experiment: [
    { key: "hypothesis", label: "Hypothesis", required: true },
    {
      key: "experiment",
      label: "What will you try?",
      type: "textarea",
      required: true,
    },
    {
      key: "timeline",
      label: "Timeline (for example, 14 days)",
      required: true,
    },
  ],
  achievement: [
    title,
    description,
    {
      key: "type",
      label: "Type",
      options: [
        "milestone",
        "certification",
        "award",
        "project_completion",
        "skill_mastery",
      ],
    },
    { key: "evidence", label: "Evidence link or description" },
    { key: "dateEarned", label: "Date earned", type: "date", required: true },
  ],
  reflection: [
    { key: "content", label: "Reflection", type: "textarea", required: true },
    {
      key: "sentiment",
      label: "Sentiment",
      options: ["neutral", "positive", "negative"],
    },
    { key: "tags", label: "Tags (comma separated)" },
  ],
  experience: [
    { key: "title", label: "Role or experience", required: true },
    { key: "organization", label: "Organization", required: true },
    description,
    { key: "startDate", label: "Start date", type: "date", required: true },
    { key: "endDate", label: "End date (optional)", type: "date" },
  ],
};

export function buildRecord(
  kind: RecordKind,
  values: Record<string, string>,
  userId: string,
  now = new Date().toISOString(),
) {
  if (!userId)
    throw new Error("Your workspace is not ready. Please try again.");
  const record: Record<string, unknown> = {
    id: crypto.randomUUID(),
    userId,
    createdAt: now,
    updatedAt: now,
  };
  for (const field of recordFields[kind]) {
    const value = (
      values[field.key] ??
      field.value ??
      field.options?.[0] ??
      ""
    ).trim();
    if (field.required && !value)
      throw new Error(`${field.label} is required.`);
    if (value.length > 10000) throw new Error(`${field.label} is too long.`);
    if (field.options && !field.options.includes(value))
      throw new Error(`Choose a valid ${field.label.toLowerCase()}.`);
    if (field.type === "number") {
      const number = Number(value);
      if (
        !value ||
        !Number.isFinite(number) ||
        number < (field.min ?? 0) ||
        number > (field.max ?? 100) ||
        !Number.isInteger(number)
      )
        throw new Error(
          `${field.label} must be a whole number from ${field.min} to ${field.max}.`,
        );
      record[field.key] = number;
    } else if (field.type === "date") {
      if (
        value &&
        (!/^\d{4}-\d{2}-\d{2}$/.test(value) ||
          !Number.isFinite(Date.parse(value)) ||
          new Date(value).toISOString().slice(0, 10) !== value)
      )
        throw new Error(`Enter a valid ${field.label.toLowerCase()}.`);
      if (value) record[field.key] = value;
    } else record[field.key] = value;
  }
  if (kind === "skill")
    Object.assign(record, {
      evidenceCount: 0,
      linkedProjects: [],
      linkedExperiments: [],
    });
  if (kind === "target")
    Object.assign(record, {
      isActive: true,
      overallClarity: Math.round(
        ["role", "skill", "industry", "experience", "evidence"].reduce(
          (sum, key) => sum + Number(record[`${key}Clarity`]),
          0,
        ) / 5,
      ),
    });
  if (kind === "task") record.status = "pending";
  if (kind === "project")
    Object.assign(record, {
      skills: String(record.skills)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      startDate: now.slice(0, 10),
    });
  if (kind === "experiment")
    Object.assign(record, {
      status: "planned",
      scores: null,
      startDate: now.slice(0, 10),
    });
  if (kind === "reflection")
    Object.assign(record, {
      tags: String(record.tags)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      linkedEntityType: "general",
    });
  if (
    kind === "experience" &&
    record.endDate &&
    String(record.endDate) < String(record.startDate)
  )
    throw new Error("End date must be on or after the start date.");
  return record;
}

export async function saveRecord(
  kind: RecordKind,
  values: Record<string, string>,
  userId: string,
) {
  const record = buildRecord(kind, values, userId);
  const table = db.table(recordTables[kind]);
  await db.transaction("rw", table, db.skills, db.projects, async () => {
    if (kind === "target")
      await table.where("userId").equals(userId).modify({ isActive: false });
    await table.add(record);
    if (kind === "skill" || kind === "project")
      await refreshProjectEvidence(userId);
  });
  return record.id as string;
}

export const statusOptions: Partial<Record<RecordKind, string[]>> = {
  task: ["pending", "in_progress", "completed", "deferred"],
  project: ["planned", "in_progress", "completed"],
  experiment: ["planned", "active", "completed", "abandoned"],
};
export async function updateRecord(
  kind: RecordKind,
  id: string,
  updates: Record<string, unknown>,
  userId: string,
) {
  if (!userId) throw new Error("Workspace unavailable.");
  const table = db.table(recordTables[kind]);
  await db.transaction("rw", table, db.skills, db.projects, async () => {
    const record = await table.get(id);
    if (!record || record.userId !== userId)
      throw new Error("Record not found in this workspace.");
    const changes: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };
    if (kind === "skill") {
      const confidence = Number(updates.confidence);
      if (
        !Number.isFinite(confidence) ||
        confidence < 0 ||
        confidence > 100 ||
        !Number.isInteger(confidence)
      )
        throw new Error("Confidence must be a whole number from 0 to 100.");
      if (
        !recordFields.skill
          .find((f) => f.key === "level")!
          .options!.includes(String(updates.level))
      )
        throw new Error("Choose a valid skill level.");
      Object.assign(changes, {
        confidence,
        level: updates.level,
        lastPracticed: changes.updatedAt,
      });
    } else if (kind === "target") {
      await table.where("userId").equals(userId).modify({ isActive: false });
      changes.isActive = true;
    } else {
      if (!statusOptions[kind]?.includes(String(updates.status)))
        throw new Error("Choose a valid status.");
      changes.status = updates.status;
      if (kind === "task")
        changes.completedAt =
          updates.status === "completed"
            ? (record.completedAt ?? changes.updatedAt)
            : undefined;
      else
        changes.endDate =
          updates.status === "completed"
            ? (record.endDate ?? String(changes.updatedAt).slice(0, 10))
            : undefined;
      if (kind === "experiment") {
        const scoreKeys = [
          "interest",
          "enjoyment",
          "difficulty",
          "confidence",
          "performance",
        ];
        if (scoreKeys.some((key) => String(updates[key] ?? "").trim())) {
          const values = Object.fromEntries(
            scoreKeys.map((key) => [key, Number(updates[key])]),
          );
          if (
            Object.values(values).some(
              (value) => !Number.isInteger(value) || value < 1 || value > 10,
            )
          )
            throw new Error(
              "Complete all five ratings with whole numbers from 1 to 10, or leave all blank.",
            );
          changes.scores = {
            ...values,
            wouldRepeat: updates.wouldRepeat === "on",
          };
        }
      }
    }
    await table.update(id, changes);
    if (kind === "project") await refreshProjectEvidence(userId);
  });
}

// Project evidence is counted only when the completed project includes evidence and names the skill.
async function refreshProjectEvidence(userId: string) {
  const projects = await db.projects.where("userId").equals(userId).toArray();
  const skills = await db.skills.where("userId").equals(userId).toArray();
  for (const skill of skills) {
    const linkedProjects = projects
      .filter(
        (project) =>
          project.status === "completed" &&
          project.evidence.trim() &&
          project.skills.some(
            (name) => name.toLowerCase() === skill.skillName.toLowerCase(),
          ),
      )
      .map((project) => project.id);
    const otherEvidence = Math.max(
      0,
      skill.evidenceCount - skill.linkedProjects.length,
    );
    await db.skills.update(skill.id, {
      linkedProjects,
      evidenceCount: otherEvidence + linkedProjects.length,
    });
  }
}
