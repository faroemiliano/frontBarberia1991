import { useEffect, useState } from "react";
import { apiFetch } from "../api";

interface Horario {
  id: number;
  fecha: string;
  hora: string;
  disponible: boolean;
}

interface Props {
  onConfirm?: (horario: { id: number; fecha: string; hora: string }) => void;
  mode?: "user" | "admin" | "barbero";
  barberoId?: number;
}

function parseLocalDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function todayISO() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function Calendar({
  onConfirm,
  mode = "user",
  barberoId,
}: Props) {
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [dias, setDias] = useState<string[]>([]);
  const [diaActivo, setDiaActivo] = useState<string | null>(null);
  const [horarioActivo, setHorarioActivo] = useState<Horario | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  const DIAS_POR_PAGINA = 5;

  async function toggleHorario(h: Horario) {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await apiFetch(
        mode === "admin"
          ? `/admin/horarios/${h.id}/toggle`
          : `/barbero/horarios/${h.id}/toggle`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!res.ok) throw new Error("Error al cambiar horario");

      const data: { disponible: boolean } = await res.json();

      setHorarios((prev) =>
        prev.map((x) =>
          x.id === h.id ? { ...x, disponible: data.disponible } : x,
        ),
      );
    } catch {
      alert("No se pudo cambiar el horario");
    }
  }

  useEffect(() => {
    async function cargarHorarios() {
      // 👇 BLOQUEO TOTAL ANTES DE PEGARLE AL BACK
      if (mode === "admin" && !barberoId) {
        setLoading(false);
        return;
      }

      if (mode === "barbero" && !barberoId) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const token = localStorage.getItem("token");
        const headers =
          token && (mode === "admin" || mode === "barbero")
            ? { Authorization: `Bearer ${token}` }
            : undefined;

        let path = "";

        if (mode === "admin") {
          if (!barberoId) {
            throw new Error("Falta barberoId en modo admin");
          }
          path = `/admin/calendario-admin/${barberoId}`;
        } else if (mode === "barbero") {
          path = `/barbero/horarios`;
        } else {
          path = `/calendario/${barberoId ?? ""}`;
        }

        console.log("📌 MODE:", mode);
        console.log("📌 BARBERO ID:", barberoId);
        console.log("📌 PATH:", path);

        const res = await apiFetch(path, { headers });

        if (!res.ok) {
          const text = await res.text();
          console.error("❌ BACKEND ERROR:", text);
          throw new Error("Error cargando horarios");
        }

        const data: Horario[] = await res.json();

        setHorarios(data);

        const uniqueDays = Array.from(new Set(data.map((h) => h.fecha))).sort();
        setDias(uniqueDays);

        const hoy = todayISO();
        const indexHoy = uniqueDays.findIndex((d) => d >= hoy);

        setPage(indexHoy !== -1 ? Math.floor(indexHoy / DIAS_POR_PAGINA) : 0);

        setDiaActivo(
          indexHoy !== -1 ? uniqueDays[indexHoy] : (uniqueDays[0] ?? null),
        );
      } catch (err) {
        console.error("❌ Calendar error:", err);
        setHorarios([]);
        setDias([]);
        setDiaActivo(null);
      } finally {
        setLoading(false);
      }
    }

    cargarHorarios();
  }, [mode, barberoId]);

  const inicio = page * DIAS_POR_PAGINA;
  const fin = inicio + DIAS_POR_PAGINA;

  const diasVisibles = dias.slice(inicio, fin);

  const horariosDelDia = horarios.filter((h) => {
    if (h.fecha !== diaActivo) return false;

    if (mode !== "user") return true;

    const ahora = new Date();

    const [y, m, d] = h.fecha.split("-").map(Number);
    const [hh, mm] = h.hora.split(":").map(Number);

    const fechaHorario = new Date(y, m - 1, d, hh, mm);

    return fechaHorario > ahora;
  });

  const hayDisponibles = horarios.some((h) => h.disponible);

  if (loading) return <p>Cargando horarios...</p>;

  if (!loading && dias.length === 0) {
    return <p>No se pudieron cargar los horarios</p>;
  }

  if (!loading && !hayDisponibles && mode === "user") {
    return (
      <div className="no-slots">
        <h4>😕 Sin turnos disponibles</h4>
        <p>
          Todos los horarios de estos días ya están ocupados.
          <br />
          Probá nuevamente más adelante.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="week-nav">
        <button
          disabled={page === 0}
          onClick={() => {
            setPage((p) => p - 1);
            setDiaActivo(null);
            setHorarioActivo(null);
          }}
        >
          ⬅️
        </button>

        <button
          disabled={fin >= dias.length}
          onClick={() => {
            setPage((p) => p + 1);
            setDiaActivo(null);
            setHorarioActivo(null);
          }}
        >
          ➡️
        </button>
      </div>

      <div className="days-grid">
        {diasVisibles.map((d) => {
          const date = parseLocalDate(d);

          return (
            <button
              key={d}
              className={`day-card ${diaActivo === d ? "active" : ""}`}
              onClick={() => {
                setDiaActivo(d);
                setHorarioActivo(null);
              }}
            >
              <span className="day-name">
                {date.toLocaleDateString("es-AR", { weekday: "short" })}
              </span>

              <span className="day-number">{date.getDate()}</span>

              <span className="day-month">
                {date.toLocaleDateString("es-AR", { month: "short" })}
              </span>
            </button>
          );
        })}
      </div>

      {diaActivo && (
        <>
          {horariosDelDia.length === 0 ? (
            <p className="no-hours">
              No hay horarios disponibles para este día
            </p>
          ) : (
            <div className="hours-grid">
              {horariosDelDia.map((h) => (
                <button
                  key={`${h.id}-${h.hora}`}
                  className={`hour-card ${
                    horarioActivo?.id === h.id ? "active" : ""
                  } ${!h.disponible ? "blocked" : ""}`}
                  onClick={() => {
                    if (mode === "admin" || mode === "barbero") {
                      toggleHorario(h);
                    } else if (h.disponible) {
                      setHorarioActivo(h);
                    }
                  }}
                >
                  {h.hora.slice(0, 5)}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {mode === "user" && horarioActivo && (
        <button
          className="confirm"
          onClick={() =>
            onConfirm?.({
              id: horarioActivo.id,
              fecha: horarioActivo.fecha,
              hora: horarioActivo.hora,
            })
          }
        >
          Confirmar horario
        </button>
      )}
    </>
  );
}
