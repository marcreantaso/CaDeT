import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { db } from "../lib/db";
import { aimOptions, choiceLabel } from "../lib/aim";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Beaker,
  Check,
  ChevronRight,
  GitBranch,
  Info,
  Route,
  Sparkles,
  Target,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { CAREER_PATH_BY_ID, CAREER_PATHS } from "../data/careerPaths";
import { useCareerDigitalTwin } from "../hooks/useCareerDigitalTwin";
import { createActorCareerExperiment } from "../lib/careerPlan";
import {
  calculateCareerAlignment,
  selectPrimaryPath,
  simulateCareerAlignment,
} from "../utils/careerAlignment";

export function CareerMapPage() {
  const { user } = useAuth();
  const aim = useLiveQuery(async () => user ? (await db.aim_plans.where("userId").equals(user.id).sortBy("createdAt")).at(-1) ?? null : null, [user?.id]);
  const unsupportedAim = !!aim && !CAREER_PATH_BY_ID[aim.input.role.id];
  const declaredRole = aim ? choiceLabel(aim.input.role, aimOptions(aim.input).roles) : null;
  const { data, error, isLoading, retry } = useCareerDigitalTwin();
  const [selectedPathId, setSelectedPathId] = useState<string | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [includeProject, setIncludeProject] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState("");

  const alignments = useMemo(
    () => (data ? CAREER_PATHS.map((path) => calculateCareerAlignment(path, data)) : []),
    [data],
  );
  const primaryPathId = useMemo(
    () => (data ? selectPrimaryPath(CAREER_PATHS, data) : CAREER_PATHS[0].id),
    [data],
  );
  const activePathId = selectedPathId ?? primaryPathId;
  const activePath = CAREER_PATH_BY_ID[activePathId] ?? CAREER_PATHS[0];
  const activeAlignment = alignments.find((alignment) => alignment.pathId === activePath.id);
  const displayedAlignments = useMemo(() => {
    const primary = alignments.find((alignment) => alignment.pathId === activePath.id);
    const adjacentIds = CAREER_PATH_BY_ID[activePath.id]?.adjacentPathIds ?? [];
    return [primary, ...adjacentIds.map((id) => alignments.find((item) => item.pathId === id))].filter(
      Boolean,
    ) as typeof alignments;
  }, [alignments, activePath.id]);
  const simulation = useMemo(
    () =>
      data
        ? simulateCareerAlignment(
            activePath,
            data,
            { skillNames: selectedSkills, includeProofProject: includeProject },
            user?.id,
          )
        : null,
    [activePath, data, includeProject, selectedSkills, user?.id],
  );

  function selectPath(pathId: string) {
    setSelectedPathId(pathId);
    setSelectedSkills([]);
    setIncludeProject(false);
    setMessage("");
    setActionError("");
  }

  function toggleSkill(skillName: string) {
    setSelectedSkills((current) =>
      current.includes(skillName)
        ? current.filter((name) => name !== skillName)
        : [...current, skillName],
    );
    setMessage("");
  }

  async function startExperiment() {
    if (!user || busy) return;
    setBusy(true);
    setActionError("");
    setMessage("");
    try {
      const result = await createActorCareerExperiment(
        user.id,
        activePath,
        selectedSkills,
        includeProject,
      );
      setMessage(
        `ACTOR TEST started: one 14-day experiment and ${result.taskCount} evidence task${result.taskCount === 1 ? "" : "s"} were created.`,
      );
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : "Could not start the experiment.");
    } finally {
      setBusy(false);
    }
  }

  if (isLoading) return <p role="status">Building your career model…</p>;
  if (error || !data || !activeAlignment || !simulation) {
    return (
      <div className="glass-card p-5">
        <p role="alert">{error || "Your career model is unavailable."}</p>
        <button className="btn btn-secondary mt-4" onClick={retry}>Retry</button>
      </div>
    );
  }

  const strongestFactor = [...activeAlignment.factors].sort((a, b) => b.contribution - a.contribution)[0];
  const evidenceCount = data.projects.filter((project) => project.status === "completed" && project.evidence.trim()).length;

  return (
    <div className="career-map-page">
      <motion.header initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="page-heading career-map-heading">
        <div>
          <p className="eyebrow">Career Digital Twin</p>
          <h1>Your current position and possible paths</h1>
          <p>Explore evidence alignment, simulate a change, then test it through ACTOR.</p>
        </div>
        <div className="model-label"><Info size={15} /> Alignment measures recorded evidence—not your chance of success.</div>
      </motion.header>

      {unsupportedAim && <section className="glass-card p-5 mb-5"><h2 className="font-semibold">Your chosen role is outside the scored catalogue</h2><p className="my-3">Your AIM direction is {declaredRole}. This simulator currently compares {CAREER_PATHS.length} example roles across several fields. The examples below do not classify your career direction. Your learning plan supports your chosen field.</p><Link className="btn btn-primary" to="/learning-plan">Open my learning plan</Link></section>}
      <section className="twin-summary" aria-label="Digital twin summary">
        <article className="glass-card twin-stat">
          <Target size={20} />
          <div><span>{unsupportedAim ? "Catalogue example" : "Model direction"}</span><strong>{CAREER_PATH_BY_ID[primaryPathId].title}</strong></div>
        </article>
        <article className="glass-card twin-stat">
          <Sparkles size={20} />
          <div><span>Current evidence match</span><strong>{alignments.find((item) => item.pathId === primaryPathId)?.score ?? 0}%</strong></div>
        </article>
        <article className="glass-card twin-stat">
          <GitBranch size={20} />
          <div><span>Documented proof</span><strong>{evidenceCount} project{evidenceCount === 1 ? "" : "s"}</strong></div>
        </article>
      </section>

      <section className="glass-card career-graph" aria-labelledby="career-graph-title">
        <div className="section-title-row">
          <div><p className="eyebrow">Career map</p><h2 id="career-graph-title">Explore fields and adjacent options</h2></div>
          <span className="badge badge-accent">Select a path to inspect it</span>
        </div>
        <label className="block mt-4">Explore any career area<select className="input-dark w-full mt-2" value={activePath.id} onChange={e => selectPath(e.target.value)}>{CAREER_PATHS.map(path => <option key={path.id} value={path.id}>{path.area} · {path.title}</option>)}</select></label>
        <div className="career-origin"><span>You</span><small>Skills + evidence + goals</small></div>
        <div className="career-connector" aria-hidden="true" />
        <div className="career-branches">
          {displayedAlignments.map((alignment, index) => (
            <button
              key={alignment.pathId}
              className={`career-node ${activePath.id === alignment.pathId ? "is-selected" : ""} ${index === 0 ? "is-primary" : ""}`}
              onClick={() => selectPath(alignment.pathId)}
              aria-pressed={activePath.id === alignment.pathId}
            >
              <span>{index === 0 ? "Exploring" : "What if?"}</span>
              <strong>{alignment.title}</strong>
              <b>{alignment.score}%</b>
              <small>current evidence match</small>
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          ))}
        </div>
      </section>

      <div className="career-detail-grid">
        <section className="glass-card alignment-panel" aria-labelledby="alignment-title">
          <div className="section-title-row">
            <div><p className="eyebrow">Explainable score</p><h2 id="alignment-title">Why {activeAlignment.score}%?</h2></div>
            <div className="alignment-score">{activeAlignment.score}<span>/100</span></div>
          </div>
          <p className="panel-copy">{activePath.summary}</p>
          <div className="factor-list">
            {activeAlignment.factors.map((item) => (
              <article key={item.key} className="factor-row">
                <div className="factor-heading"><strong>{item.label}</strong><span>{item.score}% × {item.weight}% = +{item.contribution}</span></div>
                <div className="progress-bar"><div className="progress-bar-fill" style={{ width: `${item.score}%` }} /></div>
                <p>{item.explanation}</p>
              </article>
            ))}
          </div>
          <div className="evidence-columns">
            <div><h3>Already strong</h3>{activeAlignment.strengths.length ? activeAlignment.strengths.map((item) => <p key={item}><Check size={14} /> {item}</p>) : <p>No core skill is near its target yet.</p>}</div>
            <div><h3>Highest-leverage gaps</h3>{activeAlignment.gaps.map((item) => <p key={item}><ArrowRight size={14} /> {item}</p>)}</div>
          </div>
          <p className="score-note">Strongest weighted contribution: {strongestFactor.label} (+{strongestFactor.contribution}). Scores update only when real records change.</p>
        </section>

        <section className="glass-card simulation-panel" aria-labelledby="simulation-title">
          <div><p className="eyebrow">What-if simulation</p><h2 id="simulation-title">Test a possible future</h2></div>
          <p className="panel-copy">Temporary changes do not modify your real Digital Twin.</p>
          <fieldset>
            <legend>Assume I build evidence for…</legend>
            <div className="simulation-options">
              {activeAlignment.gaps.map((skill) => (
                <label key={skill} className={selectedSkills.includes(skill) ? "is-checked" : ""}>
                  <input type="checkbox" checked={selectedSkills.includes(skill)} onChange={() => toggleSkill(skill)} />
                  <span>{skill}</span>
                </label>
              ))}
              <label className={includeProject ? "is-checked" : ""}>
                <input type="checkbox" checked={includeProject} onChange={(event) => { setIncludeProject(event.target.checked); setMessage(""); }} />
                <span>Complete proof project</span>
              </label>
            </div>
          </fieldset>
          <div className="simulation-result">
            <div><span>Current</span><strong>{simulation.baseline.score}%</strong></div>
            <ArrowRight size={20} />
            <div><span>Simulated</span><strong>{simulation.simulated.score}%</strong></div>
            <b className={simulation.delta > 0 ? "is-positive" : ""}>+{simulation.delta}</b>
          </div>
          <div className="simulation-disclaimer"><Beaker size={16} /><p>This shows how the transparent alignment model would change. It is not a job forecast, guarantee, or automatic real score.</p></div>
          <div className="actor-handoff">
            <Route size={19} />
            <div><strong>Convert simulation into ACTOR TEST</strong><p>Creates a 14-day experiment and evidence tasks, then moves the loop to TEST.</p></div>
          </div>
          <button className="btn btn-primary w-full" disabled={busy || (!selectedSkills.length && !includeProject)} onClick={startExperiment}>
            {busy ? "Creating experiment…" : "Start this ACTOR experiment"}
          </button>
          {message && <p role="status" className="form-success">{message}</p>}
          {actionError && <p role="alert" className="form-error">{actionError}</p>}
        </section>
      </div>
    </div>
  );
}
