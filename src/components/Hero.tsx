import { useState } from "react";
import Booking from "./Booking";
import MisTurnos from "./MisTurnos";
import logoTitulo from "../assets/logoTitulo2.png";
import locationLogo from "../assets/logos/logoUbi.png";
import instagramLogo from "../assets/logos/logoInsta.png";
import whatsappLogo from "../assets/logos/logoWhats.png";
import fondo from "../assets/fondoPantalla.png";
import type { SessionUser } from "../auth";

interface Props {
  user: SessionUser | null;
  onLogin: () => void;
}

export default function Hero({ user, onLogin }: Props) {
  const [openBooking, setOpenBooking] = useState(false);
  const [misTurnos, setMisTurnos] = useState(false);

  return (
    <section className="hero" style={{ backgroundImage: `url(${fondo})` }}>
      <div className="hero-glow" aria-hidden="true" />

      <div className="hero-main">
        <div className="hero-copy">
          <span className="hero-eyebrow">La Tablada · Buenos Aires</span>
          <h1>Tu estilo, <em>bien definido.</em></h1>
          <p>
            Barbería clásica con mirada actual. Cortes, barba y color hechos con
            oficio, detalle y tiempo para vos.
          </p>
        </div>

        <div className="hero-actions">
          {!user && (
            <button className="cta hero-primary" onClick={onLogin}>
              Reservar un turno
            </button>
          )}

          {user && user.rol !== "admin" && (
            <>
              <button className="cta hero-primary" onClick={() => setOpenBooking(true)}>
                Reservar turno
              </button>
              <button className="btn-secondary" onClick={() => setMisTurnos(true)}>
                Ver mis turnos
              </button>
            </>
          )}
        </div>

        <div className="hero-socials" aria-label="Encontranos en">
          <span>Encontranos</span>
          <div className="hero-icons">
          <a href="https://maps.app.goo.gl/cESJbAGczdZVZnL7A" target="_blank" rel="noreferrer" aria-label="Ver ubicación en Google Maps">
            <img src={locationLogo} alt="" />
          </a>
          <a
            href="https://www.instagram.com/1991.barberia?igsh=MXE3YzVwaTAyZ2l3Zw=="
            target="_blank"
            rel="noreferrer"
            aria-label="Visitar Instagram"
          >
            <img src={instagramLogo} alt="" />
          </a>
          <a href="https://wa.me/5491122384585" target="_blank" rel="noreferrer" aria-label="Escribir por WhatsApp">
            <img src={whatsappLogo} alt="" />
          </a>
          </div>
        </div>
      </div>

      <img src={logoTitulo} alt="Barbería 1991" className="hero-logo-bg" />

      {/* MODALES */}
      {openBooking && (
        <div className="modal-overlay">
          <div className="modal-content">
            <Booking onClose={() => setOpenBooking(false)} />
          </div>
        </div>
      )}

      {misTurnos && (
        <div className="modal-overlay">
          <div className="modal-content">
            <MisTurnos onClose={() => setMisTurnos(false)} />
          </div>
        </div>
      )}
    </section>
  );
}
