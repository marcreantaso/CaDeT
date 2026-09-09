// Utility functions

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatRelativeDate(date: string): string {
  const now = new Date();
  const d = new Date(date);
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}

export function getScoreColor(score: number): string {
  if (score >= 75) return 'hsl(150, 70%, 45%)';
  if (score >= 50) return 'hsl(45, 93%, 55%)';
  if (score >= 25) return 'hsl(25, 95%, 53%)';
  return 'hsl(0, 72%, 51%)';
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Developing';
  if (score >= 20) return 'Early';
  return 'Starting';
}

export function getTrendIcon(trend: 'rising' | 'stable' | 'declining'): string {
  switch (trend) {
    case 'rising': return '↑';
    case 'stable': return '→';
    case 'declining': return '↓';
  }
}

export function generateId(): string {
  return crypto.randomUUID();
}
