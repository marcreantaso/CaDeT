import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { ThemeToggle } from "../components/shared/ThemeToggle";
import { BrandLogo } from "../components/shared/BrandLogo";
import { ChoiceField } from "../components/shared/ChoiceField";
import { useAuth } from "../contexts/AuthContext";
import {
  FIELDS,
  STATUSES,
  EXPERIENCE,
  OUTCOMES,
  VALUES,
  ENVIRONMENTS,
  FORMATS,
  SUPPORT,
  CATEGORY_OPTIONS,
  LEVEL_OPTIONS,
} from "../data/aimCatalog";
import {
  aimOptions,
  aimSummary,
  blankChoice,
  emptyAim,
  learningModules,
  saveAim,
  validateAim,
} from "../lib/aim";
import { db } from "../lib/db";
import type { AimInput, Choice } from "../types/aim";
import type { SkillCategory, SkillLevel } from "../types/skills";

const STEPS = [
  "Your starting point",
  "Find your direction",
  "Define the outcome",
  "Skill baseline",
  "Learning & support",
  "Review your AIM",
];
export function OnboardingPage({ editing = false }: { editing?: boolean }) {
  const { user } = useAuth();
  const saved = useLiveQuery(
    async () =>
      user
        ? ((
            await db.aim_plans
              .where("userId")
              .equals(user.id)
              .sortBy("createdAt")
          ).at(-1) ?? null)
        : null,
    [user?.id],
  );
  if (saved === undefined)
    return (
      <p role="status" className="p-6">
        Loading your AIM profile…
      </p>
    );
  return (
    <AimWizard
      key={user?.id}
      initial={saved?.input ?? emptyAim()}
      editing={editing}
    />
  );
}
function AimWizard({
  initial,
  editing,
}: {
  initial: AimInput;
  editing: boolean;
}) {
  const { user } = useAuth(),
    navigate = useNavigate();
  const [input, setInput] = useState(initial),
    [step, setStep] = useState(0),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [skill, setSkill] = useState<Choice>(blankChoice()),
    [category, setCategory] = useState<SkillCategory>("domain"),
    [level, setLevel] = useState<SkillLevel>("beginner");
  const heading = useRef<HTMLHeadingElement>(null),
    saving = useRef(false);
  const { specializations, roles, specialization } = aimOptions(input);
  useEffect(() => {
    heading.current?.focus();
  }, [step]);
  function change<K extends keyof AimInput>(key: K, value: AimInput[K]) {
    setInput((old) => ({ ...old, [key]: value }));
    setError("");
  }
  function direction(key: "field" | "specialization", value: Choice) {
    setInput((old) => ({
      ...old,
      [key]: value,
      ...(key === "field"
        ? {
            specialization:
              value.id === "exploring"
                ? { id: "exploring", other: "" }
                : blankChoice(),
          }
        : {}),
      role:
        value.id === "exploring"
          ? { id: "exploring", other: "" }
          : blankChoice(),
    }));
    setSkill(blankChoice());
    setError("");
  }
  function addSkill() {
    const name = (skill.id === "other" ? skill.other : skill.id).trim();
    if (!name) {
      setError("Choose a skill or specify Other.");
      return;
    }
    if (name.length > 100) {
      setError("Keep skill names under 100 characters.");
      return;
    }
    if (input.skills.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
      setError("That skill is already in your baseline.");
      return;
    }
    if (input.skills.length >= 8) {
      setError("Choose up to eight baseline skills.");
      return;
    }
    change("skills", [...input.skills, { name, category, level }]);
    setSkill(blankChoice());
  }
  async function next() {
    if (step === 3 && skill.id) {
      setError(
        "Add your selected skill to the baseline, or clear the selection before continuing.",
      );
      return;
    }
    const errors = validateAim(input, step === 5 ? undefined : step);
    if (errors.length) {
      setError(errors[0]);
      return;
    }
    if (step < 5) {
      setStep(step + 1);
      setError("");
      return;
    }
    if (!user || saving.current) return;
    saving.current = true;
    setBusy(true);
    setError("");
    try {
      await saveAim(user.id, input);
      navigate("/learning-plan", { replace: true });
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not save. Your previous records are unchanged.",
      );
    } finally {
      saving.current = false;
      setBusy(false);
    }
  }
  const field = (
    key:
      | "status"
      | "experience"
      | "outcome"
      | "value"
      | "environment"
      | "format"
      | "support",
    label: string,
    options: typeof STATUSES,
  ) => (
    <ChoiceField
      label={label}
      value={input[key]}
      options={options}
      onChange={(value) => change(key, value)}
    />
  );
  return (
    <div className="aim-layout">
      <aside className="aim-sidebar">
        <div className="flex items-center justify-between gap-3">
          <BrandLogo />
          <ThemeToggle />
        </div>
        <p className="eyebrow mt-6">ACTOR · AIM</p>
        <h1 className="text-xl font-semibold mt-2">
          A direction you can act on
        </h1>
        <p className="text-sm mt-3">
          Start broad, narrow your goal, and choose a realistic first step.
        </p>
        <ol className="aim-steps" aria-label="Setup progress">
          {STEPS.map((title, index) => (
            <li key={title} aria-current={index === step ? "step" : undefined}>
              <span aria-hidden="true">
                {index < step ? <Check size={15} /> : index + 1}
              </span>
              {title}
            </li>
          ))}
        </ol>
        {editing && (
          <Link to="/learning-plan" className="btn btn-secondary">
            Cancel and return
          </Link>
        )}
      </aside>
      <main className="aim-main">
        <form
          className="aim-form"
          onSubmit={(e) => {
            e.preventDefault();
            void next();
          }}
        >
          <p className="eyebrow">
            Step {step + 1} of {STEPS.length}
          </p>
          <h2
            ref={heading}
            tabIndex={-1}
            className="text-2xl font-semibold mt-2 mb-5"
          >
            {STEPS[step]}
          </h2>
          <fieldset disabled={busy} className="space-y-5">
            {step === 0 && (
              <>
                {field("status", "Current status", STATUSES)}
                {field("experience", "Professional experience", EXPERIENCE)}
                <p className="aim-help">
                  New to career planning? You can start without any professional
                  experience or recorded skills.
                </p>
              </>
            )}
            {step === 1 && (
              <>
                <ChoiceField
                  label="Career field"
                  options={FIELDS}
                  value={input.field}
                  onChange={(v) => direction("field", v)}
                  exploring
                />
                <ChoiceField
                  label="Specialization"
                  options={specializations}
                  value={input.specialization}
                  onChange={(v) => direction("specialization", v)}
                  exploring
                  disabled={!input.field.id || input.field.id === "exploring"}
                />
                <ChoiceField
                  label="Target role"
                  options={roles}
                  value={input.role}
                  onChange={(v) => change("role", v)}
                  exploring
                  disabled={
                    !input.specialization.id ||
                    input.specialization.id === "exploring"
                  }
                />
                <p className="aim-help">
                  Changing a field resets its specialization and role. Other
                  keeps your own wording; “Not sure yet” creates an exploration
                  plan.
                </p>
              </>
            )}
            {step === 2 && (
              <>
                {field("outcome", "What do you want to achieve?", OUTCOMES)}
                {field("value", "What matters most to you?", VALUES)}
                {field(
                  "environment",
                  "Preferred work environment",
                  ENVIRONMENTS,
                )}
                <div className="aim-field">
                  <label htmlFor="milestone">One observable output</label>
                  <textarea
                    id="milestone"
                    required
                    maxLength={500}
                    className="input-dark w-full"
                    rows={3}
                    placeholder="For example: create three portfolio pieces and record feedback on each."
                    value={input.milestone}
                    onChange={(e) => change("milestone", e.target.value)}
                  />
                  <p className="aim-help">
                    Include a deliverable and a quantity or quality check. You
                    will refine this in COMPRESS.
                  </p>
                </div>
                <div className="aim-field">
                  <label htmlFor="weeks">Timeline</label>
                  <select
                    id="weeks"
                    className="input-dark"
                    value={input.weeks}
                    onChange={(e) => change("weeks", Number(e.target.value))}
                  >
                    {[2, 4, 8, 12].map((n) => (
                      <option key={n} value={n}>
                        {n} weeks
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
            {step === 3 && (
              <>
                <p className="aim-help">
                  Add up to eight skills, or continue with none. Levels are
                  self-assessments: beginner 25, intermediate 50, advanced 75,
                  expert 100. They do not count as verified evidence.
                </p>
                <ChoiceField
                  label="Skill to add (optional)"
                  value={skill}
                  options={[
                    ...new Set([
                      ...(specialization?.skills ?? []),
                      "Communication",
                      "Teamwork",
                      "Problem solving",
                    ]),
                  ].map((name) => ({ id: name, label: name }))}
                  onChange={setSkill}
                />
                <div className="aim-columns">
                  <ChoiceField
                    label="Skill category"
                    value={{ id: category, other: "" }}
                    options={CATEGORY_OPTIONS}
                    allowOther={false}
                    onChange={(v) => setCategory(v.id as SkillCategory)}
                  />
                  <ChoiceField
                    label="Self-assessed level"
                    value={{ id: level, other: "" }}
                    options={LEVEL_OPTIONS}
                    allowOther={false}
                    onChange={(v) => setLevel(v.id as SkillLevel)}
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={addSkill}
                >
                  Add skill to baseline
                </button>
                {skill.id && (
                  <button
                    type="button"
                    className="btn btn-secondary ml-2"
                    onClick={() => {
                      setSkill(blankChoice());
                      setError("");
                    }}
                  >
                    Clear selection
                  </button>
                )}
                <ul className="space-y-2">
                  {input.skills.map((s) => (
                    <li className="aim-skill" key={s.name}>
                      <span>
                        <strong>{s.name}</strong>
                        <small>
                          {s.category} · {s.level}
                        </small>
                      </span>
                      <button
                        className="btn btn-secondary"
                        type="button"
                        aria-label={`Remove ${s.name}`}
                        onClick={() =>
                          change(
                            "skills",
                            input.skills.filter((x) => x.name !== s.name),
                          )
                        }
                      >
                        <X size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
            {step === 4 && (
              <>
                <div className="aim-field">
                  <label htmlFor="hours">Learning hours per week</label>
                  <select
                    id="hours"
                    className="input-dark"
                    value={input.hoursPerWeek}
                    onChange={(e) =>
                      change("hoursPerWeek", Number(e.target.value))
                    }
                  >
                    {[2, 5, 10, 15].map((n) => (
                      <option key={n} value={n}>
                        {n} hours
                      </option>
                    ))}
                  </select>
                </div>
                {field("format", "Preferred learning format", FORMATS)}
                {field("support", "Preferred support", SUPPORT)}
                <div className="aim-columns">
                  <div className="aim-field">
                    <label htmlFor="school">
                      School / organization (optional)
                    </label>
                    <input
                      id="school"
                      className="input-dark w-full"
                      maxLength={120}
                      value={input.school}
                      onChange={(e) => change("school", e.target.value)}
                    />
                  </div>
                  <div className="aim-field">
                    <label htmlFor="city">City / province (optional)</label>
                    <input
                      id="city"
                      className="input-dark w-full"
                      maxLength={120}
                      value={input.location}
                      onChange={(e) => change("location", e.target.value)}
                    />
                  </div>
                </div>
                <p className="aim-help">
                  Use a school and city name only. We do not need your address.
                  These preferences stay on this device; no community receives
                  them automatically.
                </p>
              </>
            )}
            {step === 5 && (
              <>
                <section className="glass-card p-5 space-y-3">
                  <h3 className="font-semibold">Your starting plan</h3>
                  <p>{aimSummary(input)}</p>
                  <p>
                    {input.hoursPerWeek} hours/week · {input.skills.length}{" "}
                    baseline skills
                  </p>
                  <ol className="list-decimal pl-5 space-y-3">
                    {learningModules(input).map((m) => (
                      <li key={m.title}>{m.title}</li>
                    ))}
                  </ol>
                </section>
                <p className="aim-help">
                  These are rule-based starter suggestions. Saving creates
                  categorized goals, a target and four pending tasks. It does
                  not award evidence or claim you are job-ready.
                  {editing &&
                    " Your previous tasks and targets will be kept; this becomes your active target."}
                </p>
              </>
            )}
          </fieldset>
          {error && (
            <p role="alert" className="form-error mt-4">
              {error}
            </p>
          )}
          <div className="flex flex-wrap gap-3 mt-6">
            <button
              type="button"
              className="btn btn-secondary"
              disabled={step === 0 || busy}
              onClick={() => {
                setStep(step - 1);
                setError("");
              }}
            >
              <ArrowLeft size={16} /> Back
            </button>
            <button
              type="submit"
              formNoValidate
              className="btn btn-primary"
              disabled={busy}
            >
              {busy
                ? "Saving…"
                : step === 5
                  ? "Save AIM & open learning plan"
                  : "Continue"}
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
