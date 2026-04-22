import { useState, useEffect } from "react";
import Calendar from "./Calendar";
import { getToken } from "../auth";
import { apiFetch } from "../api";

interface HorarioSeleccionado {
  id: number;
  fecha: string;
  hora: string;
}

interface Servicio {
  id: number;
  nombre: string;
  precio: number;
}

interface Profesional {
  id: number;
  nombre: string;
}

function parseLocalDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export default function BookingUser({ onClose }: { onClose: () => void }) {
  const [telefono, setTelefono] = useState("");
  const [servicio, setServicio] = useState<Servicio | null>(null);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const [horario, setHorario] = useState<HorarioSeleccionado | null>(null);
  const [horarioConfirmado, setHorarioConfirmado] = useState(false);
  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  const [profesionalId, setProfesionalId] = useState<number | null>(null);
  const [openProfesionales, setOpenProfesionales] = useState(false);

  /* CARGAR SERVICIOS DESDE BACKEND */
  useEffect(() => {
    apiFetch("/admin/servicios")
      .then((res) => res.json())
      .then((data) => setServicios(data))
      .catch(() => setMensaje("No se pudieron cargar los servicios"));
  }, []);

  useEffect(() => {
    apiFetch("/profesionales")
      .then((res) => res.json())
      .then((data) => setProfesionales(data))
      .catch(() => setMensaje("No se pudieron cargar los profesionales"));
  }, []);

  async function reservar() {
    setMensaje("");

    const token = getToken();
    if (!token) return setMensaje("Inicia sesión nuevamente por favor");
    if (!servicio) return setMensaje("Seleccioná un servicio");
    if (!telefono.trim()) return setMensaje("Ingresá tu teléfono");
    if (!horario) return setMensaje("Seleccioná fecha y horario");
    if (!profesionalId) return setMensaje("Seleccioná un profesional");

    setLoading(true);

    try {
      const res = await apiFetch("/reservar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          telefono,
          servicio_id: servicio.id,
          horario_id: horario.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMensaje(data?.detail || "Error al reservar");
        return;
      }

      setSuccessOpen(true);
      setTelefono("");
      setServicio(null);
      setHorario(null);
      setHorarioConfirmado(false);
      setMensaje("");
    } catch {
      setMensaje("No se pudo conectar con el servidor");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h2>Reservar turno</h2>
      <div className="select-wrapper">
        <div className="custom-select">
          <button
            className="select-trigger"
            onClick={() => setOpenProfesionales(!openProfesionales)}
          >
            {profesionalId
              ? profesionales.find((p) => p.id === profesionalId)?.nombre
              : "Seleccionar profesional"}
          </button>

          {openProfesionales && (
            <div className="select-dropdown">
              {profesionales
                .filter((p) => p.id !== 2)
                .map((p) => (
                  <div
                    key={p.id}
                    className="select-option"
                    onClick={() => {
                      setProfesionalId(p.id);
                      setHorario(null);
                      setHorarioConfirmado(false);
                      setOpenProfesionales(false);
                    }}
                  >
                    {p.nombre}
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      <div className="services-grid">
        {servicios.map((s) => (
          <button
            key={s.id}
            className={`service-card ${servicio?.id === s.id ? "active" : ""}`}
            onClick={() => setServicio(s)}
          >
            {s.nombre}
          </button>
        ))}
      </div>

      <input
        placeholder="Teléfono"
        value={telefono}
        onChange={(e) => setTelefono(e.target.value)}
      />

      {profesionalId !== null && !horarioConfirmado && (
        <Calendar
          barberoId={profesionalId}
          mode="user"
          onConfirm={(h) => {
            setHorario(h);
            setHorarioConfirmado(true);
          }}
        />
      )}

      {horarioConfirmado && horario && servicio && (
        <div className="resume-box">
          <p>
            ✂️ <strong>{servicio.nombre}</strong>
          </p>
          <p>📅 {parseLocalDate(horario.fecha).toLocaleDateString("es-AR")}</p>
          <p>⏰ {horario.hora}</p>

          <button
            className="btn-secondary"
            onClick={() => {
              setHorarioConfirmado(false);
              setHorario(null);
            }}
          >
            Cambiar horario
          </button>
        </div>
      )}

      {mensaje && <p className="modal-msg">{mensaje}</p>}

      {horarioConfirmado && (
        <button className="confirm" disabled={loading} onClick={reservar}>
          {loading ? "Reservando..." : "Confirmar reserva"}
        </button>
      )}

      {successOpen && (
        <div className="success">
          <h2>¡Reserva confirmada! 🎉</h2>
          <p>Te enviamos la confirmación a tu email 📩</p>

          <button
            className="cta"
            onClick={() => {
              setSuccessOpen(false);
              onClose();
            }}
          >
            Cerrar
          </button>
        </div>
      )}
    </>
  );
}
