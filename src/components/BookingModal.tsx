import Calendar from "./Calendar";
import { useState, useEffect } from "react";
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

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  modo: "crear" | "editar";
  soloHorarioYServicio?: boolean;
  turnoInicial?: {
    telefono: string;
    servicio_id: number;
    precio: number;
    horario: HorarioSeleccionado | null;
    barbero_id?: number;
  };
  onSubmit: (data: {
    telefono: string;
    servicio_id: number;
    precio: number;
    horario: HorarioSeleccionado;
  }) => Promise<void>;
}

export default function BookingModal({
  open,
  onClose,
  modo,
  turnoInicial,
  soloHorarioYServicio = false,
  onSubmit,
}: BookingModalProps) {
  const [telefono, setTelefono] = useState("");
  const [servicio, setServicio] = useState<Servicio | null>(null);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [precio, setPrecio] = useState(0);
  const [horario, setHorario] = useState<HorarioSeleccionado | null>(null);
  const [editandoHorario, setEditandoHorario] = useState(false);
  const [loading, setLoading] = useState(false);

  const barberoId = turnoInicial?.barbero_id ?? null;
  console.log("BARBERO ID EN MODAL:", barberoId);
  useEffect(() => {
    apiFetch("/admin/servicios")
      .then((res) => res.json())
      .then((data) => {
        console.log("🟦 SERVICIOS CARGADOS:", data);
        setServicios(data);
      });
  }, []);

  useEffect(() => {
    if (!open) return;

    console.log("🟢 MODAL OPEN");
    console.log("➡️ turnoInicial:", turnoInicial);
    console.log("➡️ servicios actuales:", servicios);

    if (turnoInicial) {
      setTelefono(turnoInicial.telefono);
      setPrecio(turnoInicial.precio ?? 0);
      setHorario(turnoInicial.horario);
      const servicioEncontrado = servicios.find(
        (s) => s.id === turnoInicial.servicio_id,
      );

      console.log("🟡 SERVICIO MATCH:", servicioEncontrado);

      setServicio(servicioEncontrado ?? null);

      console.log("🟣 BARBERO ID SET:", turnoInicial.barbero_id);
    } else {
      console.log("⚠️ NO HAY TURNO INICIAL (modo crear)");
      setTelefono("");
      setServicio(null);
      setPrecio(0);
      setHorario(null);
    }
  }, [open, turnoInicial, servicios]);

  if (!open) return null;

  async function handleSubmit() {
    console.log("🟢 SUBMIT CLICKED");
    console.log("➡️ horario:", horario);
    console.log("➡️ servicio:", servicio);

    if (!horario || !servicio) {
      console.log("❌ FALTA HORARIO O SERVICIO");
      return;
    }

    setLoading(true);

    await onSubmit({
      telefono,
      servicio_id: servicio.id,
      precio,
      horario: horario!,
    });

    setLoading(false);
    onClose();
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <button className="modal-close" onClick={onClose}>
          X
        </button>

        <h2>{modo === "editar" ? "Editar turno" : "Nuevo turno"}</h2>

        <div className="services-grid">
          {servicios.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`service-card ${servicio?.id === s.id ? "active" : ""}`}
              onClick={() => {
                console.log("🟡 SERVICIO CLICK:", s);
                setServicio(s);
                setPrecio(s.precio);
              }}
            >
              {s.nombre}
            </button>
          ))}
        </div>

        <input
          placeholder="Teléfono"
          value={telefono}
          disabled={soloHorarioYServicio}
          onChange={(e) => {
            console.log("📞 TEL:", e.target.value);
            setTelefono(e.target.value);
          }}
        />

        <input
          type="number"
          placeholder="Precio"
          min={0}
          value={precio}
          disabled={soloHorarioYServicio}
          onChange={(e) => {
            console.log("💰 PRECIO:", e.target.value);
            setPrecio(e.target.value === "" ? 0 : Number(e.target.value));
          }}
        />

        {horario && !editandoHorario && (
          <>
            <div className="horario-resumen">
              <div>
                <p>
                  📅 {horario?.fecha} <br />
                  🕒 {horario?.hora}
                </p>
              </div>

              {/* <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setEditandoHorario(true);
                }}
              >
                Cambiar día y hora
              </button> */}
            </div>

            <button
              className="confirm"
              disabled={loading}
              onClick={handleSubmit}
            >
              {loading
                ? "Guardando..."
                : modo === "editar"
                  ? "Guardar cambios"
                  : "Confirmar reserva"}
            </button>
          </>
        )}

        {editandoHorario && (
          <Calendar
            mode="admin"
            barberoId={barberoId ?? undefined}
            onConfirm={(h) => {
              setHorario(h);
              setEditandoHorario(false);
            }}
          />
        )}
      </div>
    </div>
  );
}
