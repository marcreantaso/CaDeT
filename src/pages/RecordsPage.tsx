import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useSearchParams } from "react-router-dom";
import { db } from "../lib/db";
import { useAuth } from "../contexts/AuthContext";
import {
  recordKinds,
  recordLabels,
  recordTables,
  statusOptions,
  updateRecord,
  type RecordKind,
} from "../lib/records";
import { BackupPanel } from "../components/shared/BackupPanel";
type Row = Record<string, unknown> & { id: string; updatedAt?: string };
function RecordCard({ row, kind }: { row: Row; kind: RecordKind }) {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || busy) return;
    const values = Object.fromEntries(
      new FormData(event.currentTarget).entries(),
    );
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await updateRecord(kind, row.id, values, user.id);
      setMessage("Changes saved.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not save. Please retry.",
      );
    } finally {
      setBusy(false);
    }
  }
  const title = String(
    row.title ??
      row.skillName ??
      row.compressedTarget ??
      row.hypothesis ??
      "Reflection",
  );
  const description = String(
    row.description ?? row.content ?? row.reason ?? row.experiment ?? "",
  );
  return (
    <article id={`record-${row.id}`} className="glass-card p-5 record-card">
      <header>
        <h2 className="text-lg">{title}</h2>
        <span className="badge badge-accent">
          {String(
            row.status ??
              row.level ??
              row.type ??
              row.category ??
              recordLabels[kind],
          ).replaceAll("_", " ")}
        </span>
      </header>
      {description && <p className="text-sm mt-3">{description}</p>}
      {kind === "target" && (
        <p className="text-sm mt-3">
          {row.isActive ? "Active target" : "Saved target"} ·{" "}
          {String(row.overallClarity)}% self-assessed clarity
        </p>
      )}
      {[
        "organization",
        "startDate",
        "endDate",
        "dateEarned",
        "dueDate",
        "timeline",
        "evidence",
      ].map((field) =>
        row[field] ? (
          <p key={field} className="text-sm mt-2">
            <strong>
              {
                (
                  {
                    organization: "Organization",
                    startDate: "Start",
                    endDate: "End",
                    dateEarned: "Earned",
                    dueDate: "Due",
                    timeline: "Timeline",
                    evidence: "Evidence",
                  } as Record<string, string>
                )[field]
              }
              :{" "}
            </strong>
            {String(row[field])}
          </p>
        ) : null,
      )}
      {Array.isArray(row.skills) && row.skills.length > 0 && (
        <p className="text-sm mt-2">Skills: {row.skills.join(", ")}</p>
      )}
      {(statusOptions[kind] ||
        kind === "skill" ||
        (kind === "target" && !row.isActive)) && (
        <form className="record-controls" onSubmit={submit} aria-busy={busy}>
          {kind === "skill" ? (
            <>
              <label>
                Confidence (0–100)
                <input
                  name="confidence"
                  type="number"
                  min={0}
                  max={100}
                  required
                  className="input-dark"
                  defaultValue={Number(row.confidence)}
                  disabled={busy}
                />
              </label>
              <label>
                Level
                <select
                  name="level"
                  className="input-dark"
                  defaultValue={String(row.level)}
                  disabled={busy}
                >
                  {["beginner", "intermediate", "advanced", "expert"].map(
                    (value) => (
                      <option key={value}>{value}</option>
                    ),
                  )}
                </select>
              </label>
            </>
          ) : statusOptions[kind] ? (
            <label>
              Status
              <select
                name="status"
                className="input-dark"
                defaultValue={String(row.status)}
                disabled={busy}
              >
                {statusOptions[kind]!.map((value) => (
                  <option key={value} value={value}>
                    {value.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          {kind === "experiment" && (
            <fieldset className="w-full">
              <legend className="text-sm mb-2">
                Optional experiment ratings (complete all five, 1–10)
              </legend>
              <div className="record-controls">
                {[
                  "interest",
                  "enjoyment",
                  "difficulty",
                  "confidence",
                  "performance",
                ].map((key) => (
                  <label key={key}>
                    {key[0].toUpperCase() + key.slice(1)}
                    <input
                      className="input-dark"
                      type="number"
                      name={key}
                      min={1}
                      max={10}
                      disabled={busy}
                      defaultValue={
                        (row.scores as Record<string, number> | null)?.[key] ??
                        ""
                      }
                    />
                  </label>
                ))}
              </div>
              <label className="flex items-center gap-2 mt-3">
                <input
                  type="checkbox"
                  name="wouldRepeat"
                  disabled={busy}
                  defaultChecked={Boolean(
                    (row.scores as Record<string, unknown> | null)?.wouldRepeat,
                  )}
                />
                I would repeat this experiment
              </label>
            </fieldset>
          )}
          <button className="btn btn-secondary" disabled={busy} type="submit">
            {busy
              ? "Saving…"
              : kind === "target"
                ? "Make active target"
                : "Save changes"}
          </button>
        </form>
      )}
      {message && (
        <p role="status" className="text-sm mt-3">
          {message}
        </p>
      )}
      {error && (
        <p role="alert" className="form-error mt-3">
          {error}
        </p>
      )}
    </article>
  );
}
export function RecordsPage() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const requested = params.get("kind") as RecordKind;
  const kind = recordKinds.includes(requested) ? requested : "goal";
  const [retry, setRetry] = useState(0);
  const result = useLiveQuery(async () => {
    if (!user) return { rows: [] as Row[], error: "" };
    try {
      return {
        rows: (await db
          .table(recordTables[kind])
          .where("userId")
          .equals(user.id)
          .reverse()
          .sortBy("createdAt")) as Row[],
        error: "",
      };
    } catch {
      return { rows: [], error: "Could not load your records." };
    }
  }, [user?.id, kind, retry]);
  return (
    <div className="space-y-5">
      <div className="page-heading">
        <h1>Your records</h1>
        <p>Review your saved work. Use Quick add to create a record.</p>
      </div>
      <BackupPanel />
      <label className="block max-w-sm">
        Record type
        <select
          className="input-dark mt-2"
          value={kind}
          onChange={(event) => setParams({ kind: event.target.value })}
        >
          {recordKinds.map((value) => (
            <option key={value} value={value}>
              {recordLabels[value]}
            </option>
          ))}
        </select>
      </label>
      {!result ? (
        <p role="status">Loading records…</p>
      ) : result.error ? (
        <div>
          <p role="alert">{result.error}</p>
          <button
            className="btn btn-secondary"
            onClick={() => setRetry((n) => n + 1)}
          >
            Retry
          </button>
        </div>
      ) : !result.rows.length ? (
        <div className="glass-card p-5">
          <h2 className="text-lg mb-2">
            No {recordLabels[kind].toLowerCase()} records yet
          </h2>
          <p>
            Choose Quick add, then {recordLabels[kind].toLowerCase()}, to save
            your first record.
          </p>
        </div>
      ) : (
        <div className="record-list">
          {result.rows.map((row) => (
            <RecordCard key={`${kind}:${row.id}`} kind={kind} row={row} />
          ))}
        </div>
      )}
    </div>
  );
}
