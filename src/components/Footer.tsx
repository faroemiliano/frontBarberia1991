import logoFarixio from "../assets/logoFarixio.png";
import logoBarberia from "../assets/logoTitulo2.png";

export default function Footer() {
  return (
    <footer className="footer" id="contacto">
      <div className="footer-container">
        <div className="footer-brand">
          <img src={logoBarberia} alt="Barbería 1991" />
        </div>
        <div className="footer-col">
          <h4>Dirección</h4>
          <p>Irigoyen 1138, B1752 La Tablada</p>
          <a href="https://maps.app.goo.gl/cESJbAGczdZVZnL7A" target="_blank" rel="noreferrer">Cómo llegar ↗</a>
        </div>

        <div className="footer-col">
          <h4>Horarios</h4>

          <p>
            <strong>Martes a Jueves:</strong> 11:00 – 14:00 | 15:00 – 20:00
          </p>

          <p>
            <strong>Viernes y Sábado:</strong> 10:00 – 14:00 | 15:00 – 20:00
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} Barbería 1991 · Todos los derechos
          reservados
        </span>

        <div className="site-credit">
          <a
            className="site-credit-logo"
            href="https://www.farixio.com"
            target="_blank"
            rel="noreferrer"
            aria-label="Sitio web de Farixio"
          >
            <img src={logoFarixio} alt="Farixio" />
          </a>
          <div className="site-credit-copy">
            <small>Diseño y desarrollo web</small>
            <div className="site-credit-links">
              <a
                href="https://www.instagram.com/farixio.tech"
                target="_blank"
                rel="noreferrer"
              >
                @farixio.tech
              </a>
              <a href="https://www.farixio.com" target="_blank" rel="noreferrer">
                www.farixio.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
