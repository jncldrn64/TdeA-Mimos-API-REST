import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Registro() {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL || "http://localhost:3500";

  const handleRegister = async () => {
    if (!nombre || !apellido || !email || !password) {
      alert("Todos los campos obligatorios (*) deben ser diligenciados.");
      return;
    }

    setCargando(true);
    try {
      const res = await fetch(`${API}/api/usuario`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_rol: 2, // Rol 2: Cliente estándar (Hardcodeado por seguridad en registro público)
          nombre,
          apellido,
          email,
          password_hash: password,
          estado: "activo",
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Registro completado con éxito. Ya puedes iniciar sesión.");
        navigate("/login");
      } else {
        alert("No se pudo completar el registro: " + data.message);
      }
    } catch {
      alert("Error de conexión al procesar el registro con el servidor backend.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-fondo)] px-4 font-inherit">
      
      {/* ── Identidad Visual Estática ── */}
      <div className="mb-6 flex flex-col items-center select-none">
        <img 
          src="/img/logo.png" 
          alt="Logotipo Corporativo" 
          className="h-14 w-auto object-contain mb-2 drop-shadow-sm"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <h2 className="text-xl font-black text-[var(--color-texto)] tracking-tight">
          Alta de Cliente
        </h2>
        <p className="text-xs text-[var(--color-texto-suave)] mt-1">
          Registro de acceso a la plataforma
        </p>
      </div>

      <div className="w-full max-w-md bg-[var(--color-superficie)] rounded-xl border border-[var(--color-borde)] p-8 shadow-sm flex flex-col gap-5">
        
        {/* ── Campos del Formulario ── */}
        <div className="flex flex-col gap-3.5">
          
          {/* Fila Dual: Nombre y Apellido */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-texto-suave)]">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Juan"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full py-2.5 px-3 bg-[var(--color-fondo)] border border-[var(--color-borde)] rounded-lg text-sm outline-none focus:border-[var(--color-acento)] text-[var(--color-texto)] font-inherit transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-texto-suave)]">
                Apellido <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Pérez"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                className="w-full py-2.5 px-3 bg-[var(--color-fondo)] border border-[var(--color-borde)] rounded-lg text-sm outline-none focus:border-[var(--color-acento)] text-[var(--color-texto)] font-inherit transition-colors"
              />
            </div>
          </div>

          {/* Correo Electrónico */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-texto-suave)]">
              Correo Electrónico <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full py-2.5 px-3 bg-[var(--color-fondo)] border border-[var(--color-borde)] rounded-lg text-sm outline-none focus:border-[var(--color-acento)] text-[var(--color-texto)] font-inherit transition-colors"
            />
          </div>

          {/* Contraseña */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-texto-suave)]">
              Contraseña <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full py-2.5 px-3 bg-[var(--color-fondo)] border border-[var(--color-borde)] rounded-lg text-sm outline-none focus:border-[var(--color-acento)] text-[var(--color-texto)] font-inherit transition-colors"
            />
          </div>
        </div>

        {/* Botón de Registro */}
        <div className="pt-1">
          <button
            onClick={handleRegister}
            disabled={cargando}
            className="w-full bg-[var(--color-primario)] hover:bg-[var(--color-primario-dark)] text-white py-3 rounded-lg font-bold text-sm tracking-wide transition-all disabled:opacity-50 active:scale-[0.99]"
          >
            {cargando ? "Registrando usuario..." : "Registrarse"}
          </button>
        </div>

        {/* Retorno */}
        <p className="text-xs text-center text-[var(--color-texto-suave)]">
          ¿Ya posees una cuenta?{" "}
          <Link to="/login" className="text-[var(--color-acento)] hover:underline font-semibold">
            Inicia sesión
          </Link>
        </p>

      </div>
    </div>
  );
}