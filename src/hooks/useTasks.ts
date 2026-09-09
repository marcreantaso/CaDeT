import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useRealtimeSubscription } from './useRealtimeSubscription';
import type { CareerTask } from '../types/career';

export function useTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<CareerTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const mappedTasks: CareerTask[] = data.map((d: any) => ({
        id: d.id,
        userId: user.id,
        title: d.title,
        reason: d.reason,
        status: d.status,
        priority: d.priority,
        createdAt: d.created_at,
        updatedAt: d.updated_at,
        linkedTargetId: d.linked_target_id,
        period: d.period || 'one_time',
      }));

      setTasks(mappedTasks);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useRealtimeSubscription({
    table: 'tasks',
    onUpdate: () => fetchTasks(),
    filter: user ? `user_id=eq.${user.id}` : undefined,
  });

  const addTask = async (task: Omit<CareerTask, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!user) return;
    const { error: insertError } = await supabase.from('tasks').insert({
      user_id: user.id,
      title: task.title,
      reason: task.reason,
      status: task.status,
      priority: task.priority,
      linked_target_id: task.linkedTargetId,
      period: task.period,
    });
    if (insertError) throw insertError;
  };

  const updateTask = async (id: string, updates: Partial<CareerTask>) => {
    const dbUpdates: any = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.reason !== undefined) dbUpdates.reason = updates.reason;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
    if (updates.status === 'completed') dbUpdates.completed_at = new Date().toISOString();

    const { error: updateError } = await supabase.from('tasks').update(dbUpdates).eq('id', id);
    if (updateError) throw updateError;
  };

  const deleteTask = async (id: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw error;
  };

  return {
    tasks,
    isLoading,
    error,
    addTask,
    updateTask,
    deleteTask,
  };
}
