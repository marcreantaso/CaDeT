// Career domain types

export interface CareerGoal {
  id: string;
  userId: string;
  category: CareerGoalCategory;
  title: string;
  description: string;
  priority: number; // 1-5
  createdAt: string;
  updatedAt: string;
}

export type CareerGoalCategory =
  | 'ambition'
  | 'role'
  | 'interest'
  | 'value'
  | 'environment'
  | 'long_term'
  | 'industry'
  | 'lifestyle';

export interface CareerTarget {
  id: string;
  userId: string;
  originalGoal: string; // The vague ambition
  compressedTarget: string; // The measurable target
  roleClarity: number; // 0-100
  skillClarity: number;
  industryClarity: number;
  experienceClarity: number;
  evidenceClarity: number;
  overallClarity: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Experiment {
  id: string;
  userId: string;
  hypothesis: string;
  experiment: string;
  timeline: string; // e.g., "14 days"
  startDate: string;
  endDate?: string;
  status: 'planned' | 'active' | 'completed' | 'abandoned';
  scores: ExperimentScores | null;
  reflection?: string;
  linkedTargetId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExperimentScores {
  interest: number; // 1-10
  enjoyment: number;
  difficulty: number;
  confidence: number;
  performance: number;
  wouldRepeat: boolean;
}

export interface Project {
  id: string;
  userId: string;
  title: string;
  description: string;
  skills: string[];
  evidence: string; // URL or description
  linkedTargetId?: string;
  status: 'planned' | 'in_progress' | 'completed';
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Achievement {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: 'certification' | 'award' | 'milestone' | 'project_completion' | 'skill_mastery';
  evidence?: string;
  dateEarned: string;
  createdAt: string;
}

export interface Reflection {
  id: string;
  userId: string;
  content: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  linkedEntityType?: 'experiment' | 'project' | 'task' | 'general';
  linkedEntityId?: string;
  tags: string[];
  createdAt: string;
}

export interface CareerTask {
  id: string;
  userId: string;
  title: string;
  reason: string; // WHY this task matters
  linkedTargetId?: string;
  linkedSkillId?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'deferred';
  dueDate?: string;
  completedAt?: string;
  period: 'daily' | 'weekly' | 'one_time';
  createdAt: string;
  updatedAt: string;
}

export interface CareerSignal {
  id: string;
  userId: string;
  signalType: 'behavioral' | 'skill' | 'experiment' | 'reflection' | 'evidence';
  direction: string; // Career direction this signal points to
  strength: number; // -1 to 1
  description: string;
  sourceEvent?: string; // Reference to actor_event
  createdAt: string;
}

export interface CareerForecast {
  id: string;
  userId: string;
  direction: string; // e.g., "Software Engineering"
  confidence: number; // 0-100
  trend: 'rising' | 'stable' | 'declining';
  positiveSignals: string[];
  negativeSignals: string[];
  behavioralEvidence: string[];
  skillEvidence: string[];
  experimentResults: string[];
  missingEvidence: string[];
  explanation: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrajectoryDataPoint {
  date: string;
  directions: Record<string, number>; // direction -> confidence
}

export interface CareerReadiness {
  overall: number; // 0-100
  components: {
    clarity: number;
    skills: number;
    evidence: number;
    experiments: number;
    execution: number;
  };
}
