import type { ActorState } from "./actor";
import type {
  CareerGoal,
  CareerTarget,
  Experiment,
  Project,
} from "./career";
import type { Skill } from "./skills";

export interface CareerSkillRequirement {
  name: string;
  aliases?: string[];
  weight: number;
  targetConfidence: number;
}

export interface CareerPathDefinition {
  area: import("../data/careerAreas").CareerArea;
  id: string;
  title: string;
  summary: string;
  aliases: string[];
  skills: CareerSkillRequirement[];
  projectKeywords: string[];
  experienceKeywords: string[];
  interestKeywords: string[];
  adjacentPathIds: string[];
  proofProject: string;
}

export interface CareerExperience {
  id: string;
  userId: string;
  title: string;
  organization: string;
  description: string;
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CareerTwinInput {
  skills: Skill[];
  projects: Project[];
  experiments: Experiment[];
  experiences: CareerExperience[];
  goals: CareerGoal[];
  targets: CareerTarget[];
  actorState: ActorState | null;
}

export interface AlignmentFactor {
  key: "skills" | "projects" | "experience" | "actor" | "intent";
  label: string;
  score: number;
  weight: number;
  contribution: number;
  explanation: string;
}

export interface SkillAlignment {
  name: string;
  currentConfidence: number;
  targetConfidence: number;
  evidenceCount: number;
  match: number;
}

export interface CareerAlignment {
  pathId: string;
  title: string;
  score: number;
  factors: AlignmentFactor[];
  skills: SkillAlignment[];
  strengths: string[];
  gaps: string[];
  evidence: string[];
}

export interface SimulationChange {
  skillNames: string[];
  includeProofProject: boolean;
}

export interface CareerSimulation {
  pathId: string;
  baseline: CareerAlignment;
  simulated: CareerAlignment;
  delta: number;
  changes: SimulationChange;
}
