import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function BotonSoporteFlotante() {
  const { usuario } = useAuth();
  const [abierto, setAbierto] = useState(false);
  const [formulario, setFormulario] = useState({ asunto: "", mensaje: "" });
  const [cargando, setCargando] = useState(false);
  const [exito, setExito] = useState(false);
  
  const [tickets, setTickets] = useState([]);

  const API = import.meta.env.VITE_API_URL || "http://localhost:3500";
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (usuario && token) {
      fetch(`${API}/api/incidentes/mis-tickets`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) setTickets(data.data);
      })
      .catch(() => console.error("Error verificando notificaciones PQRS"));
    }
  }, [usuario, token, API]);

  if (!usuario) return null;

  const ticketsRespondidos = tickets.filter(t => t.respuesta);
  const hayNotificacion = ticketsRespondidos.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formulario.asunto || !formulario.mensaje) return;

    setCargando(true);
    try {
      const res = await fetch(`${API}/api/incidentes`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(formulario)
      });

      const data = await res.json();
      if (data.success) {
        setExito(true);
        setTickets([{ ...data.data, estado: 'Abierto' }, ...tickets]);
        setTimeout(() => {
          setAbierto(false);
          setExito(false);
          setFormulario({ asunto: "", mensaje: "" });
        }, 3000);
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      alert("Falla de red al enviar el reporte.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 font-inherit">
      {abierto && (
        <div className="absolute bottom-16 left-0 mb-4 w-80 sm:w-96 bg-[var(--color-superficie)] rounded-2xl shadow-2xl border border-[var(--color-borde)] overflow-hidden flex flex-col origin-bottom-left animate-in fade-in zoom-in duration-200">
          <div className="bg-[var(--color-primario)] p-4 text-white flex justify-between items-center shadow-md">
            <div>
              <h3 className="font-black text-lg leading-tight">Soporte</h3>
              <p className="text-xs opacity-90">Te responderemos a la brevedad</p>
            </div>
            <button onClick={() => setAbierto(false)} className="text-white hover:text-gray-200 font-bold p-1">✕</button>
          </div>

          <div className="p-5">
            {hayNotificacion && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-blue-800">Tienes respuestas pendientes</p>
                  <p className="text-[10px] text-blue-600">Revisa tus casos de PQRS.</p>
                </div>
                <Link to="/cuenta" onClick={() => setAbierto(false)} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1.5 px-3 rounded shadow-sm transition-colors">
                  Ver
                </Link>
              </div>
            )}

            {exito ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl font-bold">✓</div>
                <h4 className="font-bold text-[var(--color-texto)] mb-1">¡Ticket Enviado!</h4>
                <p className="text-xs text-[var(--color-texto-suave)]">Nuestro equipo revisará tu caso y te contactará.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--color-texto-suave)] mb-1 uppercase">Asunto General</label>
                  <input 
                    type="text" required placeholder="Ej: Problemas con mi cuenta"
                    value={formulario.asunto} onChange={e => setFormulario({...formulario, asunto: e.target.value})}
                    className="w-full p-2.5 bg-[var(--color-fondo)] border border-[var(--color-borde)] rounded-lg text-sm outline-none focus:border-[var(--color-acento)] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--color-texto-suave)] mb-1 uppercase">Mensaje</label>
                  <textarea 
                    required rows="4" placeholder="Describe tu problema aquí..."
                    value={formulario.mensaje} onChange={e => setFormulario({...formulario, mensaje: e.target.value})}
                    className="w-full p-2.5 bg-[var(--color-fondo)] border border-[var(--color-borde)] rounded-lg text-sm outline-none focus:border-[var(--color-acento)] transition-colors resize-none"
                  ></textarea>
                </div>
                <button 
                  type="submit" disabled={cargando}
                  className="w-full bg-[var(--color-acento)] hover:bg-blue-600 text-white font-bold py-2.5 rounded-lg text-sm transition-colors shadow-sm disabled:opacity-50"
                >
                  {cargando ? 'Enviando...' : 'Enviar Ticket'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <button 
        onClick={() => setAbierto(!abierto)}
        className="relative w-14 h-14 bg-[var(--color-acento)] hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
        aria-label="Soporte"
      >
        {hayNotificacion && !abierto && (
          <span className="absolute top-0 right-0 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-[var(--color-fondo)]"></span>
          </span>
        )}

        {abierto ? (
           <img src="/img/iconos/x-icon.svg" alt="Cerrar" className="w-5 h-5 filter brightness-0 invert" onError={(e)=>e.target.style.display='none'}/>
        ) : (
           <img src="/img/iconos/soporte.svg" alt="Soporte" className="w-7 h-7 filter brightness-0 invert" onError={(e)=>e.target.style.display='none'}/>
        )}
      </button>
    </div>
  );
}