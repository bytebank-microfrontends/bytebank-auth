import * as authMock from "../data/auth.mock";
import type { MockAuthSessionUser } from "@bytebank/util";

export interface LoginCredentials {
  cpf: string;
  password: string;
}

export interface AuthSuccess {
  success: true;
  message: "Acesso validado com sucesso.";
  user: MockAuthSessionUser;
}

export interface AuthFailure {
  success: false;
  reason: "invalid-credentials" | "technical-error";
  message:
    | "CPF ou senha inválidos."
    | "Não foi possível concluir o acesso agora. Tente novamente em alguns instantes.";
}

export type AuthResult = AuthSuccess | AuthFailure;

export const TECHNICAL_ERROR_MESSAGE =
  "Não foi possível concluir o acesso agora. Tente novamente em alguns instantes.";

const INVALID_CREDENTIALS_MESSAGE = "CPF ou senha inválidos.";
const SUCCESS_MESSAGE = "Acesso validado com sucesso.";

export async function authenticate(
  credentials: LoginCredentials
): Promise<AuthResult> {
  try {
    const result = await authMock.validateMockCredentials(credentials);

    if (!result.authenticated) {
      return {
        success: false,
        reason: "invalid-credentials",
        message: INVALID_CREDENTIALS_MESSAGE,
      };
    }

    return {
      success: true,
      message: SUCCESS_MESSAGE,
      user: authMock.demoUser,
    };
  } catch (_error) {
    return {
      success: false,
      reason: "technical-error",
      message: TECHNICAL_ERROR_MESSAGE,
    };
  }
}
