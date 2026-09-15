import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useCareerData } from "../../hooks/useCareerData";
import { saveDailyProgress, saveDailyForecasts } from "../../lib/history";
import { db } from "../../lib/db";
import { calculateCareerReadiness } from "../../utils/scoring";
import { useLiveQuery } from "dexie-react-hooks";
export function ProgressRecorder() {
  const { user } = useAuth();
  const { data } = useCareerData();
  const [progressError, setProgressError] = useState("");
  const [forecastError, setForecastError] = useState("");
  const [retry, setRetry] = useState(0);
  const [day, setDay] = useState(() => new Date().toISOString().slice(0, 10));
  useEffect(() => {
    const timer = window.setInterval(
      () => setDay(new Date().toISOString().slice(0, 10)),
      60000,
    );
    return () => window.clearInterval(timer);
  }, []);
  const forecasts = useLiveQuery(
    () => (user ? db.forecasts.where("userId").equals(user.id).toArray() : []),
    [user?.id],
  );
  const readiness = data
    ? calculateCareerReadiness(
        data.targets,
        data.experiments,
        data.skills,
        data.projects,
        data.tasks,
      )
    : null;
  const hasData = Boolean(
    data &&
      data.targets.length +
        data.experiments.length +
        data.skills.length +
        data.projects.length +
        data.tasks.length >
        0,
  );
  const signature = JSON.stringify(readiness);
  const forecastSignature = JSON.stringify(forecasts);
  useEffect(() => {
    if (!user || !hasData || !readiness) return;
    void saveDailyProgress(user.id, readiness, day)
      .then(() => setProgressError(""))
      .catch(() => setProgressError("Could not save progress history."));
  }, [user?.id, signature, hasData, day, retry]);
  useEffect(() => {
    if (!user || !forecasts?.length) return;
    void saveDailyForecasts(user.id, forecasts, day)
      .then(() => setForecastError(""))
      .catch(() => setForecastError("Could not save forecast history."));
  }, [user?.id, forecastSignature, day, retry]);
  const error = progressError || forecastError;
  return error ? (
    <div className="glass-card p-3 mb-4">
      <p role="alert">{error}</p>
      <button
        className="btn btn-secondary"
        onClick={() => setRetry((n) => n + 1)}
      >
        Retry history save
      </button>
    </div>
  ) : null;
}
