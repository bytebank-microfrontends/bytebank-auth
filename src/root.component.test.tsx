import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { navigateToUrl } from "single-spa";
import { setMockAuthSession } from "@bytebank/util";
import Root from "./root.component";
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

const DEMO_EMAIL = "demo@bytebank.com.br";
const DEMO_PASSWORD = "bytebank123";
const AUTH_SUCCESS_REDIRECT_PATH = "/bytebank-orchestrator/";
const DEMO_SESSION_USER = {
  name: "Cliente Demo ByteBank",
  email: DEMO_EMAIL,
  accountType: "checking",
};

const mockedNavigateToUrl = navigateToUrl as jest.MockedFunction<
  typeof navigateToUrl
>;
const mockedSetMockAuthSession = setMockAuthSession as jest.MockedFunction<
  typeof setMockAuthSession
>;

const renderLogin = () => render(<Root />);

const fillCredentials = (identifier: string, password: string) => {
  fireEvent.change(screen.getByLabelText("CPF ou e-mail"), {
    target: { value: identifier },
  });
  fireEvent.change(screen.getByLabelText("Senha"), {
    target: { value: password },
  });
};

const submitLogin = () => {
  fireEvent.click(screen.getByRole("button", { name: "Entrar" }));
};

describe("ByteBank auth login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

  it("renders the CPF or email field", () => {
    renderLogin();

    expect(screen.getByLabelText("CPF ou e-mail")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Digite seu CPF ou e-mail")
    ).toBeInTheDocument();
  });

  it("renders the password field", () => {
    renderLogin();

    expect(screen.getByLabelText("Senha")).toBeInTheDocument();
  });

  it("starts with the password hidden", () => {
    renderLogin();

    expect(screen.getByLabelText("Senha")).toHaveAttribute("type", "password");
  });

  it("shows and hides the password", () => {
    renderLogin();
    const passwordField = screen.getByLabelText("Senha");

    fireEvent.click(screen.getByRole("button", { name: "Mostrar senha" }));
    expect(passwordField).toHaveAttribute("type", "text");

    fireEvent.click(screen.getByRole("button", { name: "Ocultar senha" }));
    expect(passwordField).toHaveAttribute("type", "password");
  });

  it("shows required messages on empty submit", () => {
    renderLogin();

    submitLogin();

    expect(screen.getByText("Informe seu CPF ou e-mail.")).toBeInTheDocument();
    expect(screen.getByText("Informe sua senha.")).toBeInTheDocument();
    expect(screen.getByLabelText("CPF ou e-mail")).toHaveAttribute(
      "aria-invalid",
      "true"
    );
    expect(screen.getByLabelText("Senha")).toHaveAttribute(
      "aria-invalid",
      "true"
    );
  });

  it("rejects an invalid email", () => {
    renderLogin();
    fillCredentials("demo@", DEMO_PASSWORD);

    submitLogin();

    expect(
      screen.getByText("Informe um CPF ou e-mail válido.")
    ).toBeInTheDocument();
  });

  it("rejects an invalid CPF", () => {
    renderLogin();
    fillCredentials("111.111.111-11", DEMO_PASSWORD);

    submitLogin();

    expect(
      screen.getByText("Informe um CPF ou e-mail válido.")
    ).toBeInTheDocument();
  });

  it("requires the password when the identifier is valid", () => {
    renderLogin();
    fillCredentials(DEMO_EMAIL, "");

    submitLogin();

    expect(screen.getByText("Informe sua senha.")).toBeInTheDocument();
  });

  it("uses a generic message for invalid credentials", async () => {
    renderLogin();
    fillCredentials(DEMO_EMAIL, "senha-errada");

    submitLogin();

    expect(
      await screen.findByText("CPF/e-mail ou senha inválidos.")
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
    fillCredentials(DEMO_EMAIL, DEMO_PASSWORD);

    submitLogin();

    expect(
      await screen.findByText("Acesso validado com sucesso.")
    ).toBeInTheDocument();
  });

  it("registers the mock auth session for valid login", async () => {
    renderLogin();
    fillCredentials(DEMO_EMAIL, DEMO_PASSWORD);

    submitLogin();

    await waitFor(() =>
      expect(mockedSetMockAuthSession).toHaveBeenCalledWith(DEMO_SESSION_USER)
    );
    expect(mockedSetMockAuthSession).toHaveBeenCalledTimes(1);
  });

  it("does not send the password to the mock auth session", async () => {
    renderLogin();
    fillCredentials(DEMO_EMAIL, DEMO_PASSWORD);

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
    fillCredentials(DEMO_EMAIL, DEMO_PASSWORD);

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
    fillCredentials(DEMO_EMAIL, "senha-errada");

    submitLogin();

    expect(
      await screen.findByText(/CPF\/e-mail ou senha inv/i)
    ).toBeInTheDocument();
    expect(mockedSetMockAuthSession).not.toHaveBeenCalled();
  });

  it("shows the loading state while submitting", async () => {
    renderLogin();
    fillCredentials(DEMO_EMAIL, DEMO_PASSWORD);

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
    fillCredentials(DEMO_EMAIL, DEMO_PASSWORD);

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
    window.localStorage.clear();
    window.sessionStorage.clear();
    const setItemSpy = jest.spyOn(Storage.prototype, "setItem");

    renderLogin();
    fillCredentials(DEMO_EMAIL, DEMO_PASSWORD);

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
