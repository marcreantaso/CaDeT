import { motion } from 'framer-motion';
import { Lock, Check } from 'lucide-react';
import { useActor } from '../../contexts/ActorContext';
import { ACTOR_STAGES, ACTOR_STAGE_META } from '../../types/actor';

export function ActorProgress() {
  const { actorState } = useActor();

  if (!actorState) return null;

  return (
    <motion.div
      className="glass-card p-5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: 'hsl(215, 15%, 45%)', fontFamily: 'var(--font-heading)' }}
        >
          ACTOR Progress
        </h3>
        <span className="text-[10px] font-medium" style={{ color: 'hsl(215, 15%, 45%)' }}>
          Cycle {actorState.cycleCount}
        </span>
      </div>

      {/* Pipeline visualization */}
      <div className="actor-pipeline">
        {ACTOR_STAGES.map((stageId, index) => {
          const stage = actorState.stages[stageId];
          const meta = ACTOR_STAGE_META[stageId];
          const isCompleted = stage.status === 'completed';
          const isActive = stage.status === 'active';
          const isLocked = stage.status === 'locked';

          return (
            <div key={stageId} className="flex items-center" style={{ flex: 1 }}>
              {/* Stage Node */}
              <motion.div
                className="actor-node"
                style={{ flex: 'none' }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center relative ${isActive ? 'actor-pulse' : ''}`}
                  style={{
                    background: isCompleted
                      ? meta.color
                      : isActive
                      ? `${meta.color}25`
                      : 'hsl(222, 30%, 14%)',
                    border: isActive ? `2px solid ${meta.color}` : isCompleted ? 'none' : '1px solid hsl(222, 25%, 18%)',
                    boxShadow: isActive ? `0 0 16px ${meta.color}30` : isCompleted ? `0 0 12px ${meta.color}25` : 'none',
                  }}
                >
                  {isCompleted ? (
                    <Check size={18} style={{ color: 'white' }} strokeWidth={2.5} />
                  ) : isLocked ? (
                    <Lock size={14} style={{ color: 'hsl(215, 15%, 40%)' }} />
                  ) : (
                    <span
                      className="text-sm font-bold"
                      style={{
                        color: meta.color,
                        fontFamily: 'var(--font-heading)',
                      }}
                    >
                      {meta.letter}
                    </span>
                  )}
                </div>

                <span
                  className="text-[10px] font-semibold text-center"
                  style={{
                    color: isLocked ? 'hsl(215, 15%, 35%)' : isActive ? meta.color : 'hsl(215, 20%, 65%)',
                    fontFamily: 'var(--font-heading)',
                  }}
                >
                  {meta.label}
                </span>

                {isActive && (
                  <span className="text-[9px]" style={{ color: 'hsl(215, 15%, 45%)' }}>
                    {stage.progress}%
                  </span>
                )}
              </motion.div>

              {/* Connector */}
              {index < ACTOR_STAGES.length - 1 && (
                <div className="actor-connector mx-1" style={{ flex: 1 }}>
                  <div className="actor-connector-bg" />
                  <div
                    className="actor-connector-fill"
                    style={{
                      width: isCompleted ? '100%' : isActive ? `${stage.progress}%` : '0%',
                      background: meta.color,
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Current stage detail */}
      <div
        className="mt-3 pt-3 flex items-center gap-2"
        style={{ borderTop: '1px solid hsl(222, 25%, 16%)' }}
      >
        <div
          className="w-2 h-2 rounded-full actor-pulse"
          style={{ background: ACTOR_STAGE_META[actorState.currentStage].color }}
        />
        <span className="text-xs" style={{ color: 'hsl(215, 20%, 65%)' }}>
          Currently in{' '}
          <span className="font-semibold" style={{ color: ACTOR_STAGE_META[actorState.currentStage].color }}>
            {ACTOR_STAGE_META[actorState.currentStage].label}
          </span>
          {' '}— {ACTOR_STAGE_META[actorState.currentStage].description}
        </span>
      </div>
    </motion.div>
  );
}
