// Skills types

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  description?: string;
}

export type SkillCategory =
  | 'technical'
  | 'soft'
  | 'domain'
  | 'tool'
  | 'language'
  | 'framework';

export interface UserSkill {
  id: string;
  userId: string;
  skillId: string;
  skillName: string;
  category: SkillCategory;
  level: SkillLevel;
  confidence: number; // 0-100 self-assessed
  evidenceCount: number;
  linkedProjects: string[];
  linkedExperiments: string[];
  lastPracticed?: string;
  createdAt: string;
  updatedAt: string;
}

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export const SKILL_LEVEL_VALUES: Record<SkillLevel, number> = {
  beginner: 25,
  intermediate: 50,
  advanced: 75,
  expert: 100,
};

export const SKILL_LEVEL_COLORS: Record<SkillLevel, string> = {
  beginner: 'hsl(45, 93%, 55%)',
  intermediate: 'hsl(200, 83%, 55%)',
  advanced: 'hsl(262, 83%, 58%)',
  expert: 'hsl(150, 70%, 45%)',
};
