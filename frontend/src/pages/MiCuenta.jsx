import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function MiCuenta() {
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL || "http://localhost:3500";
  const token = localStorage.getItem("token");

  // Estados Perfil & Password
  const [passwords, setPasswords] = useState({ actual: "", nueva: "", confirmacion: "" });
  const [cargandoPass, setCargandoPass] = useState(false);
  const [datos, setDatos] = useState({ nombre: usuario?.nombre || "", apellido: usuario?.apellido || "", email: usuario?.email || "" });
  const [cargandoDatos, setCargandoDatos] = useState(false);

  // Estados PQRS
  const [tickets, setTickets] = useState([]);
  const [cargandoTickets, setCargandoTickets] = useState(false);

  useEffect(() => {
    if (!usuario) {
      navigate("/login");
    } else {
      cargarTickets();
    }
  }, [usuario, navigate]);

  const cargarTickets = async () => {
    setCargandoTickets(true);
    try {
      const res = await fetch(`${API}/api/incidentes/mis-tickets`, { headers: { "Authorization": `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setTickets(data.data);
    } catch (error) {
      console.error("Error al cargar tickets:", error);
    } finally {
      setCargandoTickets(false);
    }
  };

  const verificarSesion = (status) => {
    if (status === 401 || status === 403) {
      alert("Por tu seguridad, la sesión ha expirado. Ingresa nuevamente.");
      cerrarSesion();
      navigate("/login");
      return true;
    }
    return false;
  };

  const handleActualizarDatos = async (e) => {
    e.preventDefault();
    if (!datos.nombre || !datos.email) return alert("El nombre y el email son obligatorios.");
    setCargandoDatos(true);
    try {
      const id = usuario.id || usuario.id_usuario || usuario.sub;
      const res = await fetch(`${API}/api/usuario/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ nombre: datos.nombre, apellido: datos.apellido, email: datos.email }),
      });
      if (verificarSesion(res.status)) return;
      const data = await res.json();
      if (res.ok || data.success) {
        alert("¡Datos actualizados con éxito! Inicia sesión nuevamente para reflejar los cambios.");
        cerrarSesion(); navigate("/login");
      } else alert("Error: " + data.message);
    } catch (error) { alert("Error de conexión."); } finally { setCargandoDatos(false); }
  };

  const handleCambioPassword = async (e) => {
    e.preventDefault();
    if (passwords.nueva !== passwords.confirmacion) return alert("Las contraseñas nuevas no coinciden.");
    if (passwords.nueva.length < 6) return alert("La nueva contraseña debe tener al menos 6 caracteres.");
    setCargandoPass(true);
    try {
      const res = await fetch(`${API}/api/usuario/cambiar-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ password_actual: passwords.actual, password_nueva: passwords.nueva }),
      });
      if (verificarSesion(res.status)) return;
      const data = await res.json();
      if (res.ok && data.success) {
        alert("¡Contraseña actualizada con éxito! Por seguridad, debes iniciar sesión nuevamente.");
        cerrarSesion(); navigate("/login");
      } else alert("Error: " + data.message);
    } catch (error) { alert("Error de conexión."); } finally { setCargandoPass(false); }
  };

  if (!usuario) return null;

  const inicialNombre = usuario.nombre?.charAt(0) || "";
  const inicialApellido = usuario.apellido?.charAt(0) || "";

  return (
    <div className="w-full min-h-screen bg-[var(--color-fondo)] px-6 py-10 font-inherit">
      <div className="max-w-5xl mx-auto">
        
        <div className="mb-8 border-b border-[var(--color-borde)] pb-4 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-[var(--color-texto)] tracking-tight">Mi Perfil</h1>
            <p className="text-sm text-[var(--color-texto-suave)] mt-1">Gestiona tu información, seguridad y soporte.</p>
          </div>
          <button onClick={() => { cerrarSesion(); navigate("/login"); }} className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors uppercase tracking-wide flex items-center gap-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Cerrar Sesión
          </button>
        </div>

        {/* ── SECCIÓN SUPERIOR: PERFIL Y SEGURIDAD ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Información Personal */}
          <div>
            <div className="bg-[var(--color-superficie)] p-8 rounded-xl border border-[var(--color-borde)] shadow-sm h-full">
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-[var(--color-borde)]">
                <div className="w-16 h-16 bg-[var(--color-primario)] text-white rounded-full flex items-center justify-center text-2xl font-black uppercase shadow-inner">
                  {inicialNombre}{inicialApellido}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--color-texto)] leading-tight flex items-center gap-2">Información Personal</h3>
                  <div className="inline-block mt-2 px-2 py-0.5 bg-[var(--color-secundario-soft)] border border-[var(--color-borde)] text-[var(--color-texto-suave)] text-[10px] font-bold uppercase rounded">
                    Rol: {usuario.rol === 7 ? 'Cliente' : `Nivel Operativo ${usuario.rol}`}
                  </div>
                </div>
              </div>
              
              <form onSubmit={handleActualizarDatos} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--color-texto-suave)] mb-1 uppercase">Nombre</label>
                    <input type="text" required value={datos.nombre} onChange={e => setDatos({...datos, nombre: e.target.value})} className="w-full p-3 bg-[var(--color-fondo)] border border-[var(--color-borde)] rounded-lg text-sm outline-none focus:border-[var(--color-acento)] transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--color-texto-suave)] mb-1 uppercase">Apellido</label>
                    <input type="text" value={datos.apellido} onChange={e => setDatos({...datos, apellido: e.target.value})} className="w-full p-3 bg-[var(--color-fondo)] border border-[var(--color-borde)] rounded-lg text-sm outline-none focus:border-[var(--color-acento)] transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--color-texto-suave)] mb-1 uppercase">Correo Electrónico</label>
                  <input type="email" required value={datos.email} onChange={e => setDatos({...datos, email: e.target.value})} className="w-full p-3 bg-[var(--color-fondo)] border border-[var(--color-borde)] rounded-lg text-sm outline-none focus:border-[var(--color-acento)] transition-colors" />
                </div>
                <div className="pt-2">
                  <button type="submit" disabled={cargandoDatos} className="w-full bg-[var(--color-secundario)] hover:bg-[var(--color-acento)] hover:text-white text-[var(--color-texto)] border border-[var(--color-borde)] text-sm font-bold py-3 px-6 rounded-lg transition-colors shadow-sm disabled:opacity-50">
                    {cargandoDatos ? 'Guardando...' : 'Guardar Información'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Seguridad (Contraseña) */}
          <div>
            <div className="bg-[var(--color-superficie)] p-8 rounded-xl border border-[var(--color-borde)] shadow-sm h-full">
              <h3 className="text-lg font-bold text-[var(--color-texto)] mb-6 flex items-center gap-2 pb-6 border-b border-[var(--color-borde)]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-70"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                Seguridad de la Cuenta
              </h3>
              
              <form onSubmit={handleCambioPassword} className="space-y-4 mt-8">
                <div>
                  <label className="block text-xs font-bold text-[var(--color-texto-suave)] mb-1 uppercase">Contraseña Actual</label>
                  <input type="password" required value={passwords.actual} onChange={e => setPasswords({...passwords, actual: e.target.value})} className="w-full p-3 bg-[var(--color-fondo)] border border-[var(--color-borde)] rounded-lg text-sm outline-none focus:border-[var(--color-acento)] transition-colors" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-[var(--color-texto-suave)] mb-1 uppercase">Nueva Contraseña</label>
                    <input type="password" required minLength="6" value={passwords.nueva} onChange={e => setPasswords({...passwords, nueva: e.target.value})} className="w-full p-3 bg-[var(--color-fondo)] border border-[var(--color-borde)] rounded-lg text-sm outline-none focus:border-[var(--color-acento)] transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--color-texto-suave)] mb-1 uppercase">Confirmar Nueva</label>
                    <input type="password" required minLength="6" value={passwords.confirmacion} onChange={e => setPasswords({...passwords, confirmacion: e.target.value})} className="w-full p-3 bg-[var(--color-fondo)] border border-[var(--color-borde)] rounded-lg text-sm outline-none focus:border-[var(--color-acento)] transition-colors" />
                  </div>
                </div>
                <div className="pt-2">
                  <button type="submit" disabled={cargandoPass} className="w-full bg-[var(--color-primario)] hover:bg-[var(--color-primario-dark)] text-white text-sm font-bold py-3 px-6 rounded-lg transition-colors shadow-sm disabled:opacity-50">
                    {cargandoPass ? 'Actualizando...' : 'Actualizar Contraseña'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* ── SECCIÓN INFERIOR: HISTORIAL DE SOPORTE PQRS ── */}
        <div className="bg-[var(--color-superficie)] p-8 rounded-xl border border-[var(--color-borde)] shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--color-borde)]">
             <img src="/img/iconos/soporte.svg" alt="Soporte" className="w-6 h-6 opacity-70" onError={(e) => e.target.style.display='none'} />
             <h3 className="text-lg font-bold text-[var(--color-texto)]">Historial de Casos (PQRS)</h3>
          </div>

          {cargandoTickets ? (
            <div className="py-8 text-center text-sm text-[var(--color-texto-suave)] animate-pulse">Consultando historial de soporte...</div>
          ) : tickets.length === 0 ? (
            <div className="py-8 text-center text-[var(--color-texto-suave)]">No tienes ningún ticket de soporte abierto.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tickets.map(ticket => (
                <div key={ticket.id_incidente} className="border border-[var(--color-borde)] rounded-lg p-5 flex flex-col bg-[var(--color-fondo)]">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-xs font-bold text-[var(--color-texto-suave)] uppercase">Ticket #{ticket.id_incidente}</span>
                      <h4 className="font-bold text-[var(--color-texto)] text-sm mt-1">{ticket.asunto}</h4>
                    </div>
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${ticket.estado === 'Abierto' ? 'bg-red-100 text-red-700' : ticket.estado === 'En Revisión' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                      {ticket.estado}
                    </span>
                  </div>
                  
                  <p className="text-sm text-[var(--color-texto-suave)] mb-4">{ticket.mensaje}</p>
                  
                  {/* Caja de Respuesta Oficial */}
                  {ticket.respuesta && (
                    <div className="mt-auto bg-[var(--color-superficie)] p-3 rounded border border-blue-200 border-l-4 border-l-blue-500 text-sm">
                      <p className="text-[10px] font-bold text-blue-700 uppercase mb-1">Respuesta de Mimos</p>
                      <p className="text-[var(--color-texto)]">{ticket.respuesta}</p>
                    </div>
                  )}
                  
                  <div className="mt-4 pt-3 border-t border-[var(--color-borde)] flex justify-between text-[10px] text-[var(--color-texto-suave)]">
                    <span>Creado: {new Date(ticket.fecha_creacion).toLocaleDateString()}</span>
                    {ticket.venta_id && <span>Ref. Pedido #{ticket.venta_id}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}