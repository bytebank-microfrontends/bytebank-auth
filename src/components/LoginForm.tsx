import { FormEvent, useRef, useState } from "react";
import AuthFeedback from "./AuthFeedback";
import PasswordField from "./PasswordField";
import {
  authenticate,
  TECHNICAL_ERROR_MESSAGE,
} from "../services/auth.service";
import { isValidIdentifier } from "../utils/auth-validation";

const EMPTY_IDENTIFIER_MESSAGE = "Informe seu CPF ou e-mail.";
const INVALID_IDENTIFIER_MESSAGE = "Informe um CPF ou e-mail válido.";
const EMPTY_PASSWORD_MESSAGE = "Informe sua senha.";
const RECOVERY_UNAVAILABLE_MESSAGE =
  "Recuperação de senha estará disponível em breve.";

interface LoginErrors {
  identifier?: string;
  password?: string;
}

type FeedbackState =
  | {
      message: string;
      variant: "error" | "success" | "info";
    }
  | undefined;

export default function LoginForm() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginErrors>({});
  const [feedback, setFeedback] = useState<FeedbackState>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmitLockedRef = useRef(false);

  const validateFields = (): LoginErrors => {
    const nextErrors: LoginErrors = {};
    const trimmedIdentifier = identifier.trim();

    if (!trimmedIdentifier) {
      nextErrors.identifier = EMPTY_IDENTIFIER_MESSAGE;
    } else if (!isValidIdentifier(trimmedIdentifier)) {
      nextErrors.identifier = INVALID_IDENTIFIER_MESSAGE;
    }

    if (!password) {
      nextErrors.password = EMPTY_PASSWORD_MESSAGE;
    }

    return nextErrors;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitLockedRef.current) {
      return;
    }

    const nextErrors = validateFields();
    setErrors(nextErrors);
    setFeedback(undefined);

    if (nextErrors.identifier || nextErrors.password) {
      return;
    }

    isSubmitLockedRef.current = true;
    setIsSubmitting(true);

    try {
      const result = await authenticate({ identifier, password });

      setFeedback({
        message: result.message,
        variant: result.success ? "success" : "error",
      });
    } catch (_error) {
      setFeedback({
        message: TECHNICAL_ERROR_MESSAGE,
        variant: "error",
      });
    } finally {
      isSubmitLockedRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    setFeedback({
      message: RECOVERY_UNAVAILABLE_MESSAGE,
      variant: "info",
    });
  };

  const identifierErrorId = errors.identifier
    ? "bb-auth-identifier-error"
    : undefined;
  const passwordErrorId = errors.password
    ? "bb-auth-password-error"
    : undefined;

  return (
    <div className="bb-auth-login">
      <header className="bb-auth-login__header">
        <span className="bb-auth-login__eyebrow">ACESSO SEGURO</span>
        <h1 id="bb-auth-title" className="bb-auth-login__title">
          Bem-vindo ao ByteBank
        </h1>
        <p className="bb-auth-login__description">
          Informe seus dados para acessar sua conta.
        </p>
      </header>

      <form className="bb-auth-form" onSubmit={handleSubmit} noValidate>
        <div className="bb-auth-field">
          <label className="bb-auth-field__label" htmlFor="bb-auth-identifier">
            CPF ou e-mail
          </label>
          <input
            id="bb-auth-identifier"
            name="identifier"
            type="text"
            autoComplete="username"
            placeholder="Digite seu CPF ou e-mail"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            aria-invalid={Boolean(errors.identifier)}
            aria-describedby={identifierErrorId}
            className="bb-auth-field__control"
          />
          {errors.identifier ? (
            <AuthFeedback
              id={identifierErrorId}
              message={errors.identifier}
              variant="error"
            />
          ) : null}
        </div>

        <PasswordField
          id="bb-auth-password"
          label="Senha"
          value={password}
          onChange={setPassword}
          error={errors.password}
          describedBy={passwordErrorId}
        />
        {errors.password ? (
          <AuthFeedback
            id={passwordErrorId}
            message={errors.password}
            variant="error"
          />
        ) : null}

        <div className="bb-auth-form__support">
          <button
            type="button"
            className="bb-auth-form__link-button"
            onClick={handleForgotPassword}
          >
            Esqueci minha senha
          </button>
        </div>

        {feedback ? (
          <AuthFeedback message={feedback.message} variant={feedback.variant} />
        ) : null}

        <button
          type="submit"
          className="bb-auth-form__submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
