import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useRealtimeSubscription } from './useRealtimeSubscription';
import type { CareerEvidence } from '../types/career';

export function useProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<CareerEvidence[]>([]);
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

      const mappedProjects: CareerEvidence[] = data.map((d: any) => ({
        id: d.id,
        type: 'project',
        title: d.title,
        description: d.description,
        skills: d.skills || [],
        url: d.evidence, // Re-using evidence field for URL
        date: d.start_date || d.created_at,
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

  const addProject = async (project: Omit<CareerEvidence, 'id' | 'type'>) => {
    if (!user) return;
    const { error: insertError } = await supabase.from('projects').insert({
      user_id: user.id,
      title: project.title,
      description: project.description,
      skills: project.skills,
      evidence: project.url,
      start_date: project.date,
      status: 'completed',
    });
    if (insertError) throw insertError;
  };

  const updateProject = async (id: string, updates: Partial<CareerEvidence>) => {
    const dbUpdates: any = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.skills !== undefined) dbUpdates.skills = updates.skills;
    if (updates.url !== undefined) dbUpdates.evidence = updates.url;
    if (updates.date !== undefined) dbUpdates.start_date = updates.date;

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
