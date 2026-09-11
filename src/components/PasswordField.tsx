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
  return (
    <div className="bb-auth-field">
      <label className="bb-auth-field__label visually-hidden" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        name="password"
        type="password"
        placeholder="Digite sua senha"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete="current-password"
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className="bb-auth-field__control"
      />
    </div>
  );
}
