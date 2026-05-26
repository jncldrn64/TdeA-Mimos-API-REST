import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  
  const { iniciarSesion, usuario } = useAuth();
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL || "http://localhost:3500";

  // Redirección inteligente: Si ya tienes sesión, saltas al panel sin cargar la vista
  useEffect(() => {
    if (usuario) {
      const rol = Number(usuario.rol || usuario.id_rol);
      if ([0, 1, 2, 3].includes(rol)) {
        navigate("/admin/panel");
      } else {
        navigate("/");
      }
    }
  }, [usuario, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      const res = await fetch(`${API}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();

      if (res.ok && data.success) {
        // Enviar datos en el orden estricto (usuario, token)
        iniciarSesion(data.usuario || data.data, data.token);
        
        // Ruteo por memoria virtual (Cero pestañeos)
        const rol = Number((data.usuario || data.data).rol || (data.usuario || data.data).id_rol);
        if ([0, 1, 2, 3].includes(rol)) {
          navigate("/admin/panel");
        } else {
          navigate("/");
        }
      } else {
        setError(data.message || "Credenciales incorrectas");
      }
    } catch (error) {
      setError("Error de red. Verifica que el Backend esté encendido.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-6 bg-[var(--color-fondo)] font-inherit">
      <div className="w-full max-w-md bg-[var(--color-superficie)] p-8 rounded-2xl shadow-sm border border-[var(--color-borde)]">
        
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[var(--color-secundario-soft)] rounded-full flex items-center justify-center mx-auto mb-4">
            <img src="/img/iconos/login.svg" alt="Login" className="w-6 h-6 opacity-80" onError={(e) => e.target.style.display='none'} />
          </div>
          <h1 className="text-2xl font-black text-[var(--color-texto)] tracking-tight">Acceso Seguro</h1>
          <p className="text-sm text-[var(--color-texto-suave)] mt-2">Ingresa a tu cuenta para continuar</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-bold text-center animate-in fade-in">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-[var(--color-texto-suave)] uppercase mb-1">Correo Electrónico</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" className="w-full p-3 bg-[var(--color-fondo)] border border-[var(--color-borde)] rounded-lg text-sm outline-none focus:border-[var(--color-acento)] transition-colors" />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-[var(--color-texto-suave)] uppercase">Contraseña</label>
              <Link to="/recuperar" className="text-[10px] font-bold text-[var(--color-acento)] hover:underline">¿Olvidaste tu contraseña?</Link>
            </div>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full p-3 bg-[var(--color-fondo)] border border-[var(--color-borde)] rounded-lg text-sm outline-none focus:border-[var(--color-acento)] transition-colors" />
          </div>

          <button type="submit" disabled={cargando} className="w-full bg-[var(--color-primario)] hover:bg-[var(--color-primario-dark)] text-white font-bold py-3.5 rounded-lg transition-transform active:scale-95 disabled:opacity-50 mt-2 shadow-sm uppercase tracking-wider text-sm flex justify-center items-center gap-2">
            {cargando ? <span className="animate-pulse">Autenticando...</span> : "Ingresar"}
          </button>
        </form>

        <p className="text-center text-sm text-[var(--color-texto-suave)] mt-6 border-t border-[var(--color-borde)] pt-6">
          ¿No tienes una cuenta? <Link to="/registro" className="text-[var(--color-acento)] font-bold hover:underline ml-1">Regístrate aquí</Link>
        </p>

      </div>
    </div>
  );
}