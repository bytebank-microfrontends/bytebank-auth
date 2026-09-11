import AuthBrandPanel from "./components/AuthBrandPanel";
import CookieConsent from "./components/CookieConsent";
import LoginForm from "./components/LoginForm";
import "./styles/auth.css";

export interface RootProps {
  name?: string;
}

export default function Root(_props: RootProps) {
  return (
    <main className="bb-auth" aria-labelledby="bb-auth-title">
      <div className="bb-auth__shell">
        <AuthBrandPanel />
        <section className="bb-auth__form-panel" aria-label="Acesso ByteBank">
          <LoginForm />
        </section>
      </div>
      <CookieConsent />
    </main>
  );
}
