import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import { db } from "../lib/db";
import { useAuth } from "../contexts/AuthContext";

export function useCareerData() {
  const { user } = useAuth();
  const [attempt, setAttempt] = useState(0);
  const result = useLiveQuery(async () => {
    if (!user) return null;
    try {
      // Score and recommendation inputs come from one consistent database snapshot.
      return await db.transaction(
        "r",
        [
          db.skills,
          db.tasks,
          db.projects,
          db.experiments,
          db.career_targets,
          db.career_goals,
        ],
        async () => {
          const [skills, tasks, projects, experiments, targets, goals] =
            await Promise.all([
              db.skills.where("userId").equals(user.id).toArray(),
              db.tasks.where("userId").equals(user.id).toArray(),
              db.projects.where("userId").equals(user.id).toArray(),
              db.experiments.where("userId").equals(user.id).toArray(),
              db.career_targets.where("userId").equals(user.id).toArray(),
              db.career_goals.where("userId").equals(user.id).toArray(),
            ]);
          return {
            data: { skills, tasks, projects, experiments, targets, goals },
            error: "",
          };
        },
      );
    } catch {
      return {
        data: null,
        error: "Could not read your career records. Please retry.",
      };
    }
  }, [user?.id, attempt]);
  return {
    data: result?.data,
    error: result?.error,
    isLoading: result === undefined,
    retry: () => setAttempt((value) => value + 1),
  };
}
