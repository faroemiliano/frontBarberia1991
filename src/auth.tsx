// auth.ts (o donde manejes la sesión)

export interface SessionUser {
  id: number;
  email: string;
  nombre: string;
  rol: "admin" | "barbero" | "cliente";
  telefono: string;
}

export function saveSession(
  token: string,
  user: {
    id: number;
    email: string;
    nombre?: string;
    rol: "admin" | "barbero" | "cliente";
    telefono?: string;
  },
) {
  localStorage.setItem("token", token);
  localStorage.setItem(
    "user",
    JSON.stringify({
      id: user.id,
      email: user.email,
      nombre: user.nombre || "",
      rol: user.rol,
      telefono: user.telefono || "",
    }),
  );
}

export function getToken() {
  return localStorage.getItem("token");
}

export function getUser(): SessionUser | null {
  const raw = localStorage.getItem("user");

  if (!raw) return null;

  try {
    const user = JSON.parse(raw);

    if (typeof user.id !== "number" || typeof user.rol !== "string") {
      throw new Error("Usuario inválido");
    }

    return user;
  } catch {
    localStorage.removeItem("user");
    return null;
  }
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}
