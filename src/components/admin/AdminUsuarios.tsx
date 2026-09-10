import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../../api";

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
}

type FiltroEstado = "todos" | "activos" | "inactivos";

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [emailUsuario, setEmailUsuario] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("todos");
  const [actualizandoId, setActualizandoId] = useState<number | null>(null);

  const token = localStorage.getItem("token");

  const cargarUsuarios = useCallback(async () => {
    try {
      const res = await apiFetch("/admin/usuarios", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("No se pudieron cargar los usuarios");

      const data: Usuario[] = await res.json();
      const ordenados = data.sort((a, b) => a.nombre.localeCompare(b.nombre));

      setUsuarios(ordenados);
    } catch {
      setMensaje("No se pudieron cargar los usuarios");
    }
  }, [token]);

  function buscarUsuario() {
    return usuarios.find(
      (u) => u.email.toLowerCase() === emailUsuario.toLowerCase(),
    );
  }

  async function cambiarRol(rol: string) {
    setMensaje("");

    const usuario = buscarUsuario();

    if (!usuario) {
      setMensaje("No existe un usuario con ese email");
      return;
    }

    await apiFetch(`/admin/cambiar-rol/${usuario.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ rol }),
    });

    setMensaje(
      rol === "barbero"
        ? "Usuario convertido en barbero"
        : "Barbero removido correctamente",
    );

    setEmailUsuario("");
    cargarUsuarios();
  }

  async function cambiarEstado(usuario: Usuario) {
    setMensaje("");
    setActualizandoId(usuario.id);

    try {
      const res = await apiFetch(`/admin/usuarios/${usuario.id}/estado`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ activo: !usuario.activo }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.detail || "No se pudo actualizar el usuario");
      }

      setUsuarios((actuales) =>
        actuales.map((u) =>
          u.id === usuario.id ? { ...u, activo: !usuario.activo } : u,
        ),
      );
      setMensaje(
        usuario.activo
          ? `${usuario.nombre} quedó fuera del conteo activo`
          : `${usuario.nombre} volvió al conteo activo`,
      );
    } catch (error) {
      setMensaje(
        error instanceof Error ? error.message : "No se pudo actualizar el usuario",
      );
    } finally {
      setActualizandoId(null);
    }
  }

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  const totalUsuarios = usuarios.length;
  const usuariosActivos = usuarios.filter((u) => u.activo).length;
  const usuariosInactivos = totalUsuarios - usuariosActivos;
  const termino = busqueda.trim().toLocaleLowerCase("es");
  const usuariosFiltrados = usuarios.filter((u) => {
    const coincideBusqueda =
      !termino ||
      u.nombre.toLocaleLowerCase("es").includes(termino) ||
      u.email.toLocaleLowerCase("es").includes(termino);
    const coincideEstado =
      filtroEstado === "todos" ||
      (filtroEstado === "activos" && u.activo) ||
      (filtroEstado === "inactivos" && !u.activo);

    return coincideBusqueda && coincideEstado;
  });

  return (
    <div className="admin-card admin-users-page">
      <div className="admin-users-heading">
        <div>
          <span className="admin-users-kicker">Clientes y equipo</span>
          <h2>Gestión de usuarios</h2>
          <p>Administrá roles y distinguí quiénes siguen activos en la barbería.</p>
        </div>
      </div>

      <div className="admin-users-stats" aria-label="Resumen de usuarios">
        <article>
          <span>Total</span>
          <strong>{totalUsuarios}</strong>
        </article>
        <article className="is-active">
          <span>Activos</span>
          <strong>{usuariosActivos}</strong>
        </article>
        <article className="is-inactive">
          <span>Inactivos</span>
          <strong>{usuariosInactivos}</strong>
        </article>
      </div>

      <div className="admin-barbero-form">
        <h3>Gestionar barberos</h3>

        <input
          type="email"
          placeholder="Email del usuario"
          value={emailUsuario}
          onChange={(e) => setEmailUsuario(e.target.value)}
        />

        <div className="admin-barbero-actions">
          <button
            className="admin-btn-barbero"
            onClick={() => cambiarRol("barbero")}
          >
            Convertir en barbero
          </button>

          <button
            className="admin-btn-cliente"
            onClick={() => cambiarRol("cliente")}
          >
            Quitar barbero
          </button>
        </div>

        {mensaje && <p className="admin-msg">{mensaje}</p>}
      </div>

      <div className="admin-users-toolbar">
        <label className="admin-users-search">
          <span>Buscar usuario</span>
          <input
            type="search"
            placeholder="Nombre o email..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </label>

        <label className="admin-users-filter">
          <span>Estado</span>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value as FiltroEstado)}
          >
            <option value="todos">Todos</option>
            <option value="activos">Activos</option>
            <option value="inactivos">Inactivos</option>
          </select>
        </label>
      </div>

      <div className="admin-users-results">
        Mostrando {usuariosFiltrados.length} de {totalUsuarios} usuarios
      </div>

      <div className="admin-usuarios-scroll">
        <table className="admin-usuarios-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>

          <tbody>
            {usuariosFiltrados.map((u) => (
              <tr key={u.id} className={!u.activo ? "usuario-inactivo" : ""}>
                <td>{u.nombre}</td>
                <td>{u.email}</td>
                <td className={`rol-badge rol-${u.rol}`}>{u.rol}</td>
                <td>
                  <span className={`user-status ${u.activo ? "active" : "inactive"}`}>
                    {u.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td>
                  {u.rol === "cliente" ? (
                    <button
                      type="button"
                      className={`user-status-button ${u.activo ? "disable" : "enable"}`}
                      disabled={actualizandoId === u.id}
                      onClick={() => cambiarEstado(u)}
                    >
                      {actualizandoId === u.id
                        ? "Guardando..."
                        : u.activo
                          ? "Deshabilitar"
                          : "Reactivar"}
                    </button>
                  ) : (
                    <span className="user-status-staff">Personal</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {usuariosFiltrados.length === 0 && (
          <div className="admin-users-empty">No encontramos usuarios con esos filtros.</div>
        )}
      </div>
    </div>
  );
}
