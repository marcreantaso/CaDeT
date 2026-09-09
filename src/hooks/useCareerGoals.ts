import { useState } from 'react';
import { db } from '../lib/db';
import { useAuth } from '../contexts/AuthContext';
import { useLiveQuery } from 'dexie-react-hooks';
import type { CareerGoal } from '../types/career';

export function useCareerGoals() {
  const { user } = useAuth();
  const [error, setError] = useState<Error | null>(null);

  const goals = useLiveQuery(
    () => {
      if (!user) return [];
      return db.career_goals.where('userId').equals(user.id).reverse().sortBy('createdAt');
    },
    [user],
    []
  );

  const isLoading = goals === undefined && user !== null;

  const addGoal = async (goal: Omit<CareerGoal, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!user) return;
    try {
      const newGoal: CareerGoal = {
        ...goal,
        id: crypto.randomUUID(),
        userId: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await db.career_goals.add(newGoal);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const updateGoal = async (id: string, updates: Partial<CareerGoal>) => {
    try {
      await db.career_goals.update(id, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      await db.career_goals.delete(id);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return {
    goals: goals || [],
    isLoading,
    error,
    addGoal,
    updateGoal,
    deleteGoal,
  };
}
