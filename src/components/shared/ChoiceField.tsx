import { useId } from "react";
import type { Choice } from "../../types/aim";
import { OTHER, EXPLORING, type Option } from "../../data/aimCatalog";
export function ChoiceField({
  label,
  value,
  options,
  onChange,
  exploring = false,
  allowOther = true,
  disabled = false,
}: {
  label: string;
  value: Choice;
  options: Option[];
  onChange: (value: Choice) => void;
  exploring?: boolean;
  allowOther?: boolean;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div className="aim-field">
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        className="input-dark w-full"
        value={value.id}
        disabled={disabled}
        required
        onChange={(e) => onChange({ id: e.target.value, other: "" })}
      >
        <option value="" disabled>
          Select an option
        </option>
        {options.map((item) => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
        {exploring && <option value={EXPLORING.id}>{EXPLORING.label}</option>}
        {allowOther && <option value={OTHER.id}>{OTHER.label}</option>}
      </select>
      {value.id === "other" && (
        <>
          <label className="text-sm" htmlFor={`${id}-other`}>
            Specify {label.toLowerCase()}
          </label>
          <input
            id={`${id}-other`}
            className="input-dark w-full"
            maxLength={120}
            required
            value={value.other}
            onChange={(e) => onChange({ id: "other", other: e.target.value })}
          />
        </>
      )}
    </div>
  );
}
