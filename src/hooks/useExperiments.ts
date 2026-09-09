import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useRealtimeSubscription } from './useRealtimeSubscription';
import type { Experiment } from '../types/career';

export function useExperiments() {
  const { user } = useAuth();
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchExperiments = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
        .from('experiments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const mappedExps: Experiment[] = data.map((d: any) => ({
        id: d.id,
        userId: user.id,
        hypothesis: d.hypothesis,
        experiment: d.experiment,
        timeline: d.timeline,
        startDate: d.start_date || d.created_at,
        status: d.status,
        linkedTargetId: d.linked_target_id,
        scores: d.interest_score != null ? {
          interest: d.interest_score,
          enjoyment: d.enjoyment_score,
          difficulty: d.difficulty_score,
          confidence: d.confidence_score,
          performance: d.performance_score,
          wouldRepeat: d.would_repeat,
        } : null,
        reflection: d.reflection,
        createdAt: d.created_at,
        updatedAt: d.updated_at,
      }));

      setExperiments(mappedExps);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchExperiments();
  }, [fetchExperiments]);

  useRealtimeSubscription({
    table: 'experiments',
    onUpdate: () => fetchExperiments(),
    filter: user ? `user_id=eq.${user.id}` : undefined,
  });

  const addExperiment = async (exp: Omit<Experiment, 'id' | 'scores' | 'reflection' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!user) return;
    const { error: insertError } = await supabase.from('experiments').insert({
      user_id: user.id,
      hypothesis: exp.hypothesis,
      experiment: exp.experiment,
      timeline: exp.timeline,
      status: exp.status,
      linked_target_id: exp.linkedTargetId,
    });
    if (insertError) throw insertError;
  };

  const updateExperiment = async (id: string, updates: Partial<Experiment>) => {
    const dbUpdates: any = {};
    if (updates.hypothesis !== undefined) dbUpdates.hypothesis = updates.hypothesis;
    if (updates.experiment !== undefined) dbUpdates.experiment = updates.experiment;
    if (updates.timeline !== undefined) dbUpdates.timeline = updates.timeline;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.linkedTargetId !== undefined) dbUpdates.linked_target_id = updates.linkedTargetId;
    if (updates.reflection !== undefined) dbUpdates.reflection = updates.reflection;
    
    if (updates.scores) {
      dbUpdates.interest_score = updates.scores.interest;
      dbUpdates.enjoyment_score = updates.scores.enjoyment;
      dbUpdates.difficulty_score = updates.scores.difficulty;
      dbUpdates.confidence_score = updates.scores.confidence;
      dbUpdates.performance_score = updates.scores.performance;
      dbUpdates.would_repeat = updates.scores.wouldRepeat;
    }

    const { error: updateError } = await supabase.from('experiments').update(dbUpdates).eq('id', id);
    if (updateError) throw updateError;
  };

  const deleteExperiment = async (id: string) => {
    const { error } = await supabase.from('experiments').delete().eq('id', id);
    if (error) throw error;
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
