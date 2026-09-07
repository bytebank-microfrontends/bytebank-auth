import { useState } from "react";

export interface PasswordFieldProps {
  describedBy?: string;
  error?: string;
  id: string;
  label: string;
  onChange: (value: string) => void;
  value: string;
}

export default function PasswordField({
  describedBy,
  error,
  id,
  label,
  onChange,
  value,
}: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);
  const buttonLabel = isVisible ? "Ocultar senha" : "Mostrar senha";

  return (
    <div className="bb-auth-field">
      <label className="bb-auth-field__label" htmlFor={id}>
        {label}
      </label>
      <div className="bb-auth-password">
        <input
          id={id}
          name="password"
          type={isVisible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete="current-password"
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className="bb-auth-field__control bb-auth-password__control"
        />
        <button
          type="button"
          className="bb-auth-password__toggle"
          onClick={() => setIsVisible((currentValue) => !currentValue)}
          aria-label={buttonLabel}
          aria-pressed={isVisible}
        >
          {isVisible ? "Ocultar" : "Mostrar"}
        </button>
      </div>
    </div>
  );
}
