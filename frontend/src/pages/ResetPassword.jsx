import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [exito, setExito] = useState(false);

  const API = import.meta.env.VITE_API_URL || "http://localhost:3500";

  const handleReset = async (e) => {
    e.preventDefault();
    
    if (password !== confirmarPassword) {
      return alert("Las contraseñas no coinciden.");
    }
    if (password.length < 6) {
      return alert("La contraseña debe tener al menos 6 caracteres.");
    }

    setCargando(true);

    try {
      const res = await fetch(`${API}/api/usuario/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token, nuevaPassword: password })
      });

      const data = await res.json();

      if (data.success) {
        setExito(true);
        setTimeout(() => navigate("/login"), 3000);
      } else {
        alert("Error de seguridad: " + data.message);
      }
    } catch (error) {
      alert("Error de conexión con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-6 bg-[var(--color-fondo)] font-inherit">
        <div className="w-full max-w-md bg-[var(--color-superficie)] p-8 rounded-2xl shadow-sm border border-red-100 text-center">
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">✕</div>
          <h2 className="text-xl font-bold text-red-600 mb-2">Enlace Inválido</h2>
          <p className="text-sm text-[var(--color-texto-suave)] mb-6">
            El token de seguridad no fue proporcionado.
          </p>
          <Link to="/login" className="block w-full bg-[var(--color-primario)] hover:bg-[var(--color-primario-dark)] text-white font-bold py-3.5 rounded-lg text-sm uppercase tracking-wider shadow-sm text-center">
            Volver al Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-6 bg-[var(--color-fondo)] font-inherit">
      <div className="w-full max-w-md bg-[var(--color-superficie)] p-8 rounded-2xl shadow-sm border border-[var(--color-borde)]">
        
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[var(--color-secundario-soft)] rounded-full flex items-center justify-center mx-auto mb-4">
            <img src="/img/iconos/login.svg" alt="Seguridad" className="w-6 h-6 opacity-80" onError={(e)=>e.target.style.display='none'} />
          </div>
          <h1 className="text-2xl font-black text-[var(--color-texto)] tracking-tight">Nueva Contraseña</h1>
          <p className="text-sm text-[var(--color-texto-suave)] mt-2">
            Establece tus nuevas credenciales de acceso seguro.
          </p>
        </div>

        {exito ? (
          <div className="text-center animate-in fade-in zoom-in duration-300">
            <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg mb-4 text-sm font-medium">
              ¡Contraseña actualizada en la base de datos!
            </div>
            <p className="text-xs text-[var(--color-texto-suave)] animate-pulse">
              Redirigiendo al portal de acceso...
            </p>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[var(--color-texto-suave)] uppercase mb-1">Nueva Contraseña</label>
              <input type="password" required minLength="6" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" className="w-full p-3 bg-[var(--color-fondo)] border border-[var(--color-borde)] rounded-lg text-sm outline-none focus:border-[var(--color-acento)] transition-colors" />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--color-texto-suave)] uppercase mb-1">Confirmar Nueva Contraseña</label>
              <input type="password" required minLength="6" value={confirmarPassword} onChange={(e) => setConfirmarPassword(e.target.value)} placeholder="Repite la contraseña" className="w-full p-3 bg-[var(--color-fondo)] border border-[var(--color-borde)] rounded-lg text-sm outline-none focus:border-[var(--color-acento)] transition-colors" />
            </div>

            <button type="submit" disabled={cargando} className="w-full bg-[var(--color-primario)] hover:bg-[var(--color-primario-dark)] text-white font-bold py-3.5 rounded-lg transition-transform active:scale-95 disabled:opacity-50 mt-2 shadow-sm uppercase tracking-wider text-sm">
              {cargando ? "Actualizando Servidor..." : "Guardar Contraseña"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}