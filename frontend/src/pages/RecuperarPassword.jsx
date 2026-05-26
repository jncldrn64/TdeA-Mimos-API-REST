import { useState } from "react";
import { Link } from "react-router-dom";

export default function RecuperarPassword() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);
  
  const API = import.meta.env.VITE_API_URL || "http://localhost:3500";

  const handleRecuperar = async (e) => {
    e.preventDefault();
    if (!email) return alert("Por favor ingresa tu correo electrónico.");

    setCargando(true);

    try {
      // Ahora la petición va directamente a tu backend
      const res = await fetch(`${API}/api/usuario/recuperar-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      
      const data = await res.json();
      
      if (res.ok || data.success) {
        setEnviado(true);
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      alert("Error de conexión. Verifica que el backend esté encendido.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-6 bg-[var(--color-fondo)] font-inherit">
      <div className="w-full max-w-md bg-[var(--color-superficie)] p-8 rounded-2xl shadow-sm border border-[var(--color-borde)]">
        
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[var(--color-secundario)] rounded-full flex items-center justify-center mx-auto mb-4">
            <img src="/img/iconos/info.svg" alt="Recuperar" className="w-6 h-6 opacity-80" onError={(e)=>e.target.style.display='none'} />
          </div>
          <h1 className="text-2xl font-black text-[var(--color-texto)] tracking-tight">Recuperar Acceso</h1>
          <p className="text-sm text-[var(--color-texto-suave)] mt-2">
            Ingresa tu correo y te enviaremos las instrucciones.
          </p>
        </div>

        {enviado ? (
          <div className="text-center animate-in fade-in zoom-in duration-300">
            <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg mb-6 text-sm font-medium">
              Si el correo <strong>{email}</strong> está registrado, recibirás un enlace de recuperación en breve.
            </div>
            <p className="text-xs text-[var(--color-texto-suave)] mb-6">
              (Revisa la terminal de Node.js en el backend para ver el link de recuperación simulado).
            </p>
            <Link to="/login" className="block w-full bg-[var(--color-primario)] hover:bg-[var(--color-primario-dark)] text-white font-bold py-3.5 rounded-lg transition-transform active:scale-95 shadow-sm uppercase tracking-wider text-sm">
              Volver al Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleRecuperar} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[var(--color-texto-suave)] uppercase mb-1">Correo Electrónico</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@ejemplo.com" className="w-full p-3 bg-[var(--color-fondo)] border border-[var(--color-borde)] rounded-lg text-sm outline-none focus:border-[var(--color-acento)] transition-colors" />
            </div>
            <button type="submit" disabled={cargando} className="w-full bg-[var(--color-primario)] hover:bg-[var(--color-primario-dark)] text-white font-bold py-3.5 rounded-lg transition-transform active:scale-95 disabled:opacity-50 mt-2 shadow-sm uppercase tracking-wider text-sm flex justify-center items-center gap-2">
              {cargando ? <span className="animate-pulse">Conectando...</span> : "Enviar Enlace"}
            </button>
          </form>
        )}

        {!enviado && (
          <p className="text-center text-sm text-[var(--color-texto-suave)] mt-6">
            <Link to="/login" className="text-[var(--color-acento)] font-bold hover:underline">Volver atrás</Link>
          </p>
        )}

      </div>
    </div>
  );
}