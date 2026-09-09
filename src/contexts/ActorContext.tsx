import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { db } from '../lib/db';
import { useAuth } from './AuthContext';
import { useLiveQuery } from 'dexie-react-hooks';
import { ACTOR_STAGE_META, type ActorStage, type ActorState, type ActorEvent } from '../types/actor';

interface ActorContextType {
  actorState: ActorState | null;
  events: ActorEvent[];
  currentStage: ActorStage;
  isLoading: boolean;
  setActiveStage: (stage: ActorStage) => Promise<void>;
  completeStage: (stage: ActorStage) => Promise<void>;
  addEvent: (event: Omit<ActorEvent, 'id' | 'createdAt' | 'userId'>) => Promise<void>;
  selectedStage: ActorStage | null;
  setSelectedStage: (stage: ActorStage | null) => void;
}

const ActorContext = createContext<ActorContextType | null>(null);

const DEFAULT_STATE: ActorState = {
  id: 'default',
  userId: 'default',
  currentStage: 'aim',
  stages: {
    aim: { ...ACTOR_STAGE_META.aim, id: 'aim', icon: 'aim', status: 'active', progress: 0 },
    compress: { ...ACTOR_STAGE_META.compress, id: 'compress', icon: 'compress', status: 'locked', progress: 0 },
    test: { ...ACTOR_STAGE_META.test, id: 'test', icon: 'test', status: 'locked', progress: 0 },
    own: { ...ACTOR_STAGE_META.own, id: 'own', icon: 'own', status: 'locked', progress: 0 },
    run: { ...ACTOR_STAGE_META.run, id: 'run', icon: 'run', status: 'locked', progress: 0 },
  },
  cycleCount: 1,
  lastTransition: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export function ActorProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [selectedStage, setSelectedStage] = useState<ActorStage | null>(null);
  
  // Use useLiveQuery to keep state reactive, but also provide a fallback mechanism if empty
  const rawActorState = useLiveQuery(
    () => {
      if (!user) return undefined;
      return db.actor_states.where('userId').equals(user.id).first();
    },
    [user]
  );
  
  const events = useLiveQuery(
    () => {
      if (!user) return [];
      return db.actor_events.where('userId').equals(user.id).reverse().sortBy('createdAt');
    },
    [user],
    []
  );

  const isLoading = rawActorState === undefined && user !== null;
  
  // Create or load default state
  const actorState = rawActorState || (user ? { ...DEFAULT_STATE, userId: user.id } : null);

  useEffect(() => {
    // Automatically seed the actor state if it doesn't exist
    if (user && rawActorState === undefined && actorState) {
      db.actor_states.put(actorState);
    }
  }, [user, rawActorState, actorState]);

  const setActiveStage = async (stage: ActorStage) => {
    if (!user || !actorState) return;

    const updatedState = {
      ...actorState,
      currentStage: stage,
      stages: {
        ...actorState.stages,
        [stage]: { ...actorState.stages[stage], status: 'active' },
      },
      lastTransition: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.actor_states.put(updatedState);
  };

  const completeStage = async (stage: ActorStage) => {
    if (!user || !actorState) return;

    const updatedState = {
      ...actorState,
      stages: {
        ...actorState.stages,
        [stage]: { ...actorState.stages[stage], status: 'completed', progress: 100 },
      },
      updatedAt: new Date().toISOString(),
    };

    await db.actor_states.put(updatedState);
  };

  const addEvent = async (event: Omit<ActorEvent, 'id' | 'createdAt' | 'userId'>) => {
    if (!user) return;
    
    const newEvent: ActorEvent = {
      ...event,
      id: crypto.randomUUID(),
      userId: user.id,
      createdAt: new Date().toISOString(),
    };
    
    await db.actor_events.add(newEvent);
  };

  return (
    <ActorContext.Provider value={{
      actorState,
      events: events || [],
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

