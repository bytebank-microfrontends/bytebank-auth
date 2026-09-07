export type AuthFeedbackVariant = "error" | "success" | "info";

export interface AuthFeedbackProps {
  id?: string;
  message: string;
  variant: AuthFeedbackVariant;
}

export default function AuthFeedback({
  id,
  message,
  variant,
}: AuthFeedbackProps) {
  const isError = variant === "error";

  return (
    <p
      id={id}
      className={`bb-auth-feedback bb-auth-feedback--${variant}`}
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
    >
      {message}
    </p>
  );
}
