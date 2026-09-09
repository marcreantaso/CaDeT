import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useRealtimeSubscription } from './useRealtimeSubscription';
import type { UserSkill, SkillCategory, SkillLevel } from '../types/skills';

export function useSkills() {
  const { user } = useAuth();
  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSkills = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
        .from('user_skills')
        .select(`
          id,
          level,
          confidence,
          evidence_count,
          last_practiced,
          skills (
            id,
            name,
            category
          )
        `)
        .eq('user_id', user.id);

      if (fetchError) throw fetchError;

      const mappedSkills: UserSkill[] = data.map((d: any) => ({
        id: d.id,
        userId: user.id,
        skillId: d.skills.id,
        skillName: d.skills.name,
        category: d.skills.category as SkillCategory,
        level: d.level as SkillLevel,
        confidence: d.confidence,
        evidenceCount: d.evidence_count || 0,
        lastPracticed: d.last_practiced,
        linkedProjects: [],
        linkedExperiments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      setSkills(mappedSkills);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  useRealtimeSubscription({
    table: 'user_skills',
    onUpdate: () => fetchSkills(),
    filter: user ? `user_id=eq.${user.id}` : undefined,
  });

  const addSkill = async (skillName: string, category: string = 'technical', level: string = 'beginner', confidence: number = 20) => {
    if (!user) return;

    try {
      let skillId;
      const { data: existingSkill } = await supabase
        .from('skills')
        .select('id')
        .eq('name', skillName)
        .single();

      if (existingSkill) {
        skillId = existingSkill.id;
      } else {
        const { data: newSkill, error: createError } = await supabase
          .from('skills')
          .insert({ name: skillName, category })
          .select()
          .single();
        if (createError) throw createError;
        skillId = newSkill.id;
      }

      const { error: insertError } = await supabase.from('user_skills').insert({
        user_id: user.id,
        skill_id: skillId,
        level,
        confidence,
      });

      if (insertError) throw insertError;
    } catch (err) {
      console.error('Failed to add skill:', err);
      throw err;
    }
  };

  const updateSkill = async (id: string, updates: Partial<UserSkill>) => {
    const dbUpdates: any = {};
    if (updates.level !== undefined) dbUpdates.level = updates.level;
    if (updates.confidence !== undefined) dbUpdates.confidence = updates.confidence;
    if (updates.evidenceCount !== undefined) dbUpdates.evidence_count = updates.evidenceCount;
    if (updates.lastPracticed !== undefined) dbUpdates.last_practiced = updates.lastPracticed;

    const { error: updateError } = await supabase.from('user_skills').update(dbUpdates).eq('id', id);
    if (updateError) throw updateError;
  };

  const deleteSkill = async (id: string) => {
    const { error } = await supabase.from('user_skills').delete().eq('id', id);
    if (error) throw error;
  };

  return {
    skills,
    isLoading,
    error,
    addSkill,
    updateSkill,
    deleteSkill,
  };
}

