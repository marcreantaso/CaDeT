import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../lib/db";
import { updateRecord } from "../lib/records";
import { resourcesForAim, supportSuggestion } from "../data/learningResources";
export function LearningPlanPage() {
  const { user } = useAuth();
  const [error, setError] = useState(""),
    [busy, setBusy] = useState("");
  const data = useLiveQuery(async () => {
    if (!user) return null;
    try {
      const plan = (
        await db.aim_plans.where("userId").equals(user.id).sortBy("createdAt")
      ).at(-1);
      if (!plan) return { plan: null, tasks: [], error: "" };
      const tasks = await db.tasks.bulkGet(plan.taskIds);
      return {
        plan,
        tasks: tasks.filter((t) => t && t.userId === user.id),
        error: "",
      };
    } catch {
      return {
        plan: null,
        tasks: [],
        error: "Could not load your plan. Reload to try again.",
      };
    }
  }, [user?.id]);
  if (data === undefined)
    return <p role="status">Loading your learning plan…</p>;
  if (data?.error) return <p role="alert">{data.error}</p>;
  if (!data?.plan)
    return (
      <section className="glass-card p-6 space-y-4">
        <h1 className="text-2xl">Build your AIM profile</h1>
        <p>
          Choose your field, role, baseline, and learning preferences to create
          a practical starting plan.
        </p>
        <Link to="/aim" className="btn btn-primary">
          Set up AIM
        </Link>
      </section>
    );
  const { plan, tasks } = data;
  const done = tasks.filter((t) => t?.status === "completed").length;
  const percent = Math.round((done / plan.taskIds.length) * 100);
  const support = supportSuggestion(plan.input);
  async function toggle(id: string, completed: boolean) {
    if (!user || busy) return;
    setBusy(id);
    setError("");
    try {
      await updateRecord(
        "task",
        id,
        { status: completed ? "pending" : "completed" },
        user.id,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update the task.");
    } finally {
      setBusy("");
    }
  }
  return (
    <div className="space-y-5">
      <header className="page-heading">
        <p className="eyebrow">AIM → action</p>
        <h1>Your learning plan</h1>
        <p>{plan.summary}</p>
      </header>
      <div className="flex flex-wrap gap-3">
        <Link to="/aim" className="btn btn-secondary">
          Revisit AIM
        </Link>
        <Link to="/journey" className="btn btn-secondary">
          Open ACTOR journey
        </Link>
        <Link to="/records?kind=project" className="btn btn-secondary">
          Record project evidence
        </Link>
      </div>
      <section className="glass-card p-5 space-y-3" aria-label="Plan progress">
        <h2 className="text-xl">
          {done} of {plan.taskIds.length} learning actions complete
        </h2>
        <progress
          className="w-full"
          value={percent}
          max={100}
          aria-label="Learning actions completed"
        >
          {percent}%
        </progress>
        <p className="aim-help">
          Rule-based plan · {plan.input.hoursPerWeek} hours/week ·{" "}
          {plan.input.weeks} weeks. Progress reflects tasks you mark complete;
          skill evidence is tracked separately.
        </p>
        {done === plan.taskIds.length && (
          <p className="badge badge-success">
            Milestone: first learning cycle completed · self-reported
          </p>
        )}
      </section>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <ol className="space-y-3">
        {tasks.map(
          (task, index) =>
            task && (
              <li key={task.id} className="glass-card p-5 learning-card">
                <p className="eyebrow">
                  Module {index + 1} · due {task.dueDate}
                </p>
                <h2 className="text-lg font-semibold mt-2">{task.title}</h2>
                <p className="aim-help my-3">{task.reason}</p>
                <button
                  className="btn btn-secondary"
                  disabled={!!busy}
                  aria-pressed={task.status === "completed"}
                  onClick={() =>
                    void toggle(task.id, task.status === "completed")
                  }
                >
                  {busy === task.id
                    ? "Saving…"
                    : task.status === "completed"
                      ? "Completed — undo"
                      : "Mark action complete"}
                </button>
              </li>
            ),
        )}
      </ol>
      {tasks.length < plan.taskIds.length && (
        <p role="status">
          Some linked tasks are missing. Restore the matching backup or revisit
          AIM to create a new plan.
        </p>
      )}
      <section className="glass-card p-5 space-y-4">
        <h2 className="text-xl">Learning resources</h2>
        <p className="aim-help">
          Selected by your field and specialization. These are curated starting
          points, not AI-ranked courses. External learning needs an internet
          connection; availability and sign-up requirements vary.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resourcesForAim(plan.input).map((r) => (
            <article key={r.id}>
              <a
                className="underline font-semibold"
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {r.title} ↗
              </a>
              <p className="aim-help mt-1">{r.description}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="glass-card p-5 space-y-3">
        <h2 className="text-xl">Community & accountability</h2>
        <h3 className="font-semibold">{support.title}</h3>
        <p className="aim-help">{support.description}</p>
        {"url" in support && support.url && (
          <a
            className="btn btn-secondary"
            href={support.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Explore community directory ↗
          </a>
        )}
        <p className="aim-help">
          No verified partner directory is connected yet. No introduction or
          message has been sent.
        </p>
        <Link className="btn btn-secondary" to="/records?kind=reflection">
          Record feedback or reflection
        </Link>
      </section>
    </div>
  );
}
