import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Plus, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  recordFields,
  recordKinds,
  recordLabels,
  saveRecord,
  type RecordKind,
} from "../../lib/records";

interface QuickAddModalProps {
  open: boolean;
  onClose: () => void;
  onCloseAutoFocus: () => void;
}
export function QuickAddModal({
  open,
  onClose,
  onCloseAutoFocus,
}: QuickAddModalProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [kind, setKind] = useState<RecordKind | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const close = () => {
    if (!saving) {
      onClose();
      setKind(null);
      setValues({});
      setError("");
      setSaved(false);
    }
  };
  const selectKind = (next: RecordKind) => {
    setKind(next);
    setValues({});
    setError("");
    setSaved(false);
  };
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!kind || !user || saving) return;
    setSaving(true);
    setError("");
    try {
      await saveRecord(kind, values, user.id);
      setSaved(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not save. Your entries are kept; please try again.",
      );
    } finally {
      setSaving(false);
    }
  }
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(value) => {
        if (!value) close();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content
          className="quick-add-dialog"
          onEscapeKeyDown={(event) => {
            if (saving) event.preventDefault();
          }}
          onPointerDownOutside={(event) => {
            if (saving) event.preventDefault();
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            onCloseAutoFocus();
          }}
        >
          <div className="dialog-heading">
            <div>
              <Dialog.Title>
                {kind ? `Add ${recordLabels[kind].toLowerCase()}` : "Quick add"}
              </Dialog.Title>
              <Dialog.Description>
                {saved
                  ? "Saved to this device."
                  : "Track the work that moves your career forward."}
              </Dialog.Description>
            </div>
            <button
              type="button"
              className="btn btn-icon btn-ghost"
              onClick={close}
              disabled={saving}
              aria-label="Close quick add"
            >
              <X size={20} />
            </button>
          </div>
          {!kind ? (
            <div className="quick-add-grid">
              {recordKinds.map((item) => (
                <button
                  type="button"
                  className="quick-add-option"
                  key={item}
                  onClick={() => selectKind(item)}
                >
                  <Plus size={20} />
                  <strong>{recordLabels[item]}</strong>
                </button>
              ))}
            </div>
          ) : saved ? (
            <div className="space-y-4">
              <p role="status">
                {recordLabels[kind]} saved successfully. Your dashboard updates
                automatically.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => {
                  const destination =
                    kind === "skill" ? "/skills" : `/records?kind=${kind}`;
                  close();
                  navigate(destination);
                }}
              >
                View saved records
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => selectKind(kind)}
              >
                Add another
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4" aria-busy={saving}>
              <button
                type="button"
                className="btn btn-ghost"
                disabled={saving}
                onClick={() => {
                  setKind(null);
                  setValues({});
                  setError("");
                }}
              >
                <ArrowLeft size={16} />
                Choose another type
              </button>
              {kind === "target" && (
                <p className="text-sm">
                  Saving a target makes it your active target. Existing targets
                  stay in your records.
                </p>
              )}
              {recordFields[kind].map((field) => (
                <div key={field.key}>
                  <label className="block mb-1" htmlFor={`record-${field.key}`}>
                    {field.label}
                  </label>
                  {field.options ? (
                    <select
                      id={`record-${field.key}`}
                      className="input-dark"
                      disabled={saving}
                      value={values[field.key] ?? field.options[0]}
                      onChange={(event) =>
                        setValues((prev) => ({
                          ...prev,
                          [field.key]: event.target.value,
                        }))
                      }
                    >
                      {field.options.map((option) => (
                        <option key={option} value={option}>
                          {option.replaceAll("_", " ")}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "textarea" ? (
                    <textarea
                      id={`record-${field.key}`}
                      className="input-dark"
                      rows={3}
                      maxLength={10000}
                      required={field.required}
                      disabled={saving}
                      value={values[field.key] ?? ""}
                      onChange={(event) =>
                        setValues((prev) => ({
                          ...prev,
                          [field.key]: event.target.value,
                        }))
                      }
                    />
                  ) : (
                    <input
                      id={`record-${field.key}`}
                      className="input-dark"
                      type={field.type ?? "text"}
                      min={field.min}
                      max={field.max}
                      maxLength={10000}
                      required={field.required || field.type === "number"}
                      disabled={saving}
                      value={values[field.key] ?? field.value ?? ""}
                      onChange={(event) =>
                        setValues((prev) => ({
                          ...prev,
                          [field.key]: event.target.value,
                        }))
                      }
                    />
                  )}
                </div>
              ))}
              {error && (
                <p role="alert" className="form-error">
                  {error}
                </p>
              )}
              <button
                className="btn btn-primary w-full"
                type="submit"
                disabled={saving || !user}
              >
                {saving
                  ? "Saving…"
                  : error
                    ? "Retry save"
                    : `Save ${recordLabels[kind].toLowerCase()}`}
              </button>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
