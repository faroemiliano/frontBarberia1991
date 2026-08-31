import { useEffect, useState } from "react";
import { getToken } from "../auth";
import { apiFetch } from "../api";

interface Turno {
  id: number;
  fecha: string;
  hora: string;
  servicio: string;
  precio: number;
  barbero: string;
}

export default function MisTurnos({ onClose }: { onClose: () => void }) {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [mensaje, setMensaje] = useState("");

  const token = getToken();

  async function cargarTurnos() {
    if (!token) return;

    try {
      const res = await apiFetch("/mis-turnos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTurnos(data);
    } catch {
      setMensaje("Error cargando turnos");
    }
  }

  async function cancelarTurno(id: number) {
    if (!token) return;
    if (!window.confirm("¿Seguro que querés cancelar este turno?")) return;

    try {
      const res = await apiFetch(`/cancelar-turno/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.detail);
        return;
      }
      cargarTurnos();
    } catch {
      alert("Error al cancelar");
    }
  }

  function parseLocalDate(dateStr: string) {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  useEffect(() => {
    cargarTurnos();
  }, []);

  const ultimosTresTurnos = [...turnos]
    .sort((a, b) => {
      const fechaA = new Date(`${a.fecha}T${a.hora}`);
      const fechaB = new Date(`${b.fecha}T${b.hora}`);
      return fechaB.getTime() - fechaA.getTime();
    })
    .slice(0, 3);
  return (
    <div className="modal-form-overlay">
      <div className="modal-form-content admin-card mis-turnos-modal">
        <h2 className="modal-title">Mis turnos</h2>
        {mensaje && <p className="modal-message error">{mensaje}</p>}
        {turnos.length === 0 && (
          <p className="modal-message">No tenés turnos reservados</p>
        )}

        <div className="turnos-form">
          {ultimosTresTurnos.map((t) => (
            <div key={t.id} className="turno-form-card">
              <div>
                <label>SERVICIO:</label>
                <input type="text" readOnly value={t.servicio} />
              </div>

              <p>
                <span className="chip">
                  📅 {parseLocalDate(t.fecha).toLocaleDateString("es-AR")}
                </span>
                <span className="chip">⏰ {t.hora}</span>
              </p>
              <div>
                <label>PRECIO:</label>
                <input type="text" readOnly value={`$${t.precio}`} />
              </div>
              <p>
                <span className="chip">💈 {t.barbero}</span>
              </p>

              <button
                type="button"
                className="btn-cancel-form"
                onClick={() => cancelarTurno(t.id)}
              >
                Cancelar turno
              </button>
            </div>
          ))}
        </div>

        <button className="btn-secondary" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
}
