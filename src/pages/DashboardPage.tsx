import { ProfileCard } from "../components/dashboard/ProfileCard";
import { WelcomeTutorial } from "../components/dashboard/WelcomeTutorial";
import { StarterGuide } from "../components/dashboard/StarterGuide";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { NextBestAction } from "../components/dashboard/NextBestAction";
import { CareerReadinessScore } from "../components/dashboard/CareerReadinessScore";
import { CurrentTarget } from "../components/dashboard/CurrentTarget";
import { ActorProgress } from "../components/dashboard/ActorProgress";
import { lazy, Suspense, useState } from "react";
const CareerTrajectoryChart = lazy(() =>
  import("../components/dashboard/CareerTrajectoryChart").then((module) => ({
    default: module.CareerTrajectoryChart,
  })),
);
import { SkillDevelopment } from "../components/dashboard/SkillDevelopment";
import { CareerEvidence } from "../components/dashboard/CareerEvidence";
import { CurrentExperiments } from "../components/dashboard/CurrentExperiments";
import { AiInsights } from "../components/dashboard/AiInsights";

export function DashboardPage() {
  const { user } = useAuth();
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className="dashboard">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="page-heading"
      >
        <p className="eyebrow">Career overview</p>
        <h1>Welcome back, {user?.fullName?.split(" ")[0] || "Explorer"}</h1>
        <p>Your direction, progress, and next steps in one place.</p>
      </motion.div>
      <WelcomeTutorial />
      <ProfileCard />
      <StarterGuide />
      <Link to="/learning-plan" className="btn btn-primary mb-5 mr-3">
        My learning plan
      </Link>
      <Link to="/developer" className="btn btn-secondary mb-5">
        Developer Options · Pitch guide
      </Link>
      <div className="dashboard-grid">
        <div className="dashboard-focus">
          <NextBestAction />
          <CurrentTarget />
        </div>
        <div className="dashboard-readiness">
          <CareerReadinessScore />
        </div>
        <div className="dashboard-progress">
          <ActorProgress />
        </div>
        <div className="dashboard-analytics">
          <section>
            {showHistory ? (
              <Suspense fallback={<p role="status">Loading history chart…</p>}>
                <CareerTrajectoryChart />
              </Suspense>
            ) : (
              <button
                className="btn btn-secondary w-full"
                onClick={() => setShowHistory(true)}
              >
                Show readiness history
              </button>
            )}
          </section>
          <AiInsights />
        </div>
        <div className="dashboard-evidence">
          <SkillDevelopment />
          <CareerEvidence />
          <CurrentExperiments />
        </div>
      </div>
    </div>
  );
}
