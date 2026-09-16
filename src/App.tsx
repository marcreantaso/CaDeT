import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ActorProvider } from "./contexts/ActorContext";
import { AppShell } from "./components/layout/AppShell";
const DashboardPage = lazy(() =>
  import("./pages/DashboardPage").then((module) => ({
    default: module.DashboardPage,
  })),
);
const JourneyPage = lazy(() =>
  import("./pages/JourneyPage").then((module) => ({
    default: module.JourneyPage,
  })),
);
const SkillsPage = lazy(() =>
  import("./pages/SkillsPage").then((module) => ({
    default: module.SkillsPage,
  })),
);
const InsightsPage = lazy(() =>
  import("./pages/InsightsPage").then((module) => ({
    default: module.InsightsPage,
  })),
);
const LoginPage = lazy(() =>
  import("./pages/LoginPage").then((module) => ({ default: module.LoginPage })),
);
const SignupPage = lazy(() =>
  import("./pages/SignupPage").then((module) => ({
    default: module.SignupPage,
  })),
);
const OnboardingPage = lazy(() =>
  import("./pages/OnboardingPage").then((module) => ({
    default: module.OnboardingPage,
  })),
);

const RecordsPage = lazy(() =>
  import("./pages/RecordsPage").then((module) => ({
    default: module.RecordsPage,
  })),
);
const CareerMapPage = lazy(() =>
  import("./pages/CareerMapPage").then((module) => ({
    default: module.CareerMapPage,
  })),
);

const DeveloperPage = lazy(() => import("./pages/DeveloperPage").then(m => ({ default: m.DeveloperPage })));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ background: "hsl(222, 47%, 6%)" }}
      >
        <div className="text-center">
          <div
            className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center text-white font-bold actor-pulse"
            style={{
              background:
                "linear-gradient(135deg, hsl(262, 83%, 58%), hsl(262, 83%, 68%))",
              fontFamily: "var(--font-heading)",
            }}
          >
            Cd
          </div>
          <p className="text-sm" style={{ color: "hsl(215, 20%, 65%)" }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Redirect to onboarding if not completed and trying to access dashboard
  if (
    user &&
    !user.onboardingCompleted &&
    location.pathname !== "/onboarding"
  ) {
    return <Navigate to="/onboarding" replace />;
  }

  // Redirect to dashboard if trying to access onboarding when already onboarded
  if (user && user.onboardingCompleted && location.pathname === "/onboarding") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Suspense
      fallback={
        <div className="p-6" role="status">
          Loading page…
        </div>
      }
    >
      <Routes>
        {/* Auth routes (light theme) */}
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
          }
        />
        <Route
          path="/signup"
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <SignupPage />
          }
        />

        {/* Onboarding */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          }
        />

        {/* Protected routes (dark dashboard) */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ActorProvider key="authenticated-workspace">
                <AppShell />
              </ActorProvider>
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="journey" element={<JourneyPage />} />
          <Route path="records" element={<RecordsPage />} />
          <Route path="developer" element={<DeveloperPage />} />
          <Route path="career-map" element={<CareerMapPage />} />
          <Route path="skills" element={<SkillsPage />} />
          <Route path="insights" element={<InsightsPage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
