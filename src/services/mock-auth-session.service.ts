import { navigateToUrl } from "single-spa";
import { setMockAuthSession, type MockAuthSessionUser } from "@bytebank/util";

export const AUTH_SUCCESS_REDIRECT_PATH = "/bytebank-orchestrator/";

export function completeMockLogin(user: MockAuthSessionUser): void {
  setMockAuthSession(user);
  navigateToUrl(AUTH_SUCCESS_REDIRECT_PATH);
}
