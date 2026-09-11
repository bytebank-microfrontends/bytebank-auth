import loginHero from "../assets/login-hero.webp";
import bytebankSymbol from "../assets/bytebank-symbol.png";

export default function AuthBrandPanel() {
  return (
    <aside className="bb-auth-brand" aria-label="ByteBank">
      <img
        className="bb-auth-brand__image"
        src={loginHero}
        alt="Cliente ByteBank usando o aplicativo no celular"
      />

      <div className="bb-auth-brand__signature">
        <img
          className="bb-auth-brand__symbol"
          src={bytebankSymbol}
          alt=""
          aria-hidden="true"
        />
        <div className="bb-auth-brand__copy">
          <span className="bb-auth-brand__brand">ByteBank</span>
          <span className="bb-auth-brand__portal">Portal do Cliente</span>
        </div>
      </div>
    </aside>
  );
}
