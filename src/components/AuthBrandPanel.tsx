export default function AuthBrandPanel() {
  return (
    <aside className="bb-auth-brand" aria-label="ByteBank">
      <div className="bb-auth-brand__mark" aria-hidden="true">
        <span>BB</span>
      </div>

      <div className="bb-auth-brand__content">
        <p className="bb-auth-brand__name">ByteBank</p>
        <h2 className="bb-auth-brand__title">
          Seu banco. Sua vida financeira, em um só lugar.
        </h2>
        <p className="bb-auth-brand__description">
          Segurança e praticidade para cuidar do seu dinheiro.
        </p>
      </div>

      <div className="bb-auth-brand__signal" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </aside>
  );
}
