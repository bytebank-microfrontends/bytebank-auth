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
        <span className="bb-auth-brand__brand">ByteBank</span>
      </div>
      <div className="bb-auth-brand__content">
        <h2 className="bb-auth-brand__title">
          Sua vida financeira, mais simples todos os dias.
        </h2>
        <p className="bb-auth-brand__description">
          Seguran&ccedil;a, controle e praticidade em um s&oacute; lugar.
        </p>
      </div>
    </aside>
  );
}
