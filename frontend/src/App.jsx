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
      <div className="layout-wrapper">
        
        {/* 🚀 MEGA-OPTIMIZACIÓN: El Header y el Footer se dibujan UNA VEZ aquí afuera. 
            El estado de las Notificaciones jamás se perderá al navegar. */}
        <Header />
        
        <main className="main-content">
          <Routes>
            {/* ── RUTAS PÚBLICAS ── */}
            <Route path="/" element={<Home />} />
            <Route path="/catalogo" element={<Catalogo />} />
            <Route path="/carrito" element={<CarritoView />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/recuperar" element={<RecuperarPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* 🛡️ ── RUTAS PRIVADAS CLIENTE ── */}
            <Route element={<ProtectedRoute />}>
              <Route path="/envio" element={<DatosEnvio />} />
              <Route path="/pasarela" element={<PasarelaWompi />} />
              <Route path="/pedidos" element={<MisPedidos />} />
              <Route path="/cuenta" element={<MiCuenta />} />
            </Route>

            {/* 🛡️ ── RUTAS DE GESTIÓN INTERNA ── */}
            <Route element={<ProtectedRoute rolesPermitidos={[0, 1, 2, 3]} />}>
              <Route path="/admin/panel" element={<AdminDashboard />} />
            </Route>
          </Routes>
        </main>

        <Footer />
        <BotonSoporteFlotante />

      </div>
    </Router>
  );
}