import type { LoginCredentials } from "../services/auth.service";

const MOCK_LATENCY_MS = 180;

const demoAccount = {
  identifier: "demo@bytebank.com.br",
  password: "bytebank123",
} as const;

export const demoUser = {
  name: "Cliente Demo ByteBank",
  email: demoAccount.identifier,
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
      credentials.identifier.trim().toLowerCase() === demoAccount.identifier &&
      credentials.password === demoAccount.password,
  };
}
