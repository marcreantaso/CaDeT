import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useRealtimeSubscription } from './useRealtimeSubscription';
import type { CareerTarget } from '../types/career';

export function useCareerTargets() {
  const { user } = useAuth();
  const [targets, setTargets] = useState<CareerTarget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTargets = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
        .from('career_targets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      // Map DB snake_case to frontend camelCase
      const mappedTargets: CareerTarget[] = data.map((d: any) => ({
        id: d.id,
        userId: user.id,
        originalGoal: d.original_goal,
        compressedTarget: d.compressed_target,
        roleClarity: d.role_clarity,
        skillClarity: d.skill_clarity,
        industryClarity: d.industry_clarity,
        experienceClarity: d.experience_clarity,
        evidenceClarity: d.evidence_clarity,
        overallClarity: d.overall_clarity,
        isActive: d.is_active,
        createdAt: d.created_at,
        updatedAt: d.updated_at,
      }));

      setTargets(mappedTargets);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTargets();
  }, [fetchTargets]);

  useRealtimeSubscription({
    table: 'career_targets',
    onUpdate: () => {
      fetchTargets();
    },
    filter: user ? `user_id=eq.${user.id}` : undefined,
  });

  const addTarget = async (target: Omit<CareerTarget, 'id' | 'createdAt' | 'updatedAt' | 'overallClarity'>) => {
    if (!user) return;
    
    // Deactivate others if this is active
    if (target.isActive) {
      await supabase.from('career_targets').update({ is_active: false }).eq('user_id', user.id);
    }

    const { error: insertError } = await supabase.from('career_targets').insert({
      user_id: user.id,
      original_goal: target.originalGoal,
      compressed_target: target.compressedTarget,
      role_clarity: target.roleClarity,
      skill_clarity: target.skillClarity,
      industry_clarity: target.industryClarity,
      experience_clarity: target.experienceClarity,
      evidence_clarity: target.evidenceClarity,
      is_active: target.isActive,
    });

    if (insertError) throw insertError;
  };

  const updateTarget = async (id: string, updates: Partial<CareerTarget>) => {
    const dbUpdates: any = {};
    if (updates.originalGoal !== undefined) dbUpdates.original_goal = updates.originalGoal;
    if (updates.compressedTarget !== undefined) dbUpdates.compressed_target = updates.compressedTarget;
    if (updates.roleClarity !== undefined) dbUpdates.role_clarity = updates.roleClarity;
    if (updates.skillClarity !== undefined) dbUpdates.skill_clarity = updates.skillClarity;
    if (updates.industryClarity !== undefined) dbUpdates.industry_clarity = updates.industryClarity;
    if (updates.experienceClarity !== undefined) dbUpdates.experience_clarity = updates.experienceClarity;
    if (updates.evidenceClarity !== undefined) dbUpdates.evidence_clarity = updates.evidenceClarity;
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

    const { error: updateError } = await supabase.from('career_targets').update(dbUpdates).eq('id', id);
    if (updateError) throw updateError;
  };

  return {
    targets,
    activeTarget: targets.find(t => t.isActive),
    isLoading,
    error,
    addTarget,
    updateTarget,
  };
}
