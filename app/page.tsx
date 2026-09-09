export default function Home() {
  return (
    <section className="av-hero fade-in">
      <h1 className="flicker">Arcade Vault</h1>
      <p className="sub">
        Inserta moneda para continuar <span className="blink">_</span>
      </p>
      <div className="detail-actions" style={{ justifyContent: "center" }}>
        <button className="btn pulse">Jugar ahora</button>
        <button className="btn magenta">Salón de la fama</button>
      </div>
    </section>
  );
}
