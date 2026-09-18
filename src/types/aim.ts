import type { SkillCategory, SkillLevel } from "./skills";
export interface Choice {
  id: string;
  other: string;
}
export interface BaselineSkill {
  name: string;
  category: SkillCategory;
  level: SkillLevel;
}
export interface AimInput {
  status: Choice;
  experience: Choice;
  field: Choice;
  specialization: Choice;
  role: Choice;
  outcome: Choice;
  value: Choice;
  environment: Choice;
  format: Choice;
  support: Choice;
  weeks: number;
  hoursPerWeek: number;
  milestone: string;
  school: string;
  location: string;
  skills: BaselineSkill[];
}
export interface AimPlan {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  version: 1;
  input: AimInput;
  targetId: string;
  taskIds: string[];
  summary: string;
}
