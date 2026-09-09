import { useState } from 'react';
import { db } from '../lib/db';
import { useAuth } from '../contexts/AuthContext';
import { useLiveQuery } from 'dexie-react-hooks';
import type { SkillCategory, SkillLevel, Skill } from '../types/skills';

export function useSkills() {
  const { user } = useAuth();
  const [error, setError] = useState<Error | null>(null);

  const skills = useLiveQuery(
    () => {
      if (!user) return [];
      return db.skills.where('userId').equals(user.id).toArray();
    },
    [user],
    []
  );

  const isLoading = skills === undefined && user !== null;

  const addSkill = async (skillName: string, category: string = 'technical', level: string = 'beginner', confidence: number = 20) => {
    if (!user) return;
    try {
      const newSkill: Skill = {
        id: crypto.randomUUID(),
        userId: user.id,
        skillName,
        category: category as SkillCategory,
        level: level as SkillLevel,
        confidence,
        evidenceCount: 0,
        lastPracticed: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        linkedProjects: [],
        linkedExperiments: [],
      };
      await db.skills.add(newSkill);
    } catch (err) {
      console.error('Failed to add skill:', err);
      setError(err as Error);
      throw err;
    }
  };

  const updateSkill = async (id: string, updates: Partial<Skill>) => {
    try {
      await db.skills.update(id, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const deleteSkill = async (id: string) => {
    try {
      await db.skills.delete(id);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return {
    skills: skills || [],
    isLoading,
    error,
    addSkill,
    updateSkill,
    deleteSkill,
  };
}

