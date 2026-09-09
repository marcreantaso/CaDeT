import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Check, ChevronRight, Target, Crosshair, FlaskConical, Crown, Rocket, ArrowRight } from 'lucide-react';
import { useActor } from '../contexts/ActorContext';
import { ACTOR_STAGES, ACTOR_STAGE_META, ACTOR_CYCLE, type ActorStage } from '../types/actor';
import { useCareerGoals } from '../hooks/useCareerGoals';
import { useCareerTargets } from '../hooks/useCareerTargets';
import { useExperiments } from '../hooks/useExperiments';
import { useProjects } from '../hooks/useProjects';
import { useSkills } from '../hooks/useSkills';
import { useTasks } from '../hooks/useTasks';
import { formatRelativeDate } from '../utils/formatting';

const STAGE_ICONS: Record<string, typeof Target> = {
  aim: Target,
  compress: Crosshair,
  test: FlaskConical,
  own: Crown,
  run: Rocket,
};

export function JourneyPage() {
  const { actorState, events } = useActor();
  const [openStage, setOpenStage] = useState<ActorStage | null>(null);

  if (!actorState) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-[hsl(262,83%,58%)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ color: 'hsl(210, 40%, 96%)', fontFamily: 'var(--font-heading)' }}
        >
          ACTOR Journey
        </h1>
        <p className="text-sm mt-1" style={{ color: 'hsl(215, 20%, 65%)' }}>
          Your continuous career development workflow — Cycle {actorState.cycleCount}
        </p>
      </div>

      {/* Full ACTOR cycle visualization */}
      <div className="glass-card p-6">
        <h3
          className="text-xs font-semibold uppercase tracking-wider mb-2"
          style={{ color: 'hsl(215, 15%, 45%)', fontFamily: 'var(--font-heading)' }}
        >
          The ACTOR Loop
        </h3>
        <p className="text-xs mb-5" style={{ color: 'hsl(215, 20%, 65%)' }}>
          AIM → COMPRESS → TEST → OWN → RUN → Observe → Learn → Recalculate → AIM
        </p>

        {/* Cycle steps */}
        <div className="flex flex-wrap gap-2">
          {ACTOR_CYCLE.map((step, index) => (
            <div key={step.label} className="flex items-center gap-2">
              <div
                className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                style={{
                  fontFamily: 'var(--font-heading)',
                  background: step.isActor ? 'hsl(262, 83%, 58%, 0.12)' : 'hsl(222, 30%, 14%)',
                  color: step.isActor ? 'hsl(262, 83%, 68%)' : 'hsl(215, 20%, 65%)',
                  border: step.isActor ? '1px solid hsl(262, 83%, 58%, 0.2)' : '1px solid hsl(222, 25%, 18%)',
                }}
              >
                {step.label}
              </div>
              {index < ACTOR_CYCLE.length - 1 && (
                <ArrowRight size={12} style={{ color: 'hsl(215, 15%, 35%)' }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ACTOR Pipeline — Full Stage Cards */}
      <div className="space-y-4">
        {ACTOR_STAGES.map((stageId, index) => {
          const stage = actorState.stages[stageId];
          const meta = ACTOR_STAGE_META[stageId];
          const StageIcon = STAGE_ICONS[stageId];
          const isOpen = openStage === stageId;
          const isCompleted = stage.status === 'completed';
          const isActive = stage.status === 'active';
          const isLocked = stage.status === 'locked';
          const stageEvents = events.filter(e => e.stage === stageId);

          return (
            <motion.div
              key={stageId}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              {/* Stage card */}
              <motion.div
                className="glass-card overflow-hidden cursor-pointer"
                style={{
                  borderColor: isActive ? `${meta.color}40` : undefined,
                  boxShadow: isActive ? `0 0 20px ${meta.color}15` : undefined,
                  opacity: isLocked ? 0.5 : 1,
                }}
                onClick={() => !isLocked && setOpenStage(isOpen ? null : stageId)}
                whileHover={isLocked ? {} : { borderColor: `${meta.color}40` }}
              >
                <div className="p-5 flex items-center gap-4">
                  {/* Stage icon */}
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isActive ? 'actor-pulse' : ''}`}
                    style={{
                      background: isCompleted ? meta.color : `${meta.color}15`,
                      boxShadow: isActive ? `0 0 16px ${meta.color}30` : 'none',
                    }}
                  >
                    {isCompleted ? (
                      <Check size={22} style={{ color: 'white' }} strokeWidth={2.5} />
                    ) : isLocked ? (
                      <Lock size={18} style={{ color: 'hsl(215, 15%, 35%)' }} />
                    ) : (
                      <StageIcon size={22} style={{ color: meta.color }} />
                    )}
                  </div>

                  {/* Stage info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-sm font-bold"
                        style={{ color: isLocked ? 'hsl(215, 15%, 40%)' : meta.color, fontFamily: 'var(--font-heading)' }}
                      >
                        {meta.letter}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider"
                        style={{ color: isLocked ? 'hsl(215, 15%, 40%)' : 'hsl(210, 40%, 96%)', fontFamily: 'var(--font-heading)' }}
                      >
                        {meta.label}
                      </span>
                      <span className={`badge ${isCompleted ? 'badge-success' : isActive ? 'badge-warning' : 'badge-accent'}`}>
                        {stage.status}
                      </span>
                    </div>
                    <p className="text-xs mt-1" style={{ color: 'hsl(215, 20%, 65%)' }}>
                      {meta.description}
                    </p>
                    {isActive && (
                      <div className="mt-2">
                        <div className="progress-bar" style={{ maxWidth: 200 }}>
                          <div className="progress-bar-fill" style={{ width: `${stage.progress}%`, background: meta.color }} />
                        </div>
                        <span className="text-[10px] mt-1 inline-block" style={{ color: meta.color }}>
                          {stage.progress}% complete
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Expand icon */}
                  {!isLocked && (
                    <motion.div
                      animate={{ rotate: isOpen ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronRight size={18} style={{ color: 'hsl(215, 15%, 45%)' }} />
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Expanded workflow panel */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div
                      className="p-5 mt-1 rounded-2xl"
                      style={{ background: 'hsl(222, 30%, 9%)', border: '1px solid hsl(222, 25%, 14%)' }}
                    >
                      {/* Stage-specific content */}
                      {stageId === 'aim' && <AimContent />}
                      {stageId === 'compress' && <CompressContent />}
                      {stageId === 'test' && <TestContent />}
                      {stageId === 'own' && <OwnContent />}
                      {stageId === 'run' && <RunContent />}

                      {/* Event timeline */}
                      {stageEvents.length > 0 && (
                        <div className="mt-5 pt-4" style={{ borderTop: '1px solid hsl(222, 25%, 14%)' }}>
                          <p className="text-[10px] font-semibold uppercase tracking-wider mb-3"
                            style={{ color: 'hsl(215, 15%, 45%)', fontFamily: 'var(--font-heading)' }}
                          >
                            Stage Events
                          </p>
                          <div className="space-y-2">
                            {stageEvents.map(event => (
                              <div key={event.id} className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                                  style={{ background: meta.color }}
                                />
                                <div>
                                  <p className="text-xs font-medium" style={{ color: 'hsl(210, 40%, 96%)' }}>
                                    {event.title}
                                  </p>
                                  <p className="text-[10px]" style={{ color: 'hsl(215, 15%, 45%)' }}>
                                    {formatRelativeDate(event.createdAt)} • {event.description}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Connector between stages */}
              {index < ACTOR_STAGES.length - 1 && (
                <div className="flex justify-center py-1">
                  <div className="w-0.5 h-4 rounded-full" style={{ background: 'hsl(222, 25%, 18%)' }} />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// === Stage Workflow Contents ===

function AimContent() {
  const { goals } = useCareerGoals();
  
  const categories = [
    { label: 'Ambitions', items: goals.filter(g => g.category === 'ambition') },
    { label: 'Desired Roles', items: goals.filter(g => g.category === 'role') },
    { label: 'Interests', items: goals.filter(g => g.category === 'interest') },
    { label: 'Values', items: goals.filter(g => g.category === 'value') },
    { label: 'Environment', items: goals.filter(g => g.category === 'environment') },
    { label: 'Industries', items: goals.filter(g => g.category === 'industry') },
  ];

  return (
    <div className="space-y-4">
      <p className="text-xs" style={{ color: 'hsl(215, 20%, 65%)' }}>
        Career ambitions, interests, values, and preferences collected during the AIM stage.
      </p>
      
      {goals.length === 0 ? (
        <div className="p-4 rounded-xl text-center" style={{ background: 'hsl(222, 30%, 12%)' }}>
          <p className="text-sm" style={{ color: 'hsl(215, 20%, 65%)' }}>No goals defined yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {categories.filter(c => c.items.length > 0).map(cat => (
            <div key={cat.label} className="p-3 rounded-xl" style={{ background: 'hsl(222, 30%, 12%)' }}>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-2"
                style={{ color: 'hsl(262, 83%, 68%)', fontFamily: 'var(--font-heading)' }}
              >
                {cat.label}
              </p>
              {cat.items.map(goal => (
                <div key={goal.id} className="mb-2">
                  <p className="text-xs font-medium" style={{ color: 'hsl(210, 40%, 96%)' }}>{goal.title}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'hsl(215, 15%, 45%)' }}>{goal.description}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CompressContent() {
  const { targets } = useCareerTargets();
  
  return (
    <div className="space-y-4">
      <p className="text-xs" style={{ color: 'hsl(215, 20%, 65%)' }}>
        Vague ambitions transformed into measurable career targets.
      </p>
      
      {targets.length === 0 ? (
        <div className="p-4 rounded-xl text-center" style={{ background: 'hsl(222, 30%, 12%)' }}>
          <p className="text-sm" style={{ color: 'hsl(215, 20%, 65%)' }}>No targets defined yet.</p>
        </div>
      ) : (
        targets.map(target => (
          <div key={target.id} className="p-4 rounded-xl" style={{ background: 'hsl(222, 30%, 12%)' }}>
            <div className="mb-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-1"
                style={{ color: 'hsl(215, 15%, 45%)', fontFamily: 'var(--font-heading)' }}
              >
                Before
              </p>
              <p className="text-xs italic" style={{ color: 'hsl(215, 20%, 65%)' }}>
                "{target.originalGoal}"
              </p>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <ArrowRight size={14} style={{ color: 'hsl(200, 83%, 55%)' }} />
              <p className="text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: 'hsl(200, 83%, 55%)', fontFamily: 'var(--font-heading)' }}
              >
                After — Compressed
              </p>
            </div>
            <p className="text-sm font-semibold" style={{ color: 'hsl(210, 40%, 96%)', fontFamily: 'var(--font-heading)' }}>
              {target.compressedTarget}
            </p>
            <div className="flex items-center gap-2 mt-3">
              <span className="badge badge-accent">{target.overallClarity}% clarity</span>
              {target.isActive && <span className="badge badge-success">Active</span>}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function TestContent() {
  const { experiments } = useExperiments();
  
  return (
    <div className="space-y-4">
      <p className="text-xs" style={{ color: 'hsl(215, 20%, 65%)' }}>
        Career experiments to validate direction through real experience.
      </p>
      
      {experiments.length === 0 ? (
        <div className="p-4 rounded-xl text-center" style={{ background: 'hsl(222, 30%, 12%)' }}>
          <p className="text-sm" style={{ color: 'hsl(215, 20%, 65%)' }}>No experiments run yet.</p>
        </div>
      ) : (
        experiments.map(exp => (
          <div key={exp.id} className="p-4 rounded-xl" style={{ background: 'hsl(222, 30%, 12%)' }}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`badge ${exp.status === 'completed' ? 'badge-success' : exp.status === 'active' ? 'badge-warning' : 'badge-accent'}`}>
                {exp.status}
              </span>
              <span className="text-[10px]" style={{ color: 'hsl(215, 15%, 45%)' }}>{exp.timeline}</span>
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1"
              style={{ color: 'hsl(45, 93%, 55%)', fontFamily: 'var(--font-heading)' }}
            >
              Hypothesis
            </p>
            <p className="text-xs font-medium mb-2" style={{ color: 'hsl(210, 40%, 96%)' }}>
              {exp.hypothesis}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1"
              style={{ color: 'hsl(215, 15%, 45%)', fontFamily: 'var(--font-heading)' }}
            >
              Experiment
            </p>
            <p className="text-xs" style={{ color: 'hsl(215, 20%, 65%)' }}>
              {exp.experiment}
            </p>
            {exp.scores && (
              <div className="grid grid-cols-6 gap-2 mt-3 pt-3" style={{ borderTop: '1px solid hsl(222, 25%, 16%)' }}>
                {[
                  { l: 'Interest', v: exp.scores.interest },
                  { l: 'Enjoyment', v: exp.scores.enjoyment },
                  { l: 'Difficulty', v: exp.scores.difficulty },
                  { l: 'Confidence', v: exp.scores.confidence },
                  { l: 'Performance', v: exp.scores.performance },
                  { l: 'Repeat?', v: exp.scores.wouldRepeat ? 'Yes' : 'No' },
                ].map(s => (
                  <div key={s.l} className="text-center">
                    <p className="text-sm font-bold" style={{
                      color: typeof s.v === 'number'
                        ? s.v >= 7 ? 'hsl(150, 70%, 45%)' : s.v >= 5 ? 'hsl(45, 93%, 55%)' : 'hsl(0, 72%, 51%)'
                        : s.v === 'Yes' ? 'hsl(150, 70%, 45%)' : 'hsl(0, 72%, 51%)',
                      fontFamily: 'var(--font-heading)',
                    }}>
                      {s.v}
                    </p>
                    <p className="text-[8px]" style={{ color: 'hsl(215, 15%, 45%)' }}>{s.l}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

function OwnContent() {
  const { skills } = useSkills();
  const { projects } = useProjects();
  
  return (
    <div className="space-y-4">
      <p className="text-xs" style={{ color: 'hsl(215, 20%, 65%)' }}>
        Career capital inventory — skills, projects, and achievements connected to career targets.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-4 rounded-xl" style={{ background: 'hsl(222, 30%, 12%)' }}>
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-3"
            style={{ color: 'hsl(150, 70%, 45%)', fontFamily: 'var(--font-heading)' }}
          >
            Skills ({skills.length})
          </p>
          <div className="space-y-2">
            {skills.slice(0, 5).map(skill => (
              <div key={skill.id} className="flex items-center justify-between">
                <span className="text-xs" style={{ color: 'hsl(210, 40%, 96%)' }}>{skill.skillName}</span>
                <span className="text-[10px] font-semibold capitalize" style={{ color: 'hsl(215, 20%, 65%)' }}>
                  {skill.level}
                </span>
              </div>
            ))}
            {skills.length === 0 && <p className="text-xs" style={{ color: 'hsl(215, 20%, 65%)' }}>No skills logged.</p>}
          </div>
        </div>
        <div className="p-4 rounded-xl" style={{ background: 'hsl(222, 30%, 12%)' }}>
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-3"
            style={{ color: 'hsl(150, 70%, 45%)', fontFamily: 'var(--font-heading)' }}
          >
            Projects ({projects.length})
          </p>
          <div className="space-y-2">
            {projects.map(project => (
              <div key={project.id} className="flex items-center justify-between">
                <span className="text-xs" style={{ color: 'hsl(210, 40%, 96%)' }}>{project.title}</span>
                <span className={`badge badge-success`}>
                  completed
                </span>
              </div>
            ))}
            {projects.length === 0 && <p className="text-xs" style={{ color: 'hsl(215, 20%, 65%)' }}>No projects logged.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function RunContent() {
  const { tasks } = useTasks();
  
  return (
    <div className="space-y-4">
      <p className="text-xs" style={{ color: 'hsl(215, 20%, 65%)' }}>
        Career execution tasks — every task is connected to a career objective with a clear reason.
      </p>
      
      {tasks.length === 0 ? (
        <div className="p-4 rounded-xl text-center" style={{ background: 'hsl(222, 30%, 12%)' }}>
          <p className="text-sm" style={{ color: 'hsl(215, 20%, 65%)' }}>No tasks assigned.</p>
        </div>
      ) : (
        tasks.map(task => (
          <div key={task.id} className="p-3 rounded-xl" style={{ background: 'hsl(222, 30%, 12%)' }}>
            <div className="flex items-center gap-2 mb-1">
              <span className={`badge ${task.priority === 'high' ? 'badge-error' : task.priority === 'medium' ? 'badge-warning' : 'badge-info'}`}>
                {task.priority}
              </span>
              <span className={`badge ${task.status === 'completed' ? 'badge-success' : task.status === 'in_progress' ? 'badge-warning' : 'badge-accent'}`}>
                {task.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs font-medium mt-1" style={{ color: 'hsl(210, 40%, 96%)' }}>
              {task.title}
            </p>
            <p className="text-[10px] mt-1 italic" style={{ color: 'hsl(172, 66%, 50%)' }}>
              Why: {task.reason}
            </p>
          </div>
        ))
      )}
    </div>
  );
}
