import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useRealtimeSubscription } from './useRealtimeSubscription';
import type { CareerForecast } from '../types/career';

export function useForecasts() {
  const { user } = useAuth();
  const [forecasts, setForecasts] = useState<CareerForecast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchForecasts = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
        .from('career_forecasts')
        .select('*')
        .eq('user_id', user.id)
        .order('confidence', { ascending: false });

      if (fetchError) throw fetchError;

      const mappedForecasts: CareerForecast[] = data.map((d: any) => ({
        id: d.id,
        userId: user.id,
        direction: d.direction,
        confidence: d.confidence,
        trend: d.trend,
        positiveSignals: d.positive_signals || [],
        negativeSignals: d.negative_signals || [],
        behavioralEvidence: d.behavioral_evidence || [],
        skillEvidence: d.skill_evidence || [],
        experimentResults: d.experiment_results || [],
        missingEvidence: d.missing_evidence || [],
        explanation: d.explanation,
        createdAt: d.created_at,
        updatedAt: d.updated_at,
      }));

      setForecasts(mappedForecasts);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchForecasts();
  }, [fetchForecasts]);

  useRealtimeSubscription({
    table: 'career_forecasts',
    onUpdate: () => fetchForecasts(),
    filter: user ? `user_id=eq.${user.id}` : undefined,
  });

  return {
    forecasts,
    isLoading,
    error,
  };
}
