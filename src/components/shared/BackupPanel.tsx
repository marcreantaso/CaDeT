import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  exportBackup,
  parseBackup,
  restoreBackup,
  MAX_BACKUP_BYTES,
  type Backup,
} from "../../lib/backup";
export function BackupPanel() {
  const { user } = useAuth();
  const [pending, setPending] = useState<Backup | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function download() {
    if (!user || busy) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const backup = await exportBackup(user.id);
      const raw = JSON.stringify(backup, null, 2);
      if (new Blob([raw]).size > MAX_BACKUP_BYTES)
        throw new Error("This backup exceeds the current 5 MB restore limit.");
      const url = URL.createObjectURL(
        new Blob([raw], { type: "application/json" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = `cadet-backup-${backup.exportedAt.slice(0, 10)}.json`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage("Backup download started. Keep this file somewhere safe.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Export failed. Please retry.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function inspect(file?: File) {
    setPending(null);
    setError("");
    setMessage("");
    if (!file) return;
    setBusy(true);
    try {
      if (file.size > MAX_BACKUP_BYTES)
        throw new Error("Choose a JSON backup of 5 MB or smaller.");
      setPending(parseBackup(await file.text()));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid backup.");
    } finally {
      setBusy(false);
    }
  }
  async function restore() {
    if (!pending || !user || busy) return;
    setBusy(true);
    setError("");
    try {
      const result = await restoreBackup(pending, user.id);
      setMessage(
        `Restored ${result.added} records; kept ${result.skipped} existing records unchanged.`,
      );
      setPending(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Restore failed. Nothing was imported. Please retry.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <details className="glass-card p-5 backup-panel">
      <summary>Backup and restore</summary>
      <p className="text-sm mt-3">
        Export your career records, insights, forecasts, and history. Profile
        settings and ACTOR stage settings are not included. Restoring adds
        missing records and keeps existing records unchanged.
      </p>
      <div>
        <button
          className="btn btn-secondary"
          disabled={busy || !user}
          onClick={download}
        >
          {busy ? "Working…" : "Export backup"}
        </button>
        <label className="block">
          Choose backup (JSON, up to 5 MB)
          <input
            className="input-dark mt-2"
            type="file"
            accept="application/json,.json"
            disabled={busy}
            onChange={(event) => {
              void inspect(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
        </label>
      </div>
      {pending && (
        <div>
          <p>
            Ready to import{" "}
            {Object.values(pending.tables).reduce(
              (sum, rows) => sum + rows.length,
              0,
            )}{" "}
            records from {new Date(pending.exportedAt).toLocaleDateString()}.
          </p>
          <button className="btn btn-primary" disabled={busy} onClick={restore}>
            Import missing records
          </button>
          <button
            className="btn btn-ghost"
            disabled={busy}
            onClick={() => setPending(null)}
          >
            Cancel import
          </button>
        </div>
      )}
      {message && (
        <p role="status" className="mt-3">
          {message}
        </p>
      )}
      {error && (
        <p role="alert" className="form-error mt-3">
          {error}
        </p>
      )}
    </details>
  );
}
