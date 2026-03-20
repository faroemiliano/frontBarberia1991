import { useState, useEffect, lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Modal from "./components/Modal";
import { getUser, logout } from "./auth";

// 🔥 Lazy loaded pages/components
const Hero = lazy(() => import("./components/Hero"));
const Login = lazy(() => import("./components/Login"));
const CutsGallery = lazy(() => import("./components/CutsGallery"));
const Footer = lazy(() => import("./components/Footer"));

const AdminPanel = lazy(() => import("./components/admin/AdminPanel"));
const AdminTurnos = lazy(() => import("./components/admin/AdminTurnos"));
const AdminGanancias = lazy(() => import("./components/admin/AdminGanancias"));
const AdminServicios = lazy(() => import("./components/admin/AdminServicios"));
const BarberoPanel = lazy(() => import("./components/barbero/BarberoPanel"));
const AdminUsuarios = lazy(() => import("./components/admin/AdminUsuarios"));
import "./styles.css";

function Loader() {
  return (
    <div
      style={{
        minHeight: "40vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontWeight: 600,
      }}
    >
      Cargando...
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(getUser());
  const [showLogin, setShowLogin] = useState(!user);

  /* 🔒 BLOQUEO SCROLL MODAL */
  useEffect(() => {
    document.body.classList.toggle("modal-open", showLogin);
    return () => document.body.classList.remove("modal-open");
  }, [showLogin]);

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  return (
    <>
      <Navbar
        user={user}
        onLogin={() => setShowLogin(true)}
        onLogout={handleLogout}
      />
      <div className="hero-divider" />
      <Suspense fallback={<Loader />}>
        <Routes>
          {/* HOME */}
          <Route
            path="/"
            element={
              user?.rol === "admin" ? (
                <Navigate to="/admin" />
              ) : user?.rol === "barbero" ? (
                <Navigate to="/barbero" />
              ) : (
                <>
                  <Hero user={user} onLogin={() => setShowLogin(true)} />
                  <div className="hero-divider" />
                  <CutsGallery />
                  <div className="hero-divider" />
                  <Footer />
                </>
              )
            }
          />

          {/* ADMIN */}
          <Route
            path="/admin"
            element={
              user?.rol === "admin" ? <AdminPanel /> : <Navigate to="/" />
            }
          >
            <Route index element={<Navigate to="turnos" />} />
            <Route path="turnos" element={<AdminTurnos />} />
            <Route path="ganancias" element={<AdminGanancias />} />
            <Route path="servicios" element={<AdminServicios />} />
            <Route path="usuarios" element={<AdminUsuarios />} />
          </Route>

          {/* BARBERO */}
          <Route
            path="/barbero"
            element={
              user ? (
                user.rol === "barbero" ? (
                  <BarberoPanel userId={user.id} />
                ) : (
                  <Navigate to="/" />
                )
              ) : (
                // mostrar login modal en vez de crash
                <Navigate to="/" />
              )
            }
          />
        </Routes>
      </Suspense>

      {/* ================= LOGIN MODAL ================= */}
      {showLogin && (
        <Modal onClose={() => setShowLogin(false)}>
          <Suspense fallback={<Loader />}>
            <Login
              onSuccess={() => {
                setUser(getUser());
                setShowLogin(false);
              }}
              onClose={() => setShowLogin(false)}
            />
          </Suspense>
        </Modal>
      )}
    </>
  );
}
