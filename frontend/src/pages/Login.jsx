import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  
  const navigate = useNavigate();
  // 1. Extraemos cerrarSesion
  const { iniciarSesion, cerrarSesion } = useAuth(); 
  const API = import.meta.env.VITE_API_URL || "http://localhost:3500";

  // 2. Limpieza Forzada: Al pisar la ruta /login, destruimos cualquier token zombi
  useEffect(() => {
    cerrarSesion();
  }, []);

  const handleLogin = async () => {
    // ... (el resto de tu código handleLogin se mantiene exactamente igual)
    if (!email || !password) { 
      alert("Por favor, ingresa correo electrónico y contraseña."); 
      return; 
    }
    
    setCargando(true);
    try {
      const res = await fetch(`${API}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
	  console.log(data.usuario)
      
      if (data.success) {
        // Almacenamiento en el estado global reactivo
        iniciarSesion(data.token, data.usuario);
        
        alert(`¡Autenticación exitosa! Bienvenido, ${data.usuario.nombre}.`);
        
        // Enrutamiento inteligente según el rol del usuario
        if (Number(data.usuario.id_rol) === 1) {
          navigate("/admin/panel");
        } else {
          navigate("/catalogo");
        }
      } else {
        alert("Error de autenticación: " + data.message);
      }
    } catch (error) {
      alert("Error de conexión. Asegúrate de que el servidor backend esté encendido.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-fondo)] px-4 font-inherit">
      
      {/* Logotipo Estático de la Marca */}
      <div className="mb-6 flex flex-col items-center select-none">
        <img 
          src="/img/logo.png" 
          alt="Logotipo Corporativo" 
          className="h-14 w-auto object-contain mb-2 drop-shadow-sm"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <h2 className="text-sm font-bold tracking-wider text-[var(--color-texto-suave)] uppercase">
          Portal de Acceso
        </h2>
      </div>

      <div className="w-full max-w-md bg-[var(--color-superficie)] rounded-xl border border-[var(--color-borde)] p-8 shadow-sm flex flex-col gap-6">
        
        <div className="flex flex-col gap-4">
          {/* Campo: Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-texto-suave)]">
              Correo Electrónico
            </label>
            <div className="flex items-center bg-[var(--color-fondo)] border border-[var(--color-borde)] rounded-lg px-3 gap-2 focus-within:border-[var(--color-acento)] transition-colors">
              <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <input
                type="email"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full py-3 text-sm bg-transparent outline-none text-[var(--color-texto)] font-inherit"
              />
            </div>
          </div>

          {/* Campo: Contraseña */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-texto-suave)]">
              Contraseña
            </label>
            <div className="flex items-center bg-[var(--color-fondo)] border border-[var(--color-borde)] rounded-lg px-3 gap-2 focus-within:border-[var(--color-acento)] transition-colors">
              <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full py-3 text-sm bg-transparent outline-none text-[var(--color-texto)] font-inherit"
              />
            </div>
          </div>
        </div>
		
		<div className="flex justify-end mt-1">
              <Link to="/recuperar" className="text-[10px] text-[var(--color-acento)] font-bold hover:underline">¿Olvidaste tu contraseña?</Link>
            </div>

        {/* Acción de Envío */}
        <div className="pt-2">
          <button
            onClick={handleLogin}
            disabled={cargando}
            className="w-full bg-[var(--color-primario)] hover:bg-[var(--color-primario-dark)] text-white py-3 rounded-lg font-bold text-sm tracking-wide transition-all disabled:opacity-50 active:scale-[0.99]"
          >
            {cargando ? "Autenticando..." : "Iniciar Sesión"}
          </button>
        </div>

        <p className="text-xs text-center text-[var(--color-texto-suave)]">
          ¿No posees una cuenta?{" "}
          <Link to="/registro" className="text-[var(--color-acento)] hover:underline font-semibold">
            Regístrate aquí
          </Link>
        </p>

      </div>
    </div>
  );
}