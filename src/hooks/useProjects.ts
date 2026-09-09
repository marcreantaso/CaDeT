import { useState } from 'react';
import { db } from '../lib/db';
import { useAuth } from '../contexts/AuthContext';
import { useLiveQuery } from 'dexie-react-hooks';
import type { Project } from '../types/career';

export function useProjects() {
  const { user } = useAuth();
  const [error, setError] = useState<Error | null>(null);

  const projects = useLiveQuery(
    () => {
      if (!user) return [];
      return db.projects.where('userId').equals(user.id).reverse().sortBy('createdAt');
    },
    [user],
    []
  );

  const isLoading = projects === undefined && user !== null;

  const addProject = async (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!user) return;
    try {
      const newProject: Project = {
        ...project,
        id: crypto.randomUUID(),
        userId: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await db.projects.add(newProject);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      await db.projects.update(id, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await db.projects.delete(id);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return {
    projects: projects || [],
    isLoading,
    error,
    addProject,
    updateProject,
    deleteProject,
  };
}
