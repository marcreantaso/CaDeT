// ACTOR Framework Types
// A = Aim, C = Compress, T = Test, O = Own, R = Run

export type ActorStage = 'aim' | 'compress' | 'test' | 'own' | 'run';

export type ActorStageStatus = 'locked' | 'active' | 'completed';

export interface ActorStageConfig {
  id: ActorStage;
  label: string;
  description: string;
  icon: string;
  color: string;
  status: ActorStageStatus;
  progress: number; // 0-100
  completedAt?: string;
  startedAt?: string;
}

export interface ActorState {
  id: string;
  userId: string;
  currentStage: ActorStage;
  stages: Record<ActorStage, ActorStageConfig>;
  cycleCount: number;
  lastTransition: string;
  createdAt: string;
  updatedAt: string;
}

export type ActorEventType =
  | 'stage_entered'
  | 'stage_completed'
  | 'stage_revisited'
  | 'goal_created'
  | 'goal_updated'
  | 'target_created'
  | 'target_compressed'
  | 'experiment_started'
  | 'experiment_completed'
  | 'experiment_scored'
  | 'skill_added'
  | 'skill_updated'
  | 'project_created'
  | 'project_completed'
  | 'achievement_earned'
  | 'task_created'
  | 'task_completed'
  | 'reflection_added'
  | 'insight_generated'
  | 'forecast_updated';

export interface ActorEvent {
  id: string;
  userId: string;
  stage: ActorStage;
  eventType: ActorEventType;
  title: string;
  description: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface ActorCycleStep {
  label: string;
  description: string;
  isActor: boolean;
}

// The full ACTOR loop including feedback stages
export const ACTOR_CYCLE: ActorCycleStep[] = [
  { label: 'Aim', description: 'Define career ambitions', isActor: true },
  { label: 'Compress', description: 'Transform into measurable targets', isActor: true },
  { label: 'Test', description: 'Run career experiments', isActor: true },
  { label: 'Own', description: 'Build career capital', isActor: true },
  { label: 'Run', description: 'Execute career strategy', isActor: true },
  { label: 'Observe', description: 'Track results and patterns', isActor: false },
  { label: 'Learn', description: 'Extract career insights', isActor: false },
  { label: 'Recalculate', description: 'Adjust trajectory', isActor: false },
];

export const ACTOR_STAGES: ActorStage[] = ['aim', 'compress', 'test', 'own', 'run'];

export const ACTOR_STAGE_META: Record<ActorStage, { label: string; letter: string; description: string; color: string }> = {
  aim: {
    label: 'Aim',
    letter: 'A',
    description: 'Define your career ambitions and direction',
    color: 'hsl(262, 83%, 58%)',
  },
  compress: {
    label: 'Compress',
    letter: 'C',
    description: 'Transform vague goals into measurable targets',
    color: 'hsl(200, 83%, 55%)',
  },
  test: {
    label: 'Test',
    letter: 'T',
    description: 'Run career experiments to validate direction',
    color: 'hsl(45, 93%, 55%)',
  },
  own: {
    label: 'Own',
    letter: 'O',
    description: 'Build and track your career capital',
    color: 'hsl(150, 70%, 45%)',
  },
  run: {
    label: 'Run',
    letter: 'R',
    description: 'Execute strategy with purposeful action',
    color: 'hsl(340, 80%, 55%)',
  },
};
