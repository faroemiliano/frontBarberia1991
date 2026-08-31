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
              src="https://res.cloudinary.com/dnsxvwfoc/video/upload/v1770838550/corte1_nztjrt.mp4"
              autoPlay
              muted
              loop
              playsInline
            />
            <span><small>01</small>Cuidado de barba</span>
          </div>

          <div className="cut-card">
            <video
              src="https://res.cloudinary.com/dnsxvwfoc/video/upload/v1770838550/corte2_zrwczp.mp4"
              autoPlay
              muted
              loop
              playsInline
            />
            <span><small>02</small>Fade y barba</span>
          </div>

          <div className="cut-card">
            <video
              src="https://res.cloudinary.com/dnsxvwfoc/video/upload/v1770838550/corte4_a9vtbk.mp4"
              autoPlay
              muted
              loop
              playsInline
            />
            <span><small>03</small>Corte y mechas</span>
          </div>

          <div className="cut-card">
            <video
              src="https://res.cloudinary.com/dnsxvwfoc/video/upload/v1770838551/corte3_ra82rn.mp4"
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
