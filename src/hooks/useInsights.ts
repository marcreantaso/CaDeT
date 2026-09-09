import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useRealtimeSubscription } from './useRealtimeSubscription';
import type { AiInsight } from '../types/insights';

export function useInsights() {
  const { user } = useAuth();
  const [insights, setInsights] = useState<AiInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchInsights = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const mappedInsights: AiInsight[] = data.map((d: any) => ({
        id: d.id,
        userId: user.id,
        type: d.type,
        title: d.title,
        description: d.description,
        explanation: d.explanation,
        evidence: d.evidence || [],
        actionItems: d.action_items || [],
        confidence: d.confidence,
        priority: d.priority,
        isRead: d.is_read,
        createdAt: d.created_at,
      }));

      setInsights(mappedInsights);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  useRealtimeSubscription({
    table: 'ai_insights',
    onUpdate: () => fetchInsights(),
    filter: user ? `user_id=eq.${user.id}` : undefined,
  });

  const markAsRead = async (id: string) => {
    const { error: updateError } = await supabase.from('ai_insights').update({ is_read: true }).eq('id', id);
    if (updateError) throw updateError;
  };

  return {
    insights,
    isLoading,
    error,
    markAsRead,
  };
}
