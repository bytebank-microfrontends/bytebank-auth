import type { LoginCredentials } from "../services/auth.service";
import { onlyDigits } from "../utils/auth-validation";

const MOCK_LATENCY_MS = 180;

// CPF fictício válido usado apenas para demonstração no mock de autenticação.
const demoAccount = {
  cpf: "529.982.247-25",
  password: "bytebank123",
} as const;

export const demoUser = {
  name: "Cliente Demo ByteBank",
  email: "cliente.demo@bytebank.com.br",
  accountType: "checking",
} as const;

export interface MockAuthResponse {
  authenticated: boolean;
}

const waitForMockLatency = () =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, MOCK_LATENCY_MS);
  });

export async function validateMockCredentials(
  credentials: LoginCredentials
): Promise<MockAuthResponse> {
  await waitForMockLatency();

  return {
    authenticated:
      onlyDigits(credentials.cpf) === onlyDigits(demoAccount.cpf) &&
      credentials.password === demoAccount.password,
  };
}
