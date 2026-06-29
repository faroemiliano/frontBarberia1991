import { useState } from "react";
import { apiFetch } from "../api";
import { getToken } from "../auth";

interface Servicio {
  id: number;
  nombre: string;
  precio?: number;
}

interface Props {
  servicios: Servicio[];
  onClose: () => void;
  onSuccess?: () => void;
}

export default function RegistroManualModal({
  servicios,
  onClose,
  onSuccess,
}: Props) {
  const [nombre, setNombre] = useState("");
  const [servicioId, setServicioId] = useState("");
  const [precio, setPrecio] = useState("");
  const [observaciones, setObservaciones] = useState("");

  const hoy = new Date().toISOString().split("T")[0];

  const [fecha, setFecha] = useState(hoy);
  const [hora, setHora] = useState("");

  const guardar = async () => {
    try {
      const res = await apiFetch("/admin/registros-manuales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          nombre,
          servicio_id: Number(servicioId),
          precio: Number(precio),
          observaciones,
          fecha,
          hora,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.detail || "Error");
        return;
      }

      alert("Ingreso registrado");
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error al registrar");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box small">
        <h2>Registrar ingreso manual</h2>

        <div className="modal-section">
          <label>Cliente</label>
          <input
            className="auth-input"
            type="text"
            placeholder="Nombre del cliente"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>

        <div className="modal-section">
          <label>Servicio</label>

          <select
            className="service-select"
            value={servicioId}
            onChange={(e) => {
              const id = e.target.value;
              setServicioId(id);

              const servicio = servicios.find((s) => s.id === Number(id));

              if (servicio?.precio !== undefined) {
                setPrecio(String(servicio.precio));
              }
            }}
          >
            <option value="">Seleccionar servicio</option>
            {servicios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="modal-section">
          <label>Precio</label>
          <input className="auth-input" type="number" value={precio} readOnly />
        </div>

        <div className="modal-section">
          <label>Fecha</label>
          <input
            className="auth-input"
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </div>

        <div className="modal-section">
          <label>Hora</label>
          <input
            className="auth-input"
            type="time"
            value={hora}
            onChange={(e) => setHora(e.target.value)}
          />
        </div>

        <div className="modal-section">
          <label>Observaciones</label>
          <input
            className="auth-input"
            placeholder="Opcional"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
          />
        </div>

        <div className="modal-footer">
          <button className="btn-cancel-form" onClick={onClose}>
            Cancelar
          </button>

          <button className="cta" onClick={guardar}>
            Guardar ingreso
          </button>
        </div>
      </div>
    </div>
  );
}
