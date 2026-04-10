// const API = import.meta.env.VITE_API_URL;

// export async function apiFetch(path: string, options: RequestInit = {}) {
//   return fetch(`${API}${path}`, {
//     credentials: "include",
//     headers: {
//       "Content-Type": "application/json",
//       ...(options.headers || {}),
//     },
//     ...options,
//   });
// }
const API = import.meta.env.VITE_API_URL;

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      Authorization: token ? `Bearer ${token}` : "",
    },
    ...options,
  });

  // 🔴 MANEJO GLOBAL DEL ERROR
  if (res.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/";
    // ❗ NO return acá
  }

  // ✅ SIEMPRE devolver res
  return res;
}
