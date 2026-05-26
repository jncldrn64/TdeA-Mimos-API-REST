import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import BotonSoporteFlotante from "./components/BotonSoporteFlotante.jsx";

import Home from "./pages/Home.jsx";
import Catalogo from "./pages/Catalogo.jsx";
import CarritoView from "./pages/CarritoView.jsx";
import DatosEnvio from "./pages/DatosEnvio.jsx";
import MisPedidos from "./pages/MisPedidos.jsx";
import MiCuenta from "./pages/MiCuenta.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import Login from "./pages/Login.jsx";
import Registro from "./pages/Registro.jsx"; // <-- ¡IMPORTACIÓN AÑADIDA!
import PasarelaWompi from "./pages/PasarelaWompi.jsx";

export default function App() {
  return (
    <Router>
      <Routes>
        
        {/* ── RUTAS PÚBLICAS ESTÁNDAR ── */}
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

        {/* ── RUTAS DE AUTENTICACIÓN ── */}
        <Route path="/login" element={
          <div className="layout-wrapper">
            <Header />
            <main className="main-content">
              <Login />
            </main>
            <Footer />
          </div>
        } />

        {/* <-- ¡NUEVA RUTA DE REGISTRO AÑADIDA AQUÍ! --> */}
        <Route path="/registro" element={
          <div className="layout-wrapper">
            <Header />
            <main className="main-content">
              <Registro />
            </main>
            <Footer />
          </div>
        } />

        {/* ── RUTAS TRANSACCIONALES Y DE ENVÍO ── */}
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

        {/* ── RUTAS PRIVADAS DEL PERFIL DEL USUARIO ── */}
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

        {/* ── RUTA DEL CENTRO DE OPERACIONES ── */}
        <Route path="/admin/panel" element={
          <div className="layout-wrapper">
            <Header />
            <main className="main-content"><AdminDashboard /></main>
            <Footer />
          </div>
        } />
      </Routes>
      
      {/* INYECCIÓN GLOBAL DEL WIDGET DE SOPORTE */}
      <BotonSoporteFlotante />
      
    </Router>
  );
}