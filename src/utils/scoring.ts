// Career readiness scoring engine

import type { CareerTarget, Experiment, Skill, Project, CareerTask, CareerReadiness } from '../types';

export function calculateCareerReadiness(
  targets: CareerTarget[],
  experiments: Experiment[],
  skills: Skill[],
  projects: Project[],
  tasks: CareerTask[]
): CareerReadiness {
  const clarity = calculateClarityScore(targets);
  const skillScore = calculateSkillScore(skills);
  const evidence = calculateEvidenceScore(projects, skills);
  const experimentScore = calculateExperimentScore(experiments);
  const execution = calculateExecutionScore(tasks);

  const overall = Math.round(
    clarity * 0.25 +
    skillScore * 0.25 +
    evidence * 0.2 +
    experimentScore * 0.15 +
    execution * 0.15
  );

  return {
    overall,
    components: {
      clarity,
      skills: skillScore,
      evidence,
      experiments: experimentScore,
      execution,
    },
  };
}

function calculateClarityScore(targets: CareerTarget[]): number {
  if (targets.length === 0) return 0;
  const activeTargets = targets.filter(t => t.isActive);
  if (activeTargets.length === 0) return 10;

  const avgClarity = activeTargets.reduce((sum, t) => sum + t.overallClarity, 0) / activeTargets.length;
  return Math.round(avgClarity);
}

function calculateSkillScore(skills: Skill[]): number {
  if (skills.length === 0) return 0;
  const avgConfidence = skills.reduce((sum, s) => sum + s.confidence, 0) / skills.length;
  const diversityBonus = Math.min(skills.length * 5, 20);
  return Math.min(Math.round(avgConfidence + diversityBonus), 100);
}

function calculateEvidenceScore(projects: Project[], skills: Skill[]): number {
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const evidenceLinked = skills.filter(s => s.evidenceCount > 0).length;

  const projectScore = Math.min(completedProjects * 15, 50);
  const evidenceScore = Math.min(evidenceLinked * 10, 50);

  return Math.min(projectScore + evidenceScore, 100);
}

function calculateExperimentScore(experiments: Experiment[]): number {
  if (experiments.length === 0) return 0;
  const completed = experiments.filter(e => e.status === 'completed');
  const completionRate = completed.length / experiments.length;
  const avgScores = completed
    .filter(e => e.scores)
    .reduce((sum, e) => {
      const s = e.scores!;
      return sum + (s.interest + s.enjoyment + s.confidence + s.performance) / 4;
    }, 0) / Math.max(completed.filter(e => e.scores).length, 1);

  return Math.round(completionRate * 40 + (avgScores / 10) * 60);
}

function calculateExecutionScore(tasks: CareerTask[]): number {
  if (tasks.length === 0) return 0;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const total = tasks.length;
  return Math.round((completed / total) * 100);
}
