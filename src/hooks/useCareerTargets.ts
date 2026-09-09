import { useState } from 'react';
import { db } from '../lib/db';
import { useAuth } from '../contexts/AuthContext';
import { useLiveQuery } from 'dexie-react-hooks';
import type { CareerTarget } from '../types/career';

export function useCareerTargets() {
  const { user } = useAuth();
  const [error, setError] = useState<Error | null>(null);

  const targets = useLiveQuery(
    () => {
      if (!user) return [];
      return db.career_targets.where('userId').equals(user.id).reverse().sortBy('createdAt');
    },
    [user],
    []
  );

  const isLoading = targets === undefined && user !== null;

  const addTarget = async (target: Omit<CareerTarget, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!user) return;
    try {
      const newTarget: CareerTarget = {
        ...target,
        id: crypto.randomUUID(),
        userId: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await db.career_targets.add(newTarget);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const updateTarget = async (id: string, updates: Partial<CareerTarget>) => {
    try {
      await db.career_targets.update(id, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const deleteTarget = async (id: string) => {
    try {
      await db.career_targets.delete(id);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return {
    targets: targets || [],
    activeTarget: (targets || []).find(t => t.isActive),
    isLoading,
    error,
    addTarget,
    updateTarget,
    deleteTarget,
  };
}
