import { ThemeToggle } from "../components/shared/ThemeToggle";
import { BrandLogo } from "../components/shared/BrandLogo";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Target, Rocket, Briefcase, Zap, CheckCircle } from 'lucide-react';


const STEPS = [
  { id: 0, title: 'Welcome', icon: Rocket },
  { id: 1, title: 'Current Status', icon: Briefcase },
  { id: 2, title: 'Top Skills', icon: Zap },
  { id: 3, title: 'Career Target', icon: Target },
];

export function OnboardingPage() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [currentRole, setCurrentRole] = useState('');
  const [yearsExperience, setYearsExperience] = useState(0);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [careerTarget, setCareerTarget] = useState('');

  const handleNext = () => setStep(s => Math.min(STEPS.length - 1, s + 1));
  const handlePrev = () => setStep(s => Math.max(0, s - 1));

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleComplete = async () => {
    if (!user) return;
    setIsSaving(true);
    
    try {
      // 1. Update Profile
      await updateProfile({
        currentRole: currentRole,
        yearsExperience: yearsExperience,
        onboardingCompleted: true,
        onboardingStep: STEPS.length,
      });

      // 2. Add Skills
      const { db } = await import('../lib/db');
      
      for (const skillName of skills) {
        // Find existing skill
        const existingSkill = await db.skills.where('skillName').equals(skillName).filter(s => s.userId === user.id).first();

        if (!existingSkill) {
          await db.skills.add({
            id: crypto.randomUUID(),
            userId: user.id,
            skillName,
            category: 'technical',
            level: 'intermediate',
            confidence: 50,
            evidenceCount: 0,
            linkedProjects: [],
            linkedExperiments: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      }

      // 3. Add initial Career Target
      if (careerTarget) {
        await db.career_targets.add({
          id: crypto.randomUUID(),
          userId: user.id,
          originalGoal: careerTarget,
          compressedTarget: careerTarget,
          roleClarity: 50,
          skillClarity: 50,
          industryClarity: 50,
          experienceClarity: 50,
          evidenceClarity: 10,
          overallClarity: 30,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        await db.actor_events.add({
          id: crypto.randomUUID(),
          userId: user.id,
          stage: 'compress',
          eventType: 'target_created',
          title: 'Initial Career Target Set',
          description: `Targeted: ${careerTarget}`,
          metadata: {},
          createdAt: new Date().toISOString(),
        });
      }

      navigate('/');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      alert('Something went wrong saving your profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{ background: 'hsl(var(--bg-primary))' }}>
      <div className="absolute right-4 top-4"><ThemeToggle /></div>
      {/* Sidebar Progress */}
      <div className="md:w-64 shrink-0 p-5 md:p-8" style={{ background: 'hsl(var(--bg-secondary))', borderRight: '1px solid hsl(var(--border))' }}>
        <div className="mb-10">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold mb-4"
            style={{
              background: 'linear-gradient(135deg, hsl(262, 83%, 58%), hsl(var(--accent-light)))',
              fontFamily: 'var(--font-heading)',
            }}
          >
            <BrandLogo />
          </div>
          <h2 className="text-xl font-bold" style={{ color: 'hsl(var(--text-primary))', fontFamily: 'var(--font-heading)' }}>
            Welcome to CaDeT
          </h2>
          <p className="text-xs mt-2" style={{ color: 'hsl(var(--text-secondary))' }}>
            Let's establish your baseline.
          </p>
        </div>

        <div className="space-y-4">
          {STEPS.map((s) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const isPast = step > s.id;
            return (
              <div key={s.id} className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${isActive ? 'actor-pulse' : ''}`}
                  style={{
                    background: isPast ? 'hsl(150, 70%, 45%, 0.15)' : isActive ? 'hsl(262, 83%, 58%, 0.15)' : 'hsl(var(--border))',
                    color: isPast ? 'hsl(150, 70%, 45%)' : isActive ? 'hsl(var(--accent-light))' : 'hsl(var(--text-muted))',
                    border: isActive ? '1px solid hsl(262, 83%, 58%, 0.4)' : '1px solid transparent',
                  }}
                >
                  {isPast ? <CheckCircle size={14} /> : <Icon size={14} />}
                </div>
                <span className="text-xs font-medium" style={{ color: isActive ? 'hsl(var(--text-primary))' : 'hsl(var(--text-muted))' }}>
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-12 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-10 pointer-events-none"
          style={{ background: 'hsl(262, 83%, 58%)' }}
        />

        <div className="w-full max-w-xl z-10">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h1 className="text-3xl font-bold" style={{ color: 'hsl(var(--text-primary))', fontFamily: 'var(--font-heading)' }}>
                  Hello, {user?.fullName?.split(' ')[0] || 'there'}! 👋
                </h1>
                <p className="text-sm leading-relaxed" style={{ color: 'hsl(var(--text-secondary))' }}>
                  CaDeT is a career development operating system powered by the ACTOR framework (Aim, Compress, Test, Own, Run). 
                  To give you the most accurate insights and track your progress correctly, we need to know where you're starting from.
                </p>
                <button onClick={handleNext} className="btn btn-primary">
                  Get Started <ArrowRight size={16} />
                </button>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h1 className="text-2xl font-bold" style={{ color: 'hsl(var(--text-primary))', fontFamily: 'var(--font-heading)' }}>
                  Current Status
                </h1>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(var(--text-secondary))' }}>
                      What is your current or most recent role?
                    </label>
                    <input
                      type="text"
                      className="input-dark w-full"
                      placeholder="e.g., Junior Frontend Developer, Student, Unemployed"
                      value={currentRole}
                      onChange={e => setCurrentRole(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'hsl(var(--text-secondary))' }}>
                      Years of professional experience?
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="input-dark w-full md:w-32"
                      value={yearsExperience}
                      onChange={e => setYearsExperience(parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button onClick={handlePrev} className="btn" style={{ background: 'hsl(var(--border))' }}>
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button onClick={handleNext} className="btn btn-primary" disabled={!currentRole}>
                    Next Step <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h1 className="text-2xl font-bold" style={{ color: 'hsl(var(--text-primary))', fontFamily: 'var(--font-heading)' }}>
                  Top Skills
                </h1>
                <p className="text-sm" style={{ color: 'hsl(var(--text-secondary))' }}>
                  What are 3-5 skills you are most confident in right now? You can add more later.
                </p>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="input-dark flex-1"
                      placeholder="e.g., React, Python, Project Management"
                      value={newSkill}
                      onChange={e => setNewSkill(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddSkill()}
                    />
                    <button onClick={handleAddSkill} className="btn" style={{ background: 'hsl(var(--border))' }}>
                      Add
                    </button>
                  </div>
                  
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4 p-4 rounded-xl" style={{ background: 'hsl(var(--bg-secondary))' }}>
                      {skills.map(skill => (
                        <div key={skill} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm" style={{ background: 'hsl(var(--border))', color: 'hsl(var(--text-primary))' }}>
                          {skill}
                          <button onClick={() => setSkills(skills.filter(s => s !== skill))} style={{ color: 'hsl(var(--text-muted))' }}>
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-3 pt-4">
                  <button onClick={handlePrev} className="btn" style={{ background: 'hsl(var(--border))' }}>
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button onClick={handleNext} className="btn btn-primary" disabled={skills.length === 0}>
                    Next Step <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h1 className="text-2xl font-bold" style={{ color: 'hsl(var(--text-primary))', fontFamily: 'var(--font-heading)' }}>
                  What's the Target?
                </h1>
                <p className="text-sm leading-relaxed" style={{ color: 'hsl(var(--text-secondary))' }}>
                  In one sentence, what is the next major step you are trying to take in your career? 
                  (It's okay if it's vague, CaDeT will help you compress it later).
                </p>
                <div className="space-y-4">
                  <textarea
                    className="input-dark w-full h-32 resize-none"
                    placeholder="e.g., I want to become a Senior Engineer at a climate tech startup."
                    value={careerTarget}
                    onChange={e => setCareerTarget(e.target.value)}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button onClick={handlePrev} className="btn" style={{ background: 'hsl(var(--border))' }} disabled={isSaving}>
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button onClick={handleComplete} className="btn btn-primary" disabled={!careerTarget || isSaving}>
                    {isSaving ? 'Saving Profile...' : 'Complete & Enter CaDeT'} <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
