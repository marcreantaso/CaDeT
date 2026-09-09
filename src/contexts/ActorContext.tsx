import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useRealtimeSubscription } from '../hooks/useRealtimeSubscription';
import type { ActorState, ActorStage, ActorEvent } from '../types/actor';

interface ActorContextType {
  actorState: ActorState | null;
  events: ActorEvent[];
  currentStage: ActorStage;
  isLoading: boolean;
  setActiveStage: (stage: ActorStage) => Promise<void>;
  completeStage: (stage: ActorStage) => Promise<void>;
  addEvent: (event: Omit<ActorEvent, 'id' | 'createdAt'>) => Promise<void>;
  selectedStage: ActorStage | null;
  setSelectedStage: (stage: ActorStage | null) => void;
}

const ActorContext = createContext<ActorContextType | null>(null);

const DEFAULT_STATE: ActorState = {
  currentStage: 'aim',
  stages: {
    aim: { status: 'active', progress: 0 },
    compress: { status: 'locked', progress: 0 },
    test: { status: 'locked', progress: 0 },
    own: { status: 'locked', progress: 0 },
    run: { status: 'locked', progress: 0 },
  },
  cycleCount: 1,
  lastTransition: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export function ActorProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [actorState, setActorState] = useState<ActorState | null>(null);
  const [events, setEvents] = useState<ActorEvent[]>([]);
  const [selectedStage, setSelectedStage] = useState<ActorStage | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchActorData = useCallback(async () => {
    if (!user) {
      setActorState(null);
      setEvents([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      // Fetch Actor State
      const { data: stateData, error: stateError } = await supabase
        .from('actor_states')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (stateError && stateError.code !== 'PGRST116') throw stateError;

      if (stateData) {
        setActorState({
          currentStage: stateData.current_stage as ActorStage,
          stages: {
            aim: { status: stateData.aim_status, progress: stateData.aim_progress },
            compress: { status: stateData.compress_status, progress: stateData.compress_progress },
            test: { status: stateData.test_status, progress: stateData.test_progress },
            own: { status: stateData.own_status, progress: stateData.own_progress },
            run: { status: stateData.run_status, progress: stateData.run_progress },
          },
          cycleCount: stateData.cycle_count,
          lastTransition: stateData.last_transition,
          updatedAt: stateData.updated_at,
        });
      } else {
        setActorState(DEFAULT_STATE);
      }

      // Fetch Events
      const { data: eventData, error: eventError } = await supabase
        .from('actor_events')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (eventError) throw eventError;

      setEvents(eventData.map(e => ({
        id: e.id,
        stage: e.stage as ActorStage,
        type: e.event_type,
        title: e.title,
        description: e.description,
        createdAt: e.created_at,
        metadata: e.metadata,
      })));

    } catch (err) {
      console.error('Error fetching actor data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchActorData();
  }, [fetchActorData]);

  // Listen to changes on actor_states
  useRealtimeSubscription({
    table: 'actor_states',
    onUpdate: () => fetchActorData(),
    filter: user ? `user_id=eq.${user.id}` : undefined,
  });

  // Listen to changes on actor_events
  useRealtimeSubscription({
    table: 'actor_events',
    onUpdate: () => fetchActorData(),
    filter: user ? `user_id=eq.${user.id}` : undefined,
  });

  const setActiveStage = async (stage: ActorStage) => {
    if (!user) return;

    // Optimistic
    setActorState(prev => prev ? ({
      ...prev,
      currentStage: stage,
      stages: {
        ...prev.stages,
        [stage]: { ...prev.stages[stage], status: 'active' },
      },
      lastTransition: new Date().toISOString(),
    }) : null);

    const updates: any = {
      current_stage: stage,
      last_transition: new Date().toISOString(),
    };
    updates[`${stage}_status`] = 'active';

    await supabase.from('actor_states').update(updates).eq('user_id', user.id);
  };

  const completeStage = async (stage: ActorStage) => {
    if (!user) return;

    const updates: any = {};
    updates[`${stage}_status`] = 'completed';
    updates[`${stage}_progress`] = 100;

    await supabase.from('actor_states').update(updates).eq('user_id', user.id);
  };

  const addEvent = async (event: Omit<ActorEvent, 'id' | 'createdAt'>) => {
    if (!user) return;
    await supabase.from('actor_events').insert({
      user_id: user.id,
      stage: event.stage,
      event_type: event.type,
      title: event.title,
      description: event.description,
      metadata: event.metadata || {},
    });
  };

  return (
    <ActorContext.Provider value={{
      actorState,
      events,
      currentStage: actorState?.currentStage || 'aim',
      isLoading,
      setActiveStage,
      completeStage,
      addEvent,
      selectedStage,
      setSelectedStage,
    }}>
      {children}
    </ActorContext.Provider>
  );
}

export function useActor() {
  const context = useContext(ActorContext);
  if (!context) throw new Error('useActor must be used within ActorProvider');
  return context;
}
