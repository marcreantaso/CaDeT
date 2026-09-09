import { useState } from 'react';
import { db } from '../lib/db';
import { useAuth } from '../contexts/AuthContext';
import { useLiveQuery } from 'dexie-react-hooks';
import type { CareerTask } from '../types/career';

export function useTasks() {
  const { user } = useAuth();
  const [error, setError] = useState<Error | null>(null);

  const tasks = useLiveQuery(
    () => {
      if (!user) return [];
      return db.tasks.where('userId').equals(user.id).reverse().sortBy('createdAt');
    },
    [user],
    []
  );

  const isLoading = tasks === undefined && user !== null;

  const addTask = async (task: Omit<CareerTask, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!user) return;
    try {
      const newTask: CareerTask = {
        ...task,
        id: crypto.randomUUID(),
        userId: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await db.tasks.add(newTask);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const updateTask = async (id: string, updates: Partial<CareerTask>) => {
    try {
      await db.tasks.update(id, {
        ...updates,
        updatedAt: new Date().toISOString(),
        ...(updates.status === 'completed' ? { completedAt: new Date().toISOString() } : {})
      });
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await db.tasks.delete(id);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return {
    tasks: tasks || [],
    isLoading,
    error,
    addTask,
    updateTask,
    deleteTask,
  };
}
