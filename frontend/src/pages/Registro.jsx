import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Registro() {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);

  const navigate = useNavigate();
  const API = "http://localhost:3500";

  const handleRegister = async () => {
    if (!nombre || !apellido || !email || !password) {
      alert("Todos los campos son obligatorios");
      return;
    }

    setCargando(true);
    try {
      const response = await fetch(`${API}/api/usuario`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_rol: 1,
          nombre,
          apellido,
          email,
          password_hash: password,
          estado: "activo",
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("¡Cuenta creada! Ya puedes iniciar sesión.");
        navigate("/login");
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Error al registrar. ¿Está encendido el backend?");
    } finally {
      setCargando(false);
    }
  };

  return (
  <div className="min-h-screen flex items-center justify-center bg-[#7a2f0f]">
    <div className="bg-yellow-400 p-8 rounded-2xl w-96 shadow-xl">

      <div className="flex justify-center mb-6">
        <img
          src="https://www.mimos.com.co/wp-content/uploads/2022/07/newlogomimos.png"
          alt="Helados Mimos - Logo"
          className="h-14 object-contain"
        />
      </div>

      <div className="bg-[#7a2f0f]/10 rounded-xl p-6">
        <h2 className="text-center font-medium text-[#7a2f0f] text-lg mb-5">
          Crear cuenta
        </h2>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <label className="text-xs font-medium text-[#7a2f0f] block mb-1">
              Nombre
            </label>
            <div className="flex items-center bg-white rounded-lg border border-[#7a2f0f]/25 px-2.5 gap-1.5">
              <svg className="w-3.5 h-3.5 text-[#7a2f0f] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="4"/>
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
              <input
                type="text"
                placeholder="Juan"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full py-2.5 text-sm bg-transparent outline-none text-gray-700"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[#7a2f0f] block mb-1">
              Apellido
            </label>
            <div className="flex items-center bg-white rounded-lg border border-[#7a2f0f]/25 px-2.5 gap-1.5">
              <svg className="w-3.5 h-3.5 text-[#7a2f0f] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="4"/>
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
              <input
                type="text"
                placeholder="Pérez"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                className="w-full py-2.5 text-sm bg-transparent outline-none text-gray-700"
              />
            </div>
          </div>
        </div>

        <div className="mb-3">
          <label className="text-xs font-medium text-[#7a2f0f] block mb-1">
            Correo electrónico
          </label>
          <div className="flex items-center bg-white rounded-lg border border-[#7a2f0f]/25 px-3 gap-2">
            <svg className="w-4 h-4 text-[#7a2f0f] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
            <input
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full py-2.5 text-sm bg-transparent outline-none text-gray-700"
            />
          </div>
        </div>

        <div className="mb-5">
          <label className="text-xs font-medium text-[#7a2f0f] block mb-1">
            Contraseña
          </label>
          <div className="flex items-center bg-white rounded-lg border border-[#7a2f0f]/25 px-3 gap-2">
            <svg className="w-4 h-4 text-[#7a2f0f] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full py-2.5 text-sm bg-transparent outline-none text-gray-700"
            />
          </div>
        </div>

        <button
          onClick={handleRegister}
          disabled={cargando}
          className="w-full bg-[#7a2f0f] text-white py-3 rounded-lg font-medium text-sm hover:bg-[#5c2109] transition-colors disabled:opacity-50"
        >
          {cargando ? "Creando cuenta..." : "Crear cuenta"}
        </button>

        <p className="text-center mt-4 text-sm text-[#7a2f0f]">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="font-medium underline cursor-pointer">
            Iniciar sesión
          </Link>
        </p>
      </div>

    </div>
  </div>
);
}

export default Registro;