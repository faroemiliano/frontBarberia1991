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
import RegistroManualModal from "../RegistroManualModal";

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

  facturado_diario: number;
  ganancia_diaria: number;

  facturado_mensual: number;
  ganancia_mensual: number;
}

interface Props {
  userId: number;
}

interface Servicio {
  id: number;
  nombre: string;
  precio: number;
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
  const [registroManualOpen, setRegistroManualOpen] = useState(false);
  const [servicios, setServicios] = useState<Servicio[]>([]);
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
    const cargarServicios = async () => {
      try {
        const res = await apiFetch("/admin/servicios", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        console.log("SERVICIOS:", data);

        if (Array.isArray(data)) {
          setServicios(data);
        }
      } catch (err) {
        console.error("Error cargando servicios:", err);
      }
    };

    cargarServicios();
  }, [token]);

  useEffect(() => {
    fetchPanel();
  }, []);

  const cancelarTurno = async (id: number) => {
    const confirmar = window.confirm("¿Seguro que deseas cancelar este turno?");

    if (!confirmar) return;

    const res = await apiFetch(`/barbero/turnos/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      alert("No se pudo cancelar el turno");
      return;
    }

    fetchPanel();
  };

  if (loading) return <div className="panel-loading">Cargando...</div>;
  if (!data) return <div>Error</div>;

  const turnosFiltrados = data.turnos.filter((t) => {
    const fechaTurno = t.fecha.split("T")[0];
    return fechaTurno === fechaSeleccionada;
  });

  const facturacionDia = data.facturado_diario;
  const barberoDia = data.ganancia_diaria;
  const adminDia = facturacionDia - barberoDia;

  const facturacionMes = data.facturado_mensual;
  const barberoMes = data.ganancia_mensual;
  const adminMes = facturacionMes - barberoMes;

  const esHoy = fechaSeleccionada === hoyLocal();

  const graficoDia = [
    {
      name: "Admin",
      value: adminDia,
    },
    {
      name: "Mi ganancia",
      value: barberoDia,
    },
  ];

  const graficoMes = [
    {
      name: "Admin",
      value: adminMes,
    },
    {
      name: "Mi ganancia",
      value: barberoMes,
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
          <button
            className="btn-secondary"
            onClick={() => setRegistroManualOpen(true)}
          >
            Registrar ingreso manual
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
                {esHoy ? "Mi Ganancia Hoy" : `Mi Ganancia ${fechaSeleccionada}`}
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
                    <Cell fill="#ff9800" />
                    <Cell fill="#00c853" />
                  </Pie>

                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <div className="resumen-ganancia">
                <p>Facturado: ${facturacionDia.toLocaleString("es-AR")}</p>
                <p>Alquiler (40%): ${adminDia.toLocaleString("es-AR")}</p>
                <p>Mi ganancia (60%): ${barberoDia.toLocaleString("es-AR")}</p>
              </div>
            </div>

            <div className="grafico-box">
              <h3>Mi Ganancia del Mes</h3>

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
                    <Cell fill="#00c853" />
                  </Pie>

                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <div className="resumen-ganancia">
                <p>Facturado: ${facturacionMes.toLocaleString("es-AR")}</p>
                <p>Alquiler (40%): ${adminMes.toLocaleString("es-AR")}</p>
                <p>Mi ganancia (60%): ${barberoMes.toLocaleString("es-AR")}</p>
              </div>
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
                    <b>Facturado</b>
                  </td>
                  <td>
                    <b>${facturacionDia}</b>
                  </td>
                </tr>

                <tr>
                  <td colSpan={2}>
                    <b>Debe entregar (40%)</b>
                  </td>
                  <td>
                    <b>${adminDia}</b>
                  </td>
                </tr>

                <tr>
                  <td colSpan={2}>
                    <b>Le corresponde (60%)</b>
                  </td>
                  <td>
                    <b>${barberoDia}</b>
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
            <h2>Resumen del mes</h2>

            <table className="turnos-table">
              <tbody>
                <tr>
                  <td>
                    <b>Facturado</b>
                  </td>
                  <td>${facturacionMes.toLocaleString("es-AR")}</td>
                </tr>

                <tr>
                  <td>
                    <b>Debe entregar (40%)</b>
                  </td>
                  <td>${adminMes.toLocaleString("es-AR")}</td>
                </tr>

                <tr>
                  <td>
                    <b>Le corresponde (60%)</b>
                  </td>
                  <td>${barberoMes.toLocaleString("es-AR")}</td>
                </tr>
              </tbody>
            </table>

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

      {registroManualOpen && servicios.length > 0 && (
        <RegistroManualModal
          servicios={servicios}
          onClose={() => setRegistroManualOpen(false)}
          onSuccess={() => {
            fetchPanel();
            setRegistroManualOpen(false);
          }}
        />
      )}
    </div>
  );
}
