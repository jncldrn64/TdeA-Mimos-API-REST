import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import BotonSoporteFlotante from "./components/BotonSoporteFlotante.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import Home from "./pages/Home.jsx";
import Catalogo from "./pages/Catalogo.jsx";
import CarritoView from "./pages/CarritoView.jsx";
import DatosEnvio from "./pages/DatosEnvio.jsx";
import MisPedidos from "./pages/MisPedidos.jsx";
import MiCuenta from "./pages/MiCuenta.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import Login from "./pages/Login.jsx";
import Registro from "./pages/Registro.jsx";
import RecuperarPassword from "./pages/RecuperarPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import PasarelaWompi from "./pages/PasarelaWompi.jsx";

export default function App() {
  return (
    <Router>
      <Routes>
        
        {/* ── RUTAS PÚBLICAS (Accesibles por cualquier visitante) ── */}
        <Route path="/" element={
          <div className="layout-wrapper">
            <Header />
            <main className="main-content">
              <Home />
            </main>
            <Footer />
          </div>
        } />

        <Route path="/catalogo" element={
          <div className="layout-wrapper">
            <Header />
            <main className="main-content">
              <Catalogo />
            </main>
            <Footer />
          </div>
        } />

        <Route path="/carrito" element={
          <div className="layout-wrapper">
            <Header />
            <main className="main-content">
              <CarritoView />
            </main>
            <Footer />
          </div>
        } />

        {/* ── RUTAS DE AUTENTICACIÓN Y CREDENCIALES ── */}
        <Route path="/login" element={
          <div className="layout-wrapper">
            <Header />
            <main className="main-content">
              <Login />
            </main>
            <Footer />
          </div>
        } />

        <Route path="/registro" element={
          <div className="layout-wrapper">
            <Header />
            <main className="main-content">
              <Registro />
            </main>
            <Footer />
          </div>
        } />

        <Route path="/recuperar" element={
          <div className="layout-wrapper">
            <Header />
            <main className="main-content">
              <RecuperarPassword />
            </main>
            <Footer />
          </div>
        } />

        <Route path="/reset-password" element={
          <div className="layout-wrapper">
            <Header />
            <main className="main-content">
              <ResetPassword />
            </main>
            <Footer />
          </div>
        } />

        {/* 🛡️ ── RUTAS PRIVADAS CLIENTE (Requieren Inicio de Sesión Obligatorio) ── */}
        <Route element={<ProtectedRoute />}>
          <Route path="/envio" element={
            <div className="layout-wrapper">
              <Header />
              <main className="main-content">
                <DatosEnvio />
              </main>
              <Footer />
            </div>
          } />

          <Route path="/pasarela" element={
            <div className="layout-wrapper">
              <Header />
              <main className="main-content">
                <PasarelaWompi />
              </main>
              <Footer />
            </div>
          } />

          <Route path="/pedidos" element={
            <div className="layout-wrapper">
              <Header />
              <main className="main-content">
                <MisPedidos />
              </main>
              <Footer />
            </div>
          } />

          <Route path="/cuenta" element={
            <div className="layout-wrapper">
              <Header />
              <main className="main-content">
                <MiCuenta />
              </main>
              <Footer />
            </div>
          } />
        </Route>

        {/* 🛡️ ── RUTAS DE GESTIÓN INTERNA (Requieren Roles Operativos: 0, 1, 2, 3) ── */}
        <Route element={<ProtectedRoute rolesPermitidos={[0, 1, 2, 3]} />}>
          <Route path="/admin/panel" element={
            <div className="layout-wrapper">
              <Header />
              <main className="main-content">
                <AdminDashboard />
              </main>
              <Footer />
            </div>
          } />
        </Route>

      </Routes>

      {/* INYECCIÓN DEL COMPONENTE DE ASISTENCIA GLOBAL */}
      <BotonSoporteFlotante />
      
    </Router>
  );
}