import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useRealtimeSubscription } from './useRealtimeSubscription';
import type { Project } from '../types/career';

export function useProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProjects = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const mappedProjects: Project[] = data.map((d: any) => ({
        id: d.id,
        userId: user.id,
        title: d.title,
        description: d.description,
        skills: d.skills || [],
        evidence: d.evidence,
        status: d.status || 'completed',
        startDate: d.start_date || d.created_at,
        endDate: d.end_date,
        createdAt: d.created_at,
        updatedAt: d.updated_at,
      }));

      setProjects(mappedProjects);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useRealtimeSubscription({
    table: 'projects',
    onUpdate: () => fetchProjects(),
    filter: user ? `user_id=eq.${user.id}` : undefined,
  });

  const addProject = async (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!user) return;
    const { error: insertError } = await supabase.from('projects').insert({
      user_id: user.id,
      title: project.title,
      description: project.description,
      skills: project.skills,
      evidence: project.evidence,
      start_date: project.startDate,
      end_date: project.endDate,
      status: project.status,
    });
    if (insertError) throw insertError;
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    const dbUpdates: any = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.skills !== undefined) dbUpdates.skills = updates.skills;
    if (updates.evidence !== undefined) dbUpdates.evidence = updates.evidence;
    if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate;
    if (updates.endDate !== undefined) dbUpdates.end_date = updates.endDate;
    if (updates.status !== undefined) dbUpdates.status = updates.status;

    const { error: updateError } = await supabase.from('projects').update(dbUpdates).eq('id', id);
    if (updateError) throw updateError;
  };

  const deleteProject = async (id: string) => {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) throw error;
  };

  return {
    projects,
    isLoading,
    error,
    addProject,
    updateProject,
    deleteProject,
  };
}
