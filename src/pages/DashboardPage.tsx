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
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Top: Next Best Action — immediately answers "What should I do next?" */}
      <NextBestAction />

      {/* Row 1: Career Readiness + Current Target */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <CareerReadinessScore />
        <CurrentTarget />
      </div>

      {/* Row 2: ACTOR Progress (full width) — answers "Where am I?" */}
      <ActorProgress />

      {/* Row 3: Trajectory Chart (full width) — answers "Where am I going?" */}
      <CareerTrajectoryChart />

      {/* Row 4: Skills + Evidence + Experiments */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <SkillDevelopment />
        <CareerEvidence />
        <CurrentExperiments />
      </div>

      {/* Row 5: AI Insights — answers "What is blocking my development?" */}
      <AiInsights />
    </div>
  );
}
