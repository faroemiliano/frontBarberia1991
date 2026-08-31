import logoBarberia1991 from "../assets/fondo1.jpeg";
import type { SessionUser } from "../auth";

interface Props {
  user: SessionUser | null;
  onLogin: () => void;
  onLogout: () => void;
}

export default function Navbar({ user, onLogin, onLogout }: Props) {
  return (
    <header className="navbar">
      <a className="navbar-logo-wrapper" href="/" aria-label="Ir al inicio">
        <img
          src={logoBarberia1991}
          alt="Barbería 1991"
          className="navbar-logo"
        />
      </a>

      <nav className="navbar-actions">
        <a className="navbar-link" href="#contacto">
          Contacto
        </a>
        {!user ? (
          <button className="btn-secondary navbar-button" onClick={onLogin}>
            Iniciar sesión
          </button>
        ) : (
          <button className="btn-secondary navbar-button" onClick={onLogout}>
            Salir
          </button>
        )}
      </nav>
    </header>
  );
}
