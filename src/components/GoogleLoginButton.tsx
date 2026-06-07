import { GoogleLogin } from "@react-oauth/google";
import { saveSession } from "../auth";
import { apiFetch } from "../api";

export default function GoogleLoginButton({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  return (
    <GoogleLogin
      onSuccess={async (res) => {
        const credential = res.credential;
        if (!credential) return;

        const r = await apiFetch("/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential }),
        });

        if (!r.ok) return;
        const data = await r.json();
        console.log("Respuesta backend Google:", data);

        saveSession(data.access_token, {
          id: data.user.id,
          email: data.user.email,
          nombre: data.user.nombre,
          rol: data.user.rol, // 🔥 conversión correcta
          telefono: data.user.telefono,
        });
        onSuccess();
      }}
      onError={() => {
        console.log("Login con Google falló");
      }}
    />
  );
}
