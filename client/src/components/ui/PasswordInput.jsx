import { useState } from "react";
import { LockIcon, EyeIcon, EyeOffIcon } from "./Icons";

/**
 * PasswordInput — labeled password field with LockIcon prefix and show/hide toggle.
 *
 * Props:
 *   id            string   — input id (must match label htmlFor)
 *   label         string   — optional label text rendered above the input
 *   value         string
 *   onChange      fn(e)
 *   placeholder   string   — optional placeholder
 *   autoComplete  string   — e.g. "current-password", "new-password"
 */
export default function PasswordInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      {label ? (
        <label htmlFor={id} className="field-label mb-1.5 block">
          {label}
        </label>
      ) : null}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-label-3 pointer-events-none">
          <LockIcon className="size-4" />
        </span>
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="input-base pl-9 pr-10"
          required
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-label-3 hover:text-label-2 transition-colors"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </div>
  );
}
