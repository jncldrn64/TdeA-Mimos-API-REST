import { useState } from "react";
import { Link } from "react-router-dom";

export default function RecuperarPassword() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);

  const handleRecuperar = (e) => {
    e.preventDefault();
    if (!email) return alert("Por favor ingresa tu correo electrónico.");

    setCargando(true);

    // Simulamos un delay de red
    setTimeout(() => {
      // ── AQUÍ SIMULAMOS EL ENVÍO DEL CORREO EN LA CONSOLA ──
      console.log(`\n==============================================`);
      console.log(`[SIMULACIÓN SMTP] Correo enviado a: ${email}`);
      console.log(`[LINK DE RECUPERACIÓN] http://localhost:5173/reset-password?token=a1b2c3d4e5f6`);
      console.log(`==============================================\n`);

      setEnviado(true);
      setCargando(false);
    }, 1500);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-6 bg-[var(--color-fondo)] font-inherit">
      <div className="w-full max-w-md bg-[var(--color-superficie)] p-8 rounded-2xl shadow-sm border border-[var(--color-borde)]">
        
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[var(--color-secundario)] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-[var(--color-primario)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
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
              (Abre la consola F12 para ver la simulación del correo enviado).
            </p>
            <Link to="/login" className="block w-full bg-[var(--color-primario)] hover:bg-[var(--color-primario-dark)] text-white font-bold py-3.5 rounded-lg transition-transform active:scale-95 shadow-sm uppercase tracking-wider text-sm">
              Volver al Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleRecuperar} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[var(--color-texto-suave)] uppercase mb-1">Correo Electrónico</label>
              <input 
                type="email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="correo@ejemplo.com"
                className="w-full p-3 bg-[var(--color-fondo)] border border-[var(--color-borde)] rounded-lg text-sm outline-none focus:border-[var(--color-acento)] transition-colors" 
              />
            </div>

            <button type="submit" disabled={cargando} className="w-full bg-[var(--color-primario)] hover:bg-[var(--color-primario-dark)] text-white font-bold py-3.5 rounded-lg transition-transform active:scale-95 disabled:opacity-50 mt-2 shadow-sm uppercase tracking-wider text-sm flex justify-center items-center gap-2">
              {cargando ? (
                 <span className="animate-pulse">Verificando...</span>
              ) : "Enviar Enlace"}
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