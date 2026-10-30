export default function CutsGallery() {
  return (
    <section className="cuts" id="trabajos">
      <div className="cuts-content">
        <header className="section-heading">
          <span className="section-kicker">Nuestro trabajo</span>
          <h2>Precisión en cada detalle</h2>
          <p>Estilos pensados para acompañarte dentro y fuera de la barbería.</p>
        </header>
        <div className="cuts-grid">
          <div className="cut-card">
            <video
              src="https://pub-24e04f446a1e451db8b43838c8597cc7.r2.dev/WhatsApp%20Video%202026-01-21%20at%2019.04.51.mp4"
              autoPlay
              muted
              loop
              playsInline
            />
            <span><small>01</small>Cuidado de barba</span>
          </div>

          <div className="cut-card">
            <video
              src="https://pub-24e04f446a1e451db8b43838c8597cc7.r2.dev/WhatsApp%20Video%202026-01-28%20at%2021.51.43.mp4"
              autoPlay
              muted
              loop
              playsInline
            />
            <span><small>02</small>Fade y barba</span>
          </div>

          <div className="cut-card">
            <video
              src="https://pub-24e04f446a1e451db8b43838c8597cc7.r2.dev/WhatsApp%20Video%202026-01-28%20at%2021.58.18.mp4"
              autoPlay
              muted
              loop
              playsInline
            />
            <span><small>03</small>Corte y mechas</span>
          </div>

          <div className="cut-card">
            <video
              src="https://pub-24e04f446a1e451db8b43838c8597cc7.r2.dev/WhatsApp%20Video%202026-01-28%20at%2022.00.12.mp4"
              autoPlay
              muted
              loop
              playsInline
            />
            <span><small>04</small>Corte y tintura global</span>
          </div>
        </div>
      </div>
    </section>
  );
}
