import { useState } from 'react';
import { db } from '../lib/db';
import { useAuth } from '../contexts/AuthContext';
import { useLiveQuery } from 'dexie-react-hooks';
import type { Experiment } from '../types/career';

export function useExperiments() {
  const { user } = useAuth();
  const [error, setError] = useState<Error | null>(null);

  const experiments = useLiveQuery(
    () => {
      if (!user) return [];
      return db.experiments.where('userId').equals(user.id).reverse().sortBy('createdAt');
    },
    [user],
    []
  );

  const isLoading = experiments === undefined && user !== null;

  const addExperiment = async (experiment: Omit<Experiment, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!user) return;
    try {
      const newExperiment: Experiment = {
        ...experiment,
        id: crypto.randomUUID(),
        userId: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await db.experiments.add(newExperiment);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const updateExperiment = async (id: string, updates: Partial<Experiment>) => {
    try {
      await db.experiments.update(id, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const deleteExperiment = async (id: string) => {
    try {
      await db.experiments.delete(id);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return {
    experiments,
    isLoading,
    error,
    addExperiment,
    updateExperiment,
    deleteExperiment,
  };
}
