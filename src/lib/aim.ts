import {
  FIELDS,
  STATUSES,
  EXPERIENCE,
  OUTCOMES,
  VALUES,
  ENVIRONMENTS,
  FORMATS,
  SUPPORT,
  EXPLORING,
  type Option,
} from "../data/aimCatalog";
import type { AimInput, Choice, AimPlan } from "../types/aim";
import type { ActorState, ActorStageConfig } from "../types/actor";
import { ACTOR_STAGES, ACTOR_STAGE_META } from "../types/actor";
import { SKILL_LEVEL_VALUES } from "../types/skills";
import { db } from "./db";

export const blankChoice = (): Choice => ({ id: "", other: "" });
export function emptyAim(): AimInput {
  return {
    status: blankChoice(),
    experience: blankChoice(),
    field: blankChoice(),
    specialization: blankChoice(),
    role: blankChoice(),
    outcome: blankChoice(),
    value: blankChoice(),
    environment: blankChoice(),
    format: blankChoice(),
    support: blankChoice(),
    weeks: 4,
    hoursPerWeek: 5,
    milestone: "",
    school: "",
    location: "",
    skills: [],
  };
}
export function choiceLabel(choice: Choice, choices: Option[]): string {
  if (choice.id === "other") return choice.other.trim();
  if (choice.id === "exploring") return EXPLORING.label;
  return choices.find((item) => item.id === choice.id)?.label ?? "";
}
export function aimOptions(input: AimInput) {
  const field = FIELDS.find((item) => item.id === input.field.id);
  const specialization = field?.specializations.find(
    (item) => item.id === input.specialization.id,
  );
  return {
    field,
    specialization,
    specializations: field?.specializations ?? [],
    roles: specialization?.roles ?? [],
  };
}
export function validateAim(input: AimInput, step?: number): string[] {
  const errors: string[] = [];
  const { specializations, roles } = aimOptions(input);
  function choice(
    name: string,
    value: Choice,
    choices: Option[],
    exploring = false,
  ) {
    if (
      !value ||
      typeof value.id !== "string" ||
      typeof value.other !== "string" ||
      value.other.length > 120 ||
      (value.id === "other"
        ? !value.other.trim()
        : !(exploring && value.id === "exploring") &&
          !choices.some((x) => x.id === value.id))
    )
      errors.push(`Choose ${name}, or specify Other (up to 120 characters).`);
  }
  if (step === undefined || step === 0) {
    choice("your current status", input.status, STATUSES);
    choice("your experience", input.experience, EXPERIENCE);
  }
  if (step === undefined || step === 1) {
    choice("a field", input.field, FIELDS, true);
    choice("a specialization", input.specialization, specializations, true);
    choice("a role", input.role, roles, true);
    if (
      input.field.id === "exploring" &&
      (input.specialization.id !== "exploring" || input.role.id !== "exploring")
    )
      errors.push(
        "Explore a field before narrowing the specialization and role.",
      );
    if (
      input.specialization.id === "exploring" &&
      input.role.id !== "exploring"
    )
      errors.push("Explore a specialization before narrowing the role.");
  }
  if (step === undefined || step === 2) {
    choice("an outcome", input.outcome, OUTCOMES);
    choice("a career value", input.value, VALUES);
    choice("a work environment", input.environment, ENVIRONMENTS);
    if (!input.milestone?.trim() || input.milestone.length > 500)
      errors.push("Describe one observable output (up to 500 characters).");
    if (![2, 4, 8, 12].includes(input.weeks))
      errors.push("Choose a 2, 4, 8, or 12 week timeline.");
  }
  if (step === undefined || step === 3) {
    if (
      !Array.isArray(input.skills) ||
      input.skills.length > 8 ||
      input.skills.some(
        (s) =>
          !s.name?.trim() ||
          s.name.length > 100 ||
          ![
            "technical",
            "soft",
            "domain",
            "tool",
            "language",
            "framework",
          ].includes(s.category) ||
          !Object.hasOwn(SKILL_LEVEL_VALUES, s.level),
      )
    )
      errors.push(
        "Add up to eight skills with a category and self-assessed level.",
      );
    else if (
      new Set(input.skills.map((s) => s.name.trim().toLowerCase())).size !==
      input.skills.length
    )
      errors.push("Each baseline skill must be unique.");
  }
  if (step === undefined || step === 4) {
    choice("a learning format", input.format, FORMATS);
    choice("a support preference", input.support, SUPPORT);
    if (![2, 5, 10, 15].includes(input.hoursPerWeek))
      errors.push("Choose your weekly learning hours.");
    if (
      typeof input.school !== "string" ||
      input.school.length > 120 ||
      typeof input.location !== "string" ||
      input.location.length > 120
    )
      errors.push("Keep school and city names under 120 characters.");
  }
  return errors;
}
export function normalizeAim(input: AimInput): AimInput {
  const result = structuredClone(input);
  for (const key of [
    "status",
    "experience",
    "field",
    "specialization",
    "role",
    "outcome",
    "value",
    "environment",
    "format",
    "support",
  ] as const)
    result[key] = {
      id: input[key].id,
      other: input[key].id === "other" ? input[key].other.trim() : "",
    };
  result.milestone = result.milestone.trim();
  result.school = result.school.trim();
  result.location = result.location.trim();
  result.skills = result.skills.map((s) => ({ ...s, name: s.name.trim() }));
  return result;
}
export function aimSummary(input: AimInput) {
  const { roles, specializations } = aimOptions(input);
  return `${choiceLabel(input.outcome, OUTCOMES)}: ${choiceLabel(input.role, roles)} · ${choiceLabel(input.specialization, specializations)} · ${choiceLabel(input.field, FIELDS)}. In ${input.weeks} weeks: ${input.milestone.trim()}`;
}
export function learningModules(input: AimInput) {
  const { specialization, roles } = aimOptions(input);
  const role = choiceLabel(input.role, roles);
  // Prioritize unrecorded skills, then lower self-ratings. Never count a plan as evidence.
  const known = new Map(
    input.skills.map((s) => [
      s.name.toLowerCase(),
      SKILL_LEVEL_VALUES[s.level],
    ]),
  );
  const suggestions = [...(specialization?.skills ?? [])].sort(
    (a, b) =>
      (known.get(a.toLowerCase()) ?? 0) - (known.get(b.toLowerCase()) ?? 0),
  );
  const focus = suggestions.slice(0, input.hoursPerWeek <= 2 ? 1 : 2);
  const exploring = input.role.id === "exploring";
  return [
    {
      title: exploring
        ? "Compare two career roles and choose a small trial"
        : `Review two real ${role} role descriptions`,
      reason:
        "AIM → COMPRESS: record recurring skills and check whether the role fits your chosen value and work environment.",
      fraction: 0.2,
    },
    {
      title: focus.length
        ? `Practice ${focus.join(" and ")}`
        : "Choose one foundational skill with a mentor or course outline",
      reason: `Use ${choiceLabel(input.format, FORMATS).toLowerCase()} within your ${input.hoursPerWeek}-hour weekly budget. Save a practice output. Suggested focus reflects missing or lower self-rated skills, not a verified deficiency.`,
      fraction: 0.5,
    },
    {
      title: `Create your milestone: ${input.milestone.trim()}`,
      reason:
        "TEST → OWN: run a small challenge, record the result and add a project with evidence in Records. A completed task alone does not establish skill mastery.",
      fraction: 0.8,
    },
    {
      title:
        input.support.id === "independent-learning"
          ? "Review your output and write a reflection"
          : "Request feedback and write a reflection",
      reason: `RUN → OBSERVE: compare your output with your milestone, record feedback or a self-review, and decide what to change next. Support preference: ${choiceLabel(input.support, SUPPORT)}.`,
      fraction: 1,
    },
  ];
}
export async function saveAim(userId: string, raw: AimInput): Promise<AimPlan> {
  if (!userId) throw new Error("Sign in before saving.");
  const errors = validateAim(raw);
  if (errors.length) throw new Error(errors[0]);
  const input = normalizeAim(raw);
  return db.transaction(
    "rw",
    [
      db.profiles,
      db.aim_plans,
      db.skills,
      db.career_goals,
      db.career_targets,
      db.tasks,
      db.actor_states,
      db.actor_events,
    ],
    async () => {
      const profile = await db.profiles.get(userId);
      if (!profile || profile.userId !== userId)
        throw new Error("Your account profile is unavailable.");
      const previous = (
        await db.aim_plans.where("userId").equals(userId).sortBy("createdAt")
      ).at(-1);
      if (previous && JSON.stringify(previous.input) === JSON.stringify(input))
        return previous;
      const now = new Date(),
        stamp = now.toISOString(),
        planId = crypto.randomUUID(),
        targetId = crypto.randomUUID();
      const { roles, specializations } = aimOptions(input);
      const summary = aimSummary(input);
      const goalChoices = [
        ["ambition", choiceLabel(input.outcome, OUTCOMES)],
        ["role", choiceLabel(input.role, roles)],
        ["interest", choiceLabel(input.specialization, specializations)],
        ["industry", choiceLabel(input.field, FIELDS)],
        ["value", choiceLabel(input.value, VALUES)],
        ["environment", choiceLabel(input.environment, ENVIRONMENTS)],
      ] as const;
      for (const [category, title] of goalChoices) {
        const id = `aim:${userId}:${category}`,
          existing = await db.career_goals.get(id);
        if (existing && existing.userId !== userId)
          throw new Error("Goal ownership conflict.");
        await db.career_goals.put({
          id,
          userId,
          category,
          title,
          description: `AIM: ${summary}`,
          priority: 3,
          createdAt: existing?.createdAt ?? stamp,
          updatedAt: stamp,
        });
      }
      for (const skill of input.skills) {
        const existing = await db.skills
          .where("userId")
          .equals(userId)
          .filter((s) => s.skillName.toLowerCase() === skill.name.toLowerCase())
          .first();
        // Revisiting AIM must not overwrite evidence or later skill improvements.
        if (!existing)
          await db.skills.add({
            id: crypto.randomUUID(),
            userId,
            skillName: skill.name,
            category: skill.category,
            level: skill.level,
            confidence: SKILL_LEVEL_VALUES[skill.level],
            evidenceCount: 0,
            linkedProjects: [],
            linkedExperiments: [],
            createdAt: stamp,
            updatedAt: stamp,
          });
      }
      await db.career_targets
        .where("userId")
        .equals(userId)
        .modify({ isActive: false });
      const roleClarity = input.role.id === "exploring" ? 0 : 100;
      const industryClarity = input.field.id === "exploring" ? 0 : 100;
      const skillClarity = input.skills.length ? 100 : 0;
      await db.career_targets.add({
        id: targetId,
        userId,
        originalGoal: choiceLabel(input.outcome, OUTCOMES),
        compressedTarget: summary,
        roleClarity,
        industryClarity,
        skillClarity,
        experienceClarity: 100,
        evidenceClarity: 0,
        overallClarity: Math.round(
          (roleClarity + industryClarity + skillClarity + 100) / 5,
        ),
        isActive: true,
        createdAt: stamp,
        updatedAt: stamp,
      });
      const tasks = learningModules(input).map((module, i) => {
        const due = new Date(now);
        due.setUTCDate(
          due.getUTCDate() +
            Math.max(1, Math.round(input.weeks * 7 * module.fraction)),
        );
        return {
          id: `${planId}:${i}`,
          userId,
          title: module.title,
          reason: module.reason,
          linkedTargetId: targetId,
          priority: "medium" as const,
          status: "pending" as const,
          period: "one_time" as const,
          dueDate: due.toISOString().slice(0, 10),
          createdAt: stamp,
          updatedAt: stamp,
        };
      });
      await db.tasks.bulkAdd(tasks);
      const plan: AimPlan = {
        id: planId,
        userId,
        input,
        version: 1,
        targetId,
        taskIds: tasks.map((t) => t.id),
        summary,
        createdAt: stamp,
        updatedAt: stamp,
      };
      await db.aim_plans.add(plan);
      const state = await db.actor_states
        .where("userId")
        .equals(userId)
        .first();
      if (!state) {
        const stageConfig = (
          stage: (typeof ACTOR_STAGES)[number],
        ): ActorStageConfig => ({
          ...ACTOR_STAGE_META[stage],
          id: stage,
          icon: stage,
          status:
            stage === "aim"
              ? "completed"
              : stage === "compress"
                ? "active"
                : "locked",
          progress: stage === "aim" ? 100 : 0,
        });
        const stages = {
          aim: stageConfig("aim"),
          compress: stageConfig("compress"),
          test: stageConfig("test"),
          own: stageConfig("own"),
          run: stageConfig("run"),
        };
        await db.actor_states.add({
          id: userId,
          userId,
          stages,
          currentStage: "compress",
          cycleCount: 1,
          lastTransition: stamp,
          createdAt: stamp,
          updatedAt: stamp,
        } satisfies ActorState);
      } // Preserve an existing user's later ACTOR progress when they revisit their direction.
      await db.actor_events.add({
        id: crypto.randomUUID(),
        userId,
        stage: "aim",
        eventType: previous ? "goal_updated" : "goal_created",
        title: "Structured AIM profile saved",
        description: summary,
        metadata: {
          taxonomyVersion: 1,
          planId,
          fieldId: input.field.id,
          specializationId: input.specialization.id,
          roleId: input.role.id,
        },
        createdAt: stamp,
      });
      await db.profiles.update(userId, {
        currentRole: choiceLabel(input.status, STATUSES),
        preferredIndustries:
          input.field.id === "exploring"
            ? []
            : [
                (
                  {
                    technology: "Technology",
                    business: "Business",
                    creative: "Creative & media",
                    education: "Education",
                    hospitality: "Hospitality",
                    sports: "Sports & esports",
                  } as Record<string, string>
                )[input.field.id] ?? choiceLabel(input.field, FIELDS),
              ],
        onboardingCompleted: true,
        onboardingStep: 6,
        updatedAt: stamp,
      });
      return plan;
    },
  );
}
