import { FormEvent, useRef, useState } from "react";
import AuthFeedback from "./AuthFeedback";
import PasswordField from "./PasswordField";
import {
  authenticate,
  TECHNICAL_ERROR_MESSAGE,
} from "../services/auth.service";
import { completeMockLogin } from "../services/mock-auth-session.service";
import { isValidCpf } from "../utils/auth-validation";

const EMPTY_CPF_MESSAGE = "Informe seu CPF.";
const INVALID_CPF_MESSAGE = "Informe um CPF válido.";
const EMPTY_PASSWORD_MESSAGE = "Informe sua senha.";
const RECOVERY_UNAVAILABLE_MESSAGE =
  "Recuperação de senha estará disponível em breve.";

interface LoginErrors {
  cpf?: string;
  password?: string;
}

type FeedbackState =
  | {
      message: string;
      variant: "error" | "success" | "info";
    }
  | undefined;

export default function LoginForm() {
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginErrors>({});
  const [feedback, setFeedback] = useState<FeedbackState>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmitLockedRef = useRef(false);

  const validateFields = (): LoginErrors => {
    const nextErrors: LoginErrors = {};
    const trimmedCpf = cpf.trim();

    if (!trimmedCpf) {
      nextErrors.cpf = EMPTY_CPF_MESSAGE;
    } else if (!isValidCpf(trimmedCpf)) {
      nextErrors.cpf = INVALID_CPF_MESSAGE;
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

    if (nextErrors.cpf || nextErrors.password) {
      return;
    }

    isSubmitLockedRef.current = true;
    setIsSubmitting(true);

    try {
      const result = await authenticate({ cpf, password });

      setFeedback({
        message: result.message,
        variant: result.success ? "success" : "error",
      });

      if (result.success) {
        completeMockLogin(result.user);
      }
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

  const cpfErrorId = errors.cpf ? "bb-auth-cpf-error" : undefined;
  const passwordErrorId = errors.password
    ? "bb-auth-password-error"
    : undefined;

  return (
    <div className="bb-auth-login">
      <header className="bb-auth-login__header">
        <h1 id="bb-auth-title" className="bb-auth-login__title">
          Ol&aacute;
        </h1>
        <p className="bb-auth-login__description">
          No portal ByteBank voc&ecirc; acompanha sua vida financeira
        </p>
      </header>

      <form className="bb-auth-form" onSubmit={handleSubmit} noValidate>
        <div className="bb-auth-field">
          <label
            className="bb-auth-field__label visually-hidden"
            htmlFor="bb-auth-cpf"
          >
            CPF
          </label>
          <input
            id="bb-auth-cpf"
            name="cpf"
            type="text"
            autoComplete="username"
            placeholder="CPF"
            value={cpf}
            onChange={(event) => setCpf(event.target.value)}
            aria-invalid={Boolean(errors.cpf)}
            aria-describedby={cpfErrorId}
            className="bb-auth-field__control"
          />
          {errors.cpf ? (
            <AuthFeedback
              id={cpfErrorId}
              message={errors.cpf}
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

        <aside
          className="bb-auth-security-note"
          aria-labelledby="bb-auth-security-title"
        >
          <span className="bb-auth-security-note__icon" aria-hidden="true" />
          <div>
            <h2
              id="bb-auth-security-title"
              className="bb-auth-security-note__title"
            >
              Ambiente seguro ByteBank
            </h2>
            <p className="bb-auth-security-note__description">
              Seus dados são protegidos durante o acesso.
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}
