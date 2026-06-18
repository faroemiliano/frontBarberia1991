import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getToken } from "../../auth";
import { apiFetch } from "../../api";

/* =====================
   TIPOS
===================== */

interface GananciaServicio {
  servicio: string;
  total: number;
}

interface DetalleTurno {
  nombre: string;
  servicio: string;
  precio: number;

  admin_propia: number;
  admin_alquiler: number;

  barbero: number;
}

/* =====================
   UTILIDADES FECHA
===================== */

function fechaLocalISO(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isoToDMY(fecha: string) {
  const [y, m, d] = fecha.split("-");
  return `${d}/${m}/${y}`;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

/* =====================
   MODAL TOTAL MES
===================== */

function ModalTotalMes({
  total,
  gananciaAdminPropia,
  gananciaAdminAlquiler,
  gananciaAdminTotal,
  gananciaBarberos,
  onClose,
}: {
  total: number;
  gananciaAdminPropia: number;
  gananciaAdminAlquiler: number;
  gananciaAdminTotal: number;
  gananciaBarberos: number;
  onClose: () => void;
}) {
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>Resumen del mes</h3>

        <p>
          <b>Facturación total:</b>${total.toLocaleString("es-AR")}
        </p>

        <p>
          <b>Trabajos realizados por mí:</b>$
          {gananciaAdminPropia.toLocaleString("es-AR")}
        </p>

        <p>
          <b>Ingreso por alquiler (40%):</b>$
          {gananciaAdminAlquiler.toLocaleString("es-AR")}
        </p>

        <p>
          <b>Ganancia total admin:</b>$
          {gananciaAdminTotal.toLocaleString("es-AR")}
        </p>

        <p>
          <b>Ganancia del barberos:</b>$
          {gananciaBarberos.toLocaleString("es-AR")}
        </p>

        <button className="btn-secondary" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
}

/* =====================
   MODAL DETALLE
===================== */

function ModalDetalle({
  fecha,
  onClose,
}: {
  fecha: string;
  onClose: () => void;
}) {
  const [data, setData] = useState<DetalleTurno[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`/admin/ganancias/detalle?fecha=${fecha}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => r.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      });
  }, [fecha]);

  /* TOTAL DEL DIA */
  const total = data.reduce((acc, t) => acc + t.precio, 0);

  const totalAdminPropia = data.reduce((acc, t) => acc + t.admin_propia, 0);

  const totalAdminAlquiler = data.reduce((acc, t) => acc + t.admin_alquiler, 0);

  const totalAdmin = totalAdminPropia + totalAdminAlquiler;

  const totalBarberos = data.reduce((acc, t) => acc + t.barbero, 0);

  return (
    <div className="modal-overlay">
      <div className="modal-box large">
        <div className="modal-detalle">
          <h3 className="modal-detalle-titulo">Detalle — {isoToDMY(fecha)}</h3>

          {loading ? (
            <p className="modal-detalle-loading">Cargando...</p>
          ) : (
            <>
              <div className="modal-detalle-tabla-scroll">
                <table className="modal-detalle-tabla">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Servicio</th>
                      <th className="precio">Precio</th>
                    </tr>
                  </thead>

                  <tbody>
                    {data.map((t, i) => (
                      <tr key={i}>
                        <td>{t.nombre}</td>
                        <td>{t.servicio}</td>
                        <td className="precio">
                          ${t.precio.toLocaleString("es-AR")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="modal-detalle-total">
                Facturación total: ${total.toLocaleString("es-AR")}
              </div>
              <div className="modal-detalle-total">
                Trabajos realizados por mí: $
                {totalAdminPropia.toLocaleString("es-AR")}
              </div>

              <div className="modal-detalle-total">
                Ingresos por alquiler: $
                {totalAdminAlquiler.toLocaleString("es-AR")}
              </div>

              <div className="modal-detalle-total">
                Ganancia total admin: ${totalAdmin.toLocaleString("es-AR")}
              </div>

              <div className="modal-detalle-total">
                Ganancia barberos: ${totalBarberos.toLocaleString("es-AR")}
              </div>
            </>
          )}
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

/* =====================
   GRAFICO PIE
===================== */

function GraficoPie({
  tipo,
  fecha,
  setFecha,
}: {
  tipo: "dia" | "mes";
  fecha: Date;
  setFecha: React.Dispatch<React.SetStateAction<Date>>;
}) {
  const [data, setData] = useState<GananciaServicio[]>([]);
  const [total, setTotal] = useState(0);
  const [gananciaAdminPropia, setGananciaAdminPropia] = useState(0);

  const [gananciaAdminAlquiler, setGananciaAdminAlquiler] = useState(0);

  const [gananciaAdminTotal, setGananciaAdminTotal] = useState(0);

  const [gananciaBarberos, setGananciaBarberos] = useState(0);
  const [modalDetalleOpen, setModalDetalleOpen] = useState(false);
  const [modalMesOpen, setModalMesOpen] = useState(false);

  /* ===== cargar datos ===== */
  const cargarDatos = async () => {
    const fechaISO = fechaLocalISO(fecha);
    const mesISO = fechaISO.slice(0, 7);

    let urlGrafico = `/admin/ganancias/grafico?tipo=${tipo}`;
    let urlTotal = `/admin/ganancias?tipo=${tipo}`;

    if (tipo === "dia") {
      urlGrafico += `&fecha=${fechaISO}`;
      urlTotal += `&fecha=${fechaISO}`;
    } else {
      urlGrafico += `&mes=${mesISO}`;
      urlTotal += `&mes=${mesISO}`;
    }

    const [graficoRes, totalRes] = await Promise.all([
      apiFetch(urlGrafico, {
        headers: { Authorization: `Bearer ${getToken()}` },
      }),
      apiFetch(urlTotal, {
        headers: { Authorization: `Bearer ${getToken()}` },
      }),
    ]);

    const graficoJson: GananciaServicio[] = await graficoRes.json();
    const totalJson = await totalRes.json();

    setData(graficoJson);
    setTotal(totalJson.facturacion_total || 0);

    setGananciaAdminPropia(totalJson.ganancia_admin_propia || 0);

    setGananciaAdminAlquiler(totalJson.ganancia_admin_alquiler || 0);

    setGananciaAdminTotal(totalJson.ganancia_admin_total || 0);

    setGananciaBarberos(totalJson.ganancia_barberos || 0);
  };
  /* ===== useEffect que depende directamente de fecha y tipo ===== */
  useEffect(() => {
    cargarDatos();
  }, [fecha, tipo]);

  /* ===== mover día/mes ===== */
  const moverDia = (delta: number) => {
    setFecha((prev) => {
      const nueva = new Date(prev);
      nueva.setDate(nueva.getDate() + delta);
      return nueva;
    });
  };

  const moverMes = (delta: number) => {
    setFecha((prev) => {
      const nueva = new Date(prev);
      nueva.setMonth(nueva.getMonth() + delta);
      return nueva;
    });
  };

  return (
    <div className="grafico-wrapper">
      <h3 className="grafico-title">
        {tipo === "dia" ? "Ganancias del Día" : "Ganancias del Mes"}
      </h3>

      {/* navegación día */}
      {tipo === "dia" && (
        <div className="grafico-fecha">
          <button onClick={() => moverDia(-1)}>◀</button>
          <span>{isoToDMY(fechaLocalISO(fecha))}</span>
          <button onClick={() => moverDia(1)}>▶</button>
        </div>
      )}

      {/* navegación mes */}
      {tipo === "mes" && (
        <div className="grafico-fecha">
          <button onClick={() => moverMes(-1)}>◀</button>
          <span>
            {fecha.toLocaleDateString("es-AR", {
              month: "long",
              year: "numeric",
            })}
          </span>
          <button onClick={() => moverMes(1)}>▶</button>
        </div>
      )}

      <div className="grafico-container">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="servicio"
              cx="50%"
              cy="50%"
              outerRadius={85}
              onClick={() => {
                if (tipo === "dia") setModalDetalleOpen(true);
                if (tipo === "mes") setModalMesOpen(true);
              }}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="resumen-ganancia">
        <p>Facturación total: ${total.toLocaleString("es-AR")}</p>

        <p>
          Trabajos realizados por mí: $
          {gananciaAdminPropia.toLocaleString("es-AR")}
        </p>

        <p>
          Ingreso por alquiler (40%): $
          {gananciaAdminAlquiler.toLocaleString("es-AR")}
        </p>

        <p>
          Ganancia total admin: ${gananciaAdminTotal.toLocaleString("es-AR")}
        </p>

        <p>
          Ganancia barberos (60%): ${gananciaBarberos.toLocaleString("es-AR")}
        </p>
      </div>

      {/* MODALES */}
      {modalDetalleOpen && tipo === "dia" && (
        <ModalDetalle
          fecha={fechaLocalISO(fecha)}
          onClose={() => setModalDetalleOpen(false)}
        />
      )}

      {modalMesOpen && tipo === "mes" && (
        <ModalTotalMes
          total={total}
          gananciaAdminPropia={gananciaAdminPropia}
          gananciaAdminAlquiler={gananciaAdminAlquiler}
          gananciaAdminTotal={gananciaAdminTotal}
          gananciaBarberos={gananciaBarberos}
          onClose={() => setModalMesOpen(false)}
        />
      )}
    </div>
  );
}

/* =====================
   COMPONENTE PRINCIPAL
===================== */

export default function AdminGanancias() {
  const [fechaDia, setFechaDia] = useState(new Date());
  const [fechaMes, setFechaMes] = useState(new Date());

  return (
    <div className="admin-card">
      <h2>Ganancias</h2>

      <div className="admin-graficos">
        <GraficoPie tipo="dia" fecha={fechaDia} setFecha={setFechaDia} />
        <GraficoPie tipo="mes" fecha={fechaMes} setFecha={setFechaMes} />
      </div>
    </div>
  );
}
