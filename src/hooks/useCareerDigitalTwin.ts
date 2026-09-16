import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../lib/db";
import type { CareerTwinInput } from "../types/career-path";

export function useCareerDigitalTwin() {
  const { user } = useAuth();
  const [attempt, setAttempt] = useState(0);
  const result = useLiveQuery(async () => {
    if (!user) return null;
    try {
      const data = await db.transaction(
        "r",
        [
          db.skills,
          db.projects,
          db.experiments,
          db.experiences,
          db.career_goals,
          db.career_targets,
          db.actor_states,
        ],
        async (): Promise<CareerTwinInput> => {
          const [skills, projects, experiments, experiences, goals, targets, actorState] =
            await Promise.all([
              db.skills.where("userId").equals(user.id).toArray(),
              db.projects.where("userId").equals(user.id).toArray(),
              db.experiments.where("userId").equals(user.id).toArray(),
              db.experiences.where("userId").equals(user.id).toArray(),
              db.career_goals.where("userId").equals(user.id).toArray(),
              db.career_targets.where("userId").equals(user.id).toArray(),
              db.actor_states.where("userId").equals(user.id).first(),
            ]);
          return {
            skills,
            projects,
            experiments,
            experiences,
            goals,
            targets,
            actorState: actorState ?? null,
          };
        },
      );
      return { data, error: "" };
    } catch {
      return { data: null, error: "Could not build your career model. Please retry." };
    }
  }, [user?.id, attempt]);

  return {
    data: result?.data ?? null,
    error: result?.error ?? "",
    isLoading: result === undefined,
    retry: () => setAttempt((value) => value + 1),
  };
}
