import Dexie, { type Table } from 'dexie';
import type { Profile } from '../types/user';
import type { Skill } from '../types/skills';
import type { CareerTask, Project, Experiment, CareerTarget, CareerGoal, CareerForecast } from '../types/career';
import type { AiInsight } from '../types/insights';
import type { ActorState, ActorEvent } from '../types/actor';

export class CadetDatabase extends Dexie {
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

  constructor() {
    super('CadetDatabase');
    this.version(3).stores({
      profiles: 'id',
      skills: 'id, userId, category, skillName',
      tasks: 'id, userId, status, linkedTargetId, period, createdAt',
      projects: 'id, userId, status',
      experiments: 'id, userId, status',
      career_targets: 'id, userId, isActive',
      career_goals: 'id, userId, category',
      insights: 'id, userId, type, isRead',
      forecasts: 'id, userId, direction, confidence',
      actor_states: 'id, userId',
      actor_events: 'id, userId, stage, eventType',
    });
  }
}

export const db = new CadetDatabase();
