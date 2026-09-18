import Dexie, { type Table } from "dexie";
import type { Profile } from "../types/user";
import type { Skill } from "../types/skills";
import type {
  CareerTask,
  Project,
  Experiment,
  CareerTarget,
  CareerGoal,
  CareerForecast,
} from "../types/career";
import type { AiInsight } from "../types/insights";
import type { Achievement, Reflection } from "../types/career";
import type { ActorState, ActorEvent } from "../types/actor";

import type { AimPlan } from "../types/aim";

export class CadetDatabase extends Dexie {
  aim_plans!: Table<AimPlan, string>;
  accounts!: Table<import("./localAuth").LocalAccount, string>;
  profiles!: Table<Profile, string>;
  skills!: Table<Skill, string>;
  tasks!: Table<CareerTask, string>;
  projects!: Table<Project, string>;
  experiments!: Table<Experiment, string>;
  career_targets!: Table<CareerTarget, string>;
  career_goals!: Table<CareerGoal, string>;
  insights!: Table<AiInsight, string>;
  forecasts!: Table<CareerForecast, string>;
  actor_states!: Table<ActorState, string>;
  actor_events!: Table<ActorEvent, string>;

  achievements!: Table<Achievement, string>;
  reflections!: Table<Reflection, string>;
  experiences!: Table<
    {
      id: string;
      userId: string;
      title: string;
      organization: string;
      description: string;
      startDate: string;
      endDate?: string;
      createdAt: string;
      updatedAt: string;
    },
    string
  >;
  progress_history!: Table<
    {
      id: string;
      userId: string;
      date: string;
      overall: number;
      components: {
        clarity: number;
        skills: number;
        evidence: number;
        experiments: number;
        execution: number;
      };
      signature: string;
    },
    string
  >;
  forecast_history!: Table<
    {
      id: string;
      userId: string;
      date: string;
      direction: string;
      confidence: number;
    },
    string
  >;

  constructor() {
    super("CadetDatabase");
    this.version(3).stores({
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
    this.version(5).stores({ accounts: "id, &username" });
    this.version(6).stores({ aim_plans: "id, userId, createdAt" });
    this.version(4).stores({
      achievements: "id, userId, dateEarned",
      reflections: "id, userId, createdAt",
      experiences: "id, userId, startDate",
      progress_history: "id, userId, date",
      forecast_history: "id, userId, date, direction",
    });
  }
}

export const db = new CadetDatabase();
