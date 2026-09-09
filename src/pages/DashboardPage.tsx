import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { NextBestAction } from '../components/dashboard/NextBestAction';
import { CareerReadinessScore } from '../components/dashboard/CareerReadinessScore';
import { CurrentTarget } from '../components/dashboard/CurrentTarget';
import { ActorProgress } from '../components/dashboard/ActorProgress';
import { CareerTrajectoryChart } from '../components/dashboard/CareerTrajectoryChart';
import { SkillDevelopment } from '../components/dashboard/SkillDevelopment';
import { CareerEvidence } from '../components/dashboard/CareerEvidence';
import { CurrentExperiments } from '../components/dashboard/CurrentExperiments';
import { AiInsights } from '../components/dashboard/AiInsights';

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8 relative min-h-[80vh]">
      {/* Decorative Background Orbs for Premium Aesthetic */}
      <div className="absolute -top-20 left-1/4 w-[500px] h-[500px] rounded-full blur-[140px] opacity-10 pointer-events-none" style={{ background: 'hsl(262, 83%, 58%)' }} />
      <div className="absolute top-1/3 right-0 w-[400px] h-[400px] rounded-full blur-[140px] opacity-10 pointer-events-none" style={{ background: 'hsl(172, 66%, 50%)' }} />

      {/* Header section */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10"
      >
        <h1 className="text-3xl md:text-4xl font-bold" style={{ color: 'hsl(210, 40%, 96%)', fontFamily: 'var(--font-heading)' }}>
          Welcome back, {user?.fullName?.split(' ')[0] || 'Explorer'}
        </h1>
        <p className="text-sm md:text-base mt-2" style={{ color: 'hsl(215, 20%, 65%)' }}>
          Your career development operating system is ready.
        </p>
      </motion.div>

      {/* Premium Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
        
        {/* Next Best Action - Prominent Placement */}
        <div className="col-span-1 md:col-span-12 lg:col-span-8">
          <NextBestAction />
        </div>

        {/* Career Readiness - Quick Glance Metric */}
        <div className="col-span-1 md:col-span-12 lg:col-span-4 flex flex-col">
          <div className="h-full">
            <CareerReadinessScore />
          </div>
        </div>

        {/* ACTOR Progress - Workflow Centerpiece */}
        <div className="col-span-1 md:col-span-12">
          <ActorProgress />
        </div>

        {/* Left Column: Target & Insights */}
        <div className="col-span-1 md:col-span-12 lg:col-span-5 flex flex-col gap-6">
          <CurrentTarget />
          <AiInsights />
        </div>

        {/* Right Column: Analytics & Execution */}
        <div className="col-span-1 md:col-span-12 lg:col-span-7 flex flex-col gap-6">
          <CareerTrajectoryChart />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
             <SkillDevelopment />
             <CareerEvidence />
          </div>
          
          <CurrentExperiments />
        </div>
      </div>
    </div>
  );
}
