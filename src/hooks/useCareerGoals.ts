import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useRealtimeSubscription } from './useRealtimeSubscription';
import type { CareerGoal } from '../types/career';

export function useCareerGoals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<CareerGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchGoals = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
        .from('career_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const mappedGoals: CareerGoal[] = data.map((d: any) => ({
        id: d.id,
        userId: user.id,
        category: d.category,
        title: d.title,
        description: d.description,
        priority: d.priority,
        createdAt: d.created_at,
        updatedAt: d.updated_at,
      }));

      setGoals(mappedGoals);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  useRealtimeSubscription({
    table: 'career_goals',
    onUpdate: () => fetchGoals(),
    filter: user ? `user_id=eq.${user.id}` : undefined,
  });

  const addGoal = async (goal: Omit<CareerGoal, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    const { error: insertError } = await supabase.from('career_goals').insert({
      user_id: user.id,
      category: goal.category,
      title: goal.title,
      description: goal.description,
      priority: goal.priority,
    });
    if (insertError) throw insertError;
  };

  const updateGoal = async (id: string, updates: Partial<CareerGoal>) => {
    const dbUpdates: any = {};
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.priority !== undefined) dbUpdates.priority = updates.priority;

    const { error: updateError } = await supabase.from('career_goals').update(dbUpdates).eq('id', id);
    if (updateError) throw updateError;
  };

  const deleteGoal = async (id: string) => {
    const { error } = await supabase.from('career_goals').delete().eq('id', id);
    if (error) throw error;
  };

  return {
    goals,
    isLoading,
    error,
    addGoal,
    updateGoal,
    deleteGoal,
  };
}
