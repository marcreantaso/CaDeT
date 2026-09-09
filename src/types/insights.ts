// AI Insights types

export interface AiInsight {
  id: string;
  userId: string;
  type: InsightType;
  title: string;
  description: string;
  explanation: string;
  evidence: string[];
  actionItems: string[];
  confidence: number; // 0-100
  priority: 'high' | 'medium' | 'low';
  isRead: boolean;
  createdAt: string;
}

export type InsightType =
  | 'career_direction'
  | 'skill_gap'
  | 'pattern_detected'
  | 'experiment_recommendation'
  | 'trajectory_shift'
  | 'next_action'
  | 'milestone_approaching'
  | 'evidence_gap';

export interface NextBestAction {
  id: string;
  title: string;
  reason: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  linkedStage: string;
  linkedTarget?: string;
}
