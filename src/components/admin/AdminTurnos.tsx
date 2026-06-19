import { useEffect, useState, useMemo } from "react";
import { getToken } from "../../auth";
import BookingModal from "../BookingModal";
import Calendar from "../Calendar";
import { apiFetch } from "../../api";
import { notifyGananciasUpdate } from "../../events/gananciasEvents";

interface Turno {
  id: number;
  nombre: string;
  telefono: string;
  fecha: string; // YYYY-MM-DD
  hora: string;
  servicio: string;
  precio: number;
  horario_id: number;
  barbero: string;
  barbero_id?: number;
}

interface Barbero {
  id: number;
  nombre: string;
}

/* =========================
   UTILIDADES DE FECHA
========================= */

function fechaLocalISO(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isoToLocalDate(fechaISO: string) {
  const [y, m, d] = fechaISO.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function moverDiaISO(fechaISO: string, delta: number) {
  const date = isoToLocalDate(fechaISO);
  date.setDate(date.getDate() + delta);
  return fechaLocalISO(date);
}

function isoToDMY(fechaISO: string) {
  const [y, m, d] = fechaISO.split("-");
  return `${d}/${m}/${y}`;
}

export default function AdminPanel() {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [servicios, setServicios] = useState<{ id: number; nombre: string }[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [turnoEditando, setTurnoEditando] = useState<Turno | null>(null);
  const [turnoAEliminar, setTurnoAEliminar] = useState<Turno | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const [diaActivo, setDiaActivo] = useState(fechaLocalISO());

  const [barberos, setBarberos] = useState<Barbero[]>([]);
  const [barberoActivo, setBarberoActivo] = useState<number | null>(null);

  const turnosDelDia = useMemo(() => {
    return turnos.filter((t) => t.fecha === diaActivo);
  }, [turnos, diaActivo]);

  const cargarTurnos = async () => {
    const res = await apiFetch("/admin/turnos", {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    setTurnos(data);
    setLoading(false);
  };

  const cancelarTurno = async (id: number) => {
    await apiFetch(`/admin/cancelar/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    notifyGananciasUpdate();
    setTurnos((prev) => prev.filter((t) => t.id !== id));
    setTurnoAEliminar(null);
  };

  useEffect(() => {
    cargarTurnos();

    apiFetch("/admin/servicios")
      .then((res) => res.json())
      .then(setServicios);

    // Traer barberos
    apiFetch("/profesionales", {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((res) => res.json())
      .then((data: Barbero[]) => {
        setBarberos(data);
        if (data.length > 0) setBarberoActivo(data[0].id);
      });
  }, []);

  if (loading) return <p>Cargando turnos...</p>;

  return (
    <section className="admin-panel">
      <div className="admin-card">
        {/* Navegación de días */}
        <div className="admin-day-nav">
          <button
            className="btn-secondary"
            onClick={() => setDiaActivo(moverDiaISO(diaActivo, -1))}
          >
            Día anterior
          </button>

          <span className="admin-day-label">{isoToDMY(diaActivo)}</span>

          <button
            className="btn-secondary"
            onClick={() => setDiaActivo(moverDiaISO(diaActivo, 1))}
          >
            Día siguiente
          </button>
        </div>

        {turnosDelDia.length === 0 && (
          <p className="no-turnos">No hay turnos para este día</p>
        )}

        <div className="admin-turnos-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Teléfono</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Servicio</th>
                <th>Barbero</th>
                <th>Precio</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {turnosDelDia.map((t) => (
                <tr key={t.id}>
                  <td data-label="Cliente">{t.nombre}</td>
                  <td data-label="Teléfono">{t.telefono}</td>
                  <td data-label="Fecha">{isoToDMY(t.fecha)}</td>
                  <td data-label="Hora">{t.hora}</td>
                  <td data-label="Servicio">{t.servicio}</td>
                  <td data-label="Barbero">{t.barbero}</td>
                  <td data-label="Precio">${t.precio.toFixed(2)}</td>
                  <td data-label="Acciones" className="admin-actions">
                    <button
                      className="btn-secondary"
                      onClick={() => setTurnoEditando(t)}
                    >
                      Editar
                    </button>

                    <button
                      className="btn-secondary"
                      onClick={() => setTurnoAEliminar(t)}
                    >
                      Cancelar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL EDITAR */}
      {turnoEditando && (
        <BookingModal
          open
          modo="editar"
          turnoInicial={{
            telefono: turnoEditando.telefono,
            servicio_id:
              servicios.find((s) => s.nombre === turnoEditando.servicio)?.id ??
              0,
            precio: turnoEditando.precio,
            horario: {
              id: turnoEditando.horario_id,
              fecha: turnoEditando.fecha,
              hora: turnoEditando.hora,
            },
          }}
          onClose={() => setTurnoEditando(null)}
          onSubmit={async ({ telefono, servicio_id, horario, precio }) => {
            if (!turnoEditando) return;

            const turnoId = turnoEditando.id;
            const precioNumber = Number(precio);

            const payload: Record<string, any> = {
              telefono,
              precio: precioNumber,
            };

            if (horario.id !== turnoEditando.horario_id) {
              payload.horario_id = horario.id;
            }

            payload.servicio_id = servicio_id;
            console.log("PAYLOAD EDIT:", payload);
            const res = await apiFetch(`/admin/turnos/${turnoId}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getToken()}`,
              },
              body: JSON.stringify(payload),
            });

            if (!res.ok) {
              alert("No se pudo actualizar");
              return;
            }
            notifyGananciasUpdate();
            setTurnos((prev) =>
              prev.map((t) =>
                t.id === turnoId
                  ? {
                      ...t,
                      telefono,
                      servicio:
                        servicios.find((s) => s.id === servicio_id)?.nombre ??
                        turnoEditando.servicio,
                      precio: precioNumber,
                      fecha: horario.fecha,
                      hora: horario.hora,
                      horario_id: horario.id,
                    }
                  : t,
              ),
            );

            setTurnoEditando(null);
          }}
        />
      )}

      {/* Gestión de horarios */}
      <div className="admin-card compact">
        <div className="admin-header">
          <button
            className="btn-secondary"
            onClick={() => setCalendarOpen(true)}
          >
            Gestionar horarios
          </button>
        </div>
      </div>

      {/* MODAL CANCELAR */}
      {turnoAEliminar && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2>Cancelar turno</h2>
            <p>
              ¿Cancelar el turno de <strong>{turnoAEliminar.nombre}</strong>?
            </p>
            <p>
              {isoToDMY(turnoAEliminar.fecha)} {turnoAEliminar.hora}
            </p>
            <div className="modal-actions">
              <button onClick={() => setTurnoAEliminar(null)}>Volver</button>
              <button
                className="btn-secondary"
                onClick={() => cancelarTurno(turnoAEliminar.id)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CALENDARIO */}
      {calendarOpen && barberoActivo && (
        <div className="modal-overlay">
          <div className="modal-box large">
            <h2>Bloquear / Desbloquear horarios</h2>

            {/* Selector de barbero */}
            <select
              value={barberoActivo}
              onChange={(e) => setBarberoActivo(Number(e.target.value))}
            >
              {barberos.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nombre}
                </option>
              ))}
            </select>

            {/* Calendar recibe barberoId */}
            {calendarOpen && barberoActivo && (
              <Calendar mode="admin" barberoId={barberoActivo} />
            )}

            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setCalendarOpen(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
