import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Registro() {
  const navigate = useNavigate();
  const [formData, setFormulario] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    confirmarPassword: ""
  });
  
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const API = import.meta.env.VITE_API_URL || "http://localhost:3500";

  const handleChange = (e) => {
    setFormulario({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegistro = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmarPassword) {
      return setError("Las contraseñas no coinciden.");
    }
    if (formData.password.length < 6) {
      return setError("La contraseña debe tener al menos 6 caracteres.");
    }

    setCargando(true);

    try {
      const payload = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        password_hash: formData.password, // ✅ Corregido
        id_rol: 2,                        // ✅ Corregido (2 = Cliente)
        estado: "activo"
      };

      const res = await fetch(`${API}/api/usuario`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok && (data.success !== false)) {
        alert("¡Cuenta creada con éxito! Ahora puedes iniciar sesión.");
        navigate("/login");
      } else {
        setError(data.message || data.error || "Ocurrió un error al intentar registrarte. Verifica que el correo no exista.");
      }
    } catch (err) {
      console.error(err);
      setError("Falla de red. Verifica que el servidor Backend esté encendido.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-6 bg-[var(--color-fondo)] font-inherit">
      <div className="w-full max-w-md bg-[var(--color-superficie)] p-8 rounded-2xl shadow-sm border border-[var(--color-borde)]">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-[var(--color-texto)] tracking-tight">Crear Cuenta</h1>
          <p className="text-sm text-[var(--color-texto-suave)] mt-2">Únete a Mimos y gestiona tus pedidos fácilmente</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm font-bold rounded-lg text-center animate-in fade-in">
            {error}
          </div>
        )}

        <form onSubmit={handleRegistro} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[var(--color-texto-suave)] uppercase mb-1">Nombre</label>
              <input type="text" required name="nombre" value={formData.nombre} onChange={handleChange} className="w-full p-3 bg-[var(--color-fondo)] border border-[var(--color-borde)] rounded-lg text-sm outline-none focus:border-[var(--color-acento)] transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--color-texto-suave)] uppercase mb-1">Apellido</label>
              <input type="text" required name="apellido" value={formData.apellido} onChange={handleChange} className="w-full p-3 bg-[var(--color-fondo)] border border-[var(--color-borde)] rounded-lg text-sm outline-none focus:border-[var(--color-acento)] transition-colors" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--color-texto-suave)] uppercase mb-1">Correo Electrónico</label>
            <input type="email" required name="email" value={formData.email} onChange={handleChange} className="w-full p-3 bg-[var(--color-fondo)] border border-[var(--color-borde)] rounded-lg text-sm outline-none focus:border-[var(--color-acento)] transition-colors" />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--color-texto-suave)] uppercase mb-1">Contraseña</label>
            <input type="password" required name="password" minLength="6" value={formData.password} onChange={handleChange} className="w-full p-3 bg-[var(--color-fondo)] border border-[var(--color-borde)] rounded-lg text-sm outline-none focus:border-[var(--color-acento)] transition-colors" />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--color-texto-suave)] uppercase mb-1">Confirmar Contraseña</label>
            <input type="password" required name="confirmarPassword" minLength="6" value={formData.confirmarPassword} onChange={handleChange} className="w-full p-3 bg-[var(--color-fondo)] border border-[var(--color-borde)] rounded-lg text-sm outline-none focus:border-[var(--color-acento)] transition-colors" />
          </div>

          <button type="submit" disabled={cargando} className="w-full bg-[var(--color-primario)] hover:bg-[var(--color-primario-dark)] text-white font-bold py-3.5 rounded-lg transition-transform active:scale-95 disabled:opacity-50 mt-4 shadow-sm uppercase tracking-wider text-sm">
            {cargando ? 'Registrando...' : 'Registrarme'}
          </button>
        </form>

        <p className="text-center text-sm text-[var(--color-texto-suave)] mt-6">
          ¿Ya tienes cuenta? <Link to="/login" className="text-[var(--color-acento)] font-bold hover:underline">Inicia Sesión aquí</Link>
        </p>
      </div>
    </div>
  );
}