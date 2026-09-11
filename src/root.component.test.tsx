import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { navigateToUrl } from "single-spa";
import { setMockAuthSession } from "@bytebank/util";
import Root from "./root.component";
import {
  ALL_COOKIE_CONSENT_PREFERENCES,
  COOKIE_CONSENT_STORAGE_KEY,
  CookieConsentPreferences,
} from "./components/CookieConsent";
import * as authMock from "./data/auth.mock";
import { bootstrap, mount, unmount } from "./bytebank-auth";

jest.mock("single-spa", () => ({
  navigateToUrl: jest.fn(),
}));

jest.mock(
  "@bytebank/util",
  () => ({
    setMockAuthSession: jest.fn(),
  }),
  { virtual: true }
);

const DEMO_CPF = "529.982.247-25";
const DEMO_PASSWORD = "bytebank123";
const AUTH_SUCCESS_REDIRECT_PATH = "/bytebank-orchestrator/";
const DEMO_SESSION_USER = {
  name: "Cliente Demo ByteBank",
  email: "cliente.demo@bytebank.com.br",
  accountType: "checking",
};

const mockedNavigateToUrl = navigateToUrl as jest.MockedFunction<
  typeof navigateToUrl
>;
const mockedSetMockAuthSession = setMockAuthSession as jest.MockedFunction<
  typeof setMockAuthSession
>;

const renderLogin = () => render(<Root />);

const fillCredentials = (cpf: string, password: string) => {
  fireEvent.change(screen.getByLabelText("CPF"), {
    target: { value: cpf },
  });
  fireEvent.change(screen.getByLabelText("Senha"), {
    target: { value: password },
  });
};

const submitLogin = () => {
  fireEvent.click(screen.getByRole("button", { name: "Entrar" }));
};

const getStoredCookieConsentPreferences = (): CookieConsentPreferences =>
  JSON.parse(
    window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY) ?? "{}"
  ) as CookieConsentPreferences;

describe("ByteBank auth login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders the login page", () => {
    renderLogin();

    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByText("ByteBank")).toBeInTheDocument();
    expect(screen.getByText("Portal do Cliente")).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: "Cliente ByteBank usando o aplicativo no celular",
      })
    ).toBeInTheDocument();
  });

  it("renders the login title", () => {
    renderLogin();

    expect(screen.getByRole("heading", { name: "Olá" })).toBeInTheDocument();
    expect(
      screen.getByText("No portal ByteBank você acompanha sua vida financeira")
    ).toBeInTheDocument();
  });

  it("does not render removed login copy", () => {
    renderLogin();

    expect(screen.queryByText("ACESSO SEGURO")).not.toBeInTheDocument();
    expect(screen.queryByText("Bem-vindo ao ByteBank")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Informe seus dados para acessar sua conta.")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Sua vida financeira, mais simples todos os dias.")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Segurança, controle e praticidade em um só lugar.")
    ).not.toBeInTheDocument();
  });

  it("renders the secure environment note", () => {
    renderLogin();

    expect(screen.getByText("Ambiente seguro ByteBank")).toBeInTheDocument();
  });

  it("shows the cookie consent banner when there is no saved consent", () => {
    renderLogin();

    expect(
      screen.getByText(
        "Usamos cookies para segurança, funcionamento do portal e melhoria da experiência. Você pode revisar suas preferências na Definição de Cookies."
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Definição de Cookies" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Aceitar todos" })
    ).toBeInTheDocument();
  });

  it("opens the cookie preferences dialog", () => {
    renderLogin();

    fireEvent.click(
      screen.getByRole("button", { name: "Definição de Cookies" })
    );

    expect(
      screen.getByRole("dialog", { name: "Definição de Cookies" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Necessários" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Analíticos" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Personalização" })
    ).toBeInTheDocument();
  });

  it("keeps necessary cookies always active and disabled", () => {
    renderLogin();

    fireEvent.click(
      screen.getByRole("button", { name: "Definição de Cookies" })
    );

    const necessaryToggle = screen.getByLabelText("Sempre ativos");

    expect(necessaryToggle).toBeChecked();
    expect(necessaryToggle).toBeDisabled();
    expect(screen.getByText("Sempre ativos")).toBeInTheDocument();
    expect(
      screen.getByText("Necessários para funcionamento e segurança do portal.")
    ).toBeInTheDocument();
  });

  it("updates analytics and personalization toggles", () => {
    renderLogin();

    fireEvent.click(
      screen.getByRole("button", { name: "Definição de Cookies" })
    );

    const analyticsToggle = screen.getByLabelText("Analíticos");
    const personalizationToggle = screen.getByLabelText("Personalização");

    expect(analyticsToggle).not.toBeChecked();
    expect(personalizationToggle).not.toBeChecked();

    fireEvent.click(analyticsToggle);
    fireEvent.click(personalizationToggle);

    expect(analyticsToggle).toBeChecked();
    expect(personalizationToggle).toBeChecked();
    expect(
      screen.getByText("Ajudam a entender como o portal é utilizado.")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Permitem lembrar preferências de experiência.")
    ).toBeInTheDocument();
  });

  it("saves selected cookie preferences as structured data", () => {
    renderLogin();

    fireEvent.click(
      screen.getByRole("button", { name: "Definição de Cookies" })
    );
    fireEvent.click(screen.getByLabelText("Analíticos"));
    fireEvent.click(
      screen.getByRole("button", { name: "Salvar preferências" })
    );

    expect(getStoredCookieConsentPreferences()).toEqual({
      necessary: true,
      analytics: true,
      personalization: false,
    });
  });

  it("hides the cookie consent banner after saving preferences", () => {
    renderLogin();

    fireEvent.click(
      screen.getByRole("button", { name: "Definição de Cookies" })
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Salvar preferências" })
    );

    expect(
      screen.queryByText(
        "Usamos cookies para segurança, funcionamento do portal e melhoria da experiência. Você pode revisar suas preferências na Definição de Cookies."
      )
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("saves all cookie preferences when accepting all", () => {
    renderLogin();

    fireEvent.click(screen.getByRole("button", { name: "Aceitar todos" }));

    expect(getStoredCookieConsentPreferences()).toEqual(
      ALL_COOKIE_CONSENT_PREFERENCES
    );
    expect(
      screen.queryByText(
        "Usamos cookies para segurança, funcionamento do portal e melhoria da experiência. Você pode revisar suas preferências na Definição de Cookies."
      )
    ).not.toBeInTheDocument();
  });

  it("saves all cookie preferences from the preferences dialog", () => {
    renderLogin();

    fireEvent.click(
      screen.getByRole("button", { name: "Definição de Cookies" })
    );
    fireEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "Aceitar todos",
      })
    );

    expect(getStoredCookieConsentPreferences()).toEqual(
      ALL_COOKIE_CONSENT_PREFERENCES
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("does not show the cookie consent banner when a decision is already saved", () => {
    window.localStorage.setItem(
      COOKIE_CONSENT_STORAGE_KEY,
      JSON.stringify({
        necessary: true,
        analytics: false,
        personalization: false,
      })
    );

    renderLogin();

    expect(
      screen.queryByRole("button", { name: "Aceitar todos" })
    ).not.toBeInTheDocument();
  });

  it("closes the cookie preferences dialog with the close button", () => {
    renderLogin();

    fireEvent.click(
      screen.getByRole("button", { name: "Definição de Cookies" })
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Fechar definição de cookies" })
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Definição de Cookies" })
    ).toHaveFocus();
  });

  it("closes the cookie preferences dialog with Escape", () => {
    renderLogin();

    fireEvent.click(
      screen.getByRole("button", { name: "Definição de Cookies" })
    );
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("does not save sensitive data in the cookie consent preference", () => {
    const setItemSpy = jest.spyOn(Storage.prototype, "setItem");

    renderLogin();
    fireEvent.click(screen.getByRole("button", { name: "Aceitar todos" }));

    expect(setItemSpy).toHaveBeenCalledWith(
      COOKIE_CONSENT_STORAGE_KEY,
      JSON.stringify(ALL_COOKIE_CONSENT_PREFERENCES)
    );
    expect(window.localStorage.length).toBe(1);
    expect(Object.keys(window.localStorage)).toEqual([
      COOKIE_CONSENT_STORAGE_KEY,
    ]);
    expect(window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)).not.toMatch(
      /token|sess[aã]o|cpf|senha|password|529|bytebank123/i
    );
  });

  it("renders the CPF field", () => {
    renderLogin();

    expect(screen.getByLabelText("CPF")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("CPF")).toBeInTheDocument();
    expect(screen.queryByLabelText("CPF ou e-mail")).not.toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText("CPF ou e-mail")
    ).not.toBeInTheDocument();
  });

  it("renders the password field", () => {
    renderLogin();

    expect(screen.getByLabelText("Senha")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Digite sua senha")).toBeInTheDocument();
  });

  it("keeps the password field hidden without a visibility toggle", () => {
    renderLogin();

    expect(screen.getByLabelText("Senha")).toHaveAttribute("type", "password");
    expect(
      screen.queryByRole("button", { name: /mostrar senha|ocultar senha/i })
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Mostrar")).not.toBeInTheDocument();
    expect(screen.queryByText("Ocultar")).not.toBeInTheDocument();
  });

  it("shows required messages on empty submit", () => {
    renderLogin();

    submitLogin();

    expect(screen.getByText("Informe seu CPF.")).toBeInTheDocument();
    expect(screen.getByText("Informe sua senha.")).toBeInTheDocument();
    expect(screen.getByLabelText("CPF")).toHaveAttribute(
      "aria-invalid",
      "true"
    );
    expect(screen.getByLabelText("Senha")).toHaveAttribute(
      "aria-invalid",
      "true"
    );
  });

  it("does not support email login", () => {
    renderLogin();
    fillCredentials("demo@bytebank.com.br", DEMO_PASSWORD);

    submitLogin();

    expect(screen.getByText("Informe um CPF válido.")).toBeInTheDocument();
  });

  it("rejects an invalid CPF", () => {
    renderLogin();
    fillCredentials("111.111.111-11", DEMO_PASSWORD);

    submitLogin();

    expect(screen.getByText("Informe um CPF válido.")).toBeInTheDocument();
  });

  it("requires the password when the CPF is valid", () => {
    renderLogin();
    fillCredentials(DEMO_CPF, "");

    submitLogin();

    expect(screen.getByText("Informe sua senha.")).toBeInTheDocument();
  });

  it("uses a generic message for invalid credentials", async () => {
    renderLogin();
    fillCredentials(DEMO_CPF, "senha-errada");

    submitLogin();

    expect(
      await screen.findByText("CPF ou senha inválidos.")
    ).toBeInTheDocument();
    expect(screen.queryByText(/senha incorreta/i)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/e-mail não cadastrado/i)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/usuário não encontrado/i)
    ).not.toBeInTheDocument();
  });

  it("returns success for the demo credentials", async () => {
    renderLogin();
    fillCredentials(DEMO_CPF, DEMO_PASSWORD);

    submitLogin();

    expect(
      await screen.findByText("Acesso validado com sucesso.")
    ).toBeInTheDocument();
  });

  it("registers the mock auth session for valid login", async () => {
    renderLogin();
    fillCredentials(DEMO_CPF, DEMO_PASSWORD);

    submitLogin();

    await waitFor(() =>
      expect(mockedSetMockAuthSession).toHaveBeenCalledWith(DEMO_SESSION_USER)
    );
    expect(mockedSetMockAuthSession).toHaveBeenCalledTimes(1);
  });

  it("does not send the password to the mock auth session", async () => {
    renderLogin();
    fillCredentials(DEMO_CPF, DEMO_PASSWORD);

    submitLogin();

    await waitFor(() =>
      expect(mockedSetMockAuthSession).toHaveBeenCalledTimes(1)
    );

    const sessionUser = mockedSetMockAuthSession.mock.calls[0][0];
    expect(sessionUser).not.toHaveProperty("password");
    expect(Object.keys(sessionUser).sort()).toEqual([
      "accountType",
      "email",
      "name",
    ]);
  });

  it("navigates to the orchestrator after valid login", async () => {
    renderLogin();
    fillCredentials(DEMO_CPF, DEMO_PASSWORD);

    submitLogin();

    await waitFor(() =>
      expect(mockedNavigateToUrl).toHaveBeenCalledWith(
        AUTH_SUCCESS_REDIRECT_PATH
      )
    );
    expect(mockedNavigateToUrl).toHaveBeenCalledTimes(1);
  });

  it("does not create a mock auth session for invalid login", async () => {
    renderLogin();
    fillCredentials(DEMO_CPF, "senha-errada");

    submitLogin();

    expect(await screen.findByText(/CPF ou senha inv/i)).toBeInTheDocument();
    expect(mockedSetMockAuthSession).not.toHaveBeenCalled();
  });

  it("shows the loading state while submitting", async () => {
    renderLogin();
    fillCredentials(DEMO_CPF, DEMO_PASSWORD);

    submitLogin();

    expect(screen.getByRole("button", { name: "Entrando..." })).toBeDisabled();
    expect(
      await screen.findByText("Acesso validado com sucesso.")
    ).toBeInTheDocument();
  });

  it("blocks double-submit while authentication is processing", async () => {
    let resolveAuthentication: (
      value: authMock.MockAuthResponse
    ) => void = () => undefined;
    const pendingAuthentication = new Promise<authMock.MockAuthResponse>(
      (resolve) => {
        resolveAuthentication = resolve;
      }
    );
    const validateSpy = jest
      .spyOn(authMock, "validateMockCredentials")
      .mockReturnValue(pendingAuthentication);

    renderLogin();
    fillCredentials(DEMO_CPF, DEMO_PASSWORD);

    const submitButton = screen.getByRole("button", { name: "Entrar" });
    const form = submitButton.closest("form");
    expect(form).not.toBeNull();

    fireEvent.submit(form as HTMLFormElement);
    fireEvent.submit(form as HTMLFormElement);

    expect(validateSpy).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Entrando..." })).toBeDisabled();

    resolveAuthentication({ authenticated: true });

    await waitFor(() =>
      expect(
        screen.getByText("Acesso validado com sucesso.")
      ).toBeInTheDocument()
    );
  });

  it("does not navigate when forgot password is selected", () => {
    renderLogin();
    const forgotPasswordButton = screen.getByRole("button", {
      name: "Esqueci minha senha",
    });

    expect(forgotPasswordButton).toHaveAttribute("type", "button");
    expect(
      screen.queryByRole("link", { name: "Esqueci minha senha" })
    ).not.toBeInTheDocument();

    fireEvent.click(forgotPasswordButton);

    expect(
      screen.getByText("Recuperação de senha estará disponível em breve.")
    ).toBeInTheDocument();
  });

  it("does not persist authentication in localStorage or sessionStorage", async () => {
    const setItemSpy = jest.spyOn(Storage.prototype, "setItem");

    renderLogin();
    fillCredentials(DEMO_CPF, DEMO_PASSWORD);

    submitLogin();

    expect(
      await screen.findByText("Acesso validado com sucesso.")
    ).toBeInTheDocument();
    expect(setItemSpy).not.toHaveBeenCalled();
    expect(window.localStorage.length).toBe(0);
    expect(window.sessionStorage.length).toBe(0);
  });

  it("keeps the Single-SPA lifecycle exports available", () => {
    expect(typeof bootstrap).toBe("function");
    expect(typeof mount).toBe("function");
    expect(typeof unmount).toBe("function");
  });
});
