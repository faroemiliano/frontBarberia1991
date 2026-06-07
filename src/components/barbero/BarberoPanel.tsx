import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Calendar from "../Calendar";
import BookingModal from "../BookingModal";
import { apiFetch } from "../../api";

interface Turno {
  id: number;
  cliente: string;
  telefono: string;
  fecha: string;
  hora: string;
  horario_id: number;
  servicio: string;
  servicio_id: number;
  barbero_id: number;
  precio: number;
}

interface PanelData {
  turnos: Turno[];
  dinero_diario: number;
  dinero_mensual: number;
}

interface Props {
  userId: number;
}

function isoToLocalDate(fechaISO: string) {
  const [y, m, d] = fechaISO.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function moverDiaISO(fechaISO: string, delta: number) {
  const date = isoToLocalDate(fechaISO);
  date.setDate(date.getDate() + delta);

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  return `${y}-${m}-${d}`;
}

function isoToDMY(fechaISO: string) {
  const [y, m, d] = fechaISO.split("-");
  return `${d}/${m}/${y}`;
}

export default function BarberoPanel({}: Props) {
  const [data, setData] = useState<PanelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [turnoEditando, setTurnoEditando] = useState<Turno | null>(null);
  const [modalGraficoOpen, setModalGraficoOpen] = useState(false);
  const [modalMesOpen, setModalMesOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [vista, setVista] = useState<"inicio" | "gestiones">("inicio");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const barberoId = user?.id;
  const hoyLocal = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0",
    )}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const [fechaSeleccionada, setFechaSeleccionada] = useState(hoyLocal());
  const token = localStorage.getItem("token");

  const fetchPanel = async () => {
    try {
      const res = await apiFetch("/panel-barbero", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPanel();
  }, []);

  const cancelarTurno = async (id: number) => {
    await apiFetch(`/barbero/turnos/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchPanel();
  };

  if (loading) return <div className="panel-loading">Cargando...</div>;
  if (!data) return <div>Error</div>;

  const turnosFiltrados = data.turnos.filter((t) => {
    const fechaTurno = t.fecha.split("T")[0];
    return fechaTurno === fechaSeleccionada;
  });

  const gananciaDelDia = turnosFiltrados.reduce(
    (acc, turno) => acc + turno.precio,
    0,
  );

  const fechaObj = new Date(fechaSeleccionada);

  const gananciaDelMesSeleccionado = data.turnos
    .filter((t) => {
      const fechaTurno = new Date(t.fecha);
      return (
        fechaTurno.getMonth() === fechaObj.getMonth() &&
        fechaTurno.getFullYear() === fechaObj.getFullYear()
      );
    })
    .reduce((acc, turno) => acc + turno.precio, 0);

  const esHoy = fechaSeleccionada === hoyLocal();

  const graficoDia = [
    {
      name: esHoy ? "Hoy" : fechaSeleccionada,
      value: gananciaDelDia,
    },
  ];

  const graficoMes = [
    {
      name: "Mes",
      value: gananciaDelMesSeleccionado,
    },
  ];

  return (
    <div className="panel-container">
      <div className="admin-card">
        <h1 className="admin-title">Panel del Barbero</h1>

        <div className="admin-nav-buttons">
          <button className="btn-secondary" onClick={() => setVista("inicio")}>
            Inicio
          </button>

          <button
            className="btn-secondary"
            onClick={() => setVista("gestiones")}
          >
            Gestiones
          </button>
        </div>
      </div>

      {/* VISTA INICIO */}
      {vista === "inicio" && (
        <div className="admin-agenda">
          <h2 className="agenda-title">Agenda</h2>

          <Calendar mode="barbero" barberoId={barberoId} />
        </div>
      )}

      {/* VISTA GESTIONES */}
      {vista === "gestiones" && (
        <>
          <div className="admin-card">
            <div className="admin-day-nav">
              <button
                className="btn-secondary"
                onClick={() =>
                  setFechaSeleccionada(moverDiaISO(fechaSeleccionada, -1))
                }
              >
                Día anterior
              </button>

              <span className="admin-day-label">
                {isoToDMY(fechaSeleccionada)}
              </span>

              <button
                className="btn-secondary"
                onClick={() =>
                  setFechaSeleccionada(moverDiaISO(fechaSeleccionada, 1))
                }
              >
                Día siguiente
              </button>
            </div>

            <div className="admin-turnos-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Teléfono</th>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Servicio</th>
                    <th>Precio</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {turnosFiltrados.map((turno) => (
                    <tr key={turno.id}>
                      <td data-label="Cliente">{turno.cliente}</td>
                      <td data-label="Telefono">{turno.telefono}</td>
                      <td data-label="Fecha">{turno.fecha}</td>
                      <td data-label="Hora">{turno.hora}</td>
                      <td data-label="Servicio">{turno.servicio}</td>
                      <td data-label="Precio">${turno.precio}</td>

                      <td>
                        <button
                          className="btn-secondary"
                          onClick={() => setTurnoEditando(turno)}
                        >
                          Editar
                        </button>

                        <button
                          className="btn-secondary"
                          onClick={() => cancelarTurno(turno.id)}
                        >
                          Cancelar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              className="btn-secondary"
              onClick={() => setCalendarOpen(true)}
            >
              Gestionar horarios
            </button>
          </div>

          <div className="graficos-container">
            <div className="grafico-box">
              <h3>
                {esHoy ? "Ganancia Hoy" : `Ganancia ${fechaSeleccionada}`}
              </h3>

              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={graficoDia}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    onClick={() => setModalGraficoOpen(true)}
                  >
                    <Cell fill="#00c853" />
                  </Pie>

                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grafico-box">
              <h3>Ganancia del Mes</h3>

              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={graficoMes}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    onClick={() => setModalMesOpen(true)}
                  >
                    <Cell fill="#2962ff" />
                  </Pie>

                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {calendarOpen && (
        <div className="modal-overlay">
          <div className="modal-box large">
            <h2>Bloquear / Desbloquear horarios</h2>
            <Calendar mode="barbero" barberoId={barberoId} />
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

      {modalGraficoOpen && (
        <div className="modal-overlay">
          <div className="modal-box large">
            <h2>Detalle de turnos</h2>

            <table className="turnos-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Servicio</th>
                  <th>Precio</th>
                </tr>
              </thead>

              <tbody>
                {turnosFiltrados.map((t) => (
                  <tr key={t.id}>
                    <td>{t.cliente}</td>
                    <td>{t.servicio}</td>
                    <td>${t.precio}</td>
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr>
                  <td colSpan={2}>
                    <b>Total</b>
                  </td>
                  <td>
                    <b>${gananciaDelDia}</b>
                  </td>
                </tr>
              </tfoot>
            </table>

            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setModalGraficoOpen(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {modalMesOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2>Ganancia total del mes</h2>

            <div
              style={{
                textAlign: "center",
                fontSize: "28px",
                margin: "20px 0",
              }}
            >
              ${gananciaDelMesSeleccionado}
            </div>

            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setModalMesOpen(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {turnoEditando && (
        <BookingModal
          open
          modo="editar"
          turnoInicial={{
            telefono: turnoEditando.telefono,
            servicio_id: turnoEditando.servicio_id,
            precio: turnoEditando.precio,
            barbero_id: turnoEditando.barbero_id,
            horario: {
              id: turnoEditando.horario_id,
              fecha: turnoEditando.fecha,
              hora: turnoEditando.hora,
            },
          }}
          onClose={() => setTurnoEditando(null)}
          onSubmit={async ({ servicio_id, horario }) => {
            const payload: any = {};

            if (horario.id !== turnoEditando.horario_id) {
              payload.fecha = horario.fecha;
              payload.hora = horario.hora;
            }

            if (servicio_id !== turnoEditando.servicio_id) {
              payload.servicio_id = servicio_id;
            }

            const res = await apiFetch(`/barbero/turnos/${turnoEditando.id}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(payload),
            });

            if (!res.ok) {
              alert("No se pudo actualizar");
              return;
            }

            fetchPanel();
            setTurnoEditando(null);
          }}
        />
      )}
    </div>
  );
}
