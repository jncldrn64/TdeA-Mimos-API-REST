import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8081";

function getHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

const FORM_INICIAL = { nombre: "", apellido: "", email: "", password: "", idRol: "" };

export default function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles]       = useState([]);
  const [form, setForm]         = useState(FORM_INICIAL);
  const [cargando, setCargando] = useState(false);
  const [creando, setCreando]   = useState(false);
  const [error, setError]       = useState("");

  useEffect(() => {
    cargarUsuarios();
    cargarRoles();
  }, []);

  async function cargarUsuarios() {
    setCargando(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/usuarios`, { headers: getHeaders() });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setUsuarios(await res.json());
    } catch (e) {
      setError("No se pudo cargar los usuarios: " + e.message);
    } finally {
      setCargando(false);
    }
  }

  async function cargarRoles() {
    try {
      const res = await fetch(`${API}/api/roles`, { headers: getHeaders() });
      if (res.ok) setRoles(await res.json());
    } catch (_) {}
  }

  async function handleCrear(e) {
    e.preventDefault();
    setCreando(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/usuarios`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          nombre: form.nombre,
          apellido: form.apellido,
          email: form.email,
          password: form.password,
          idRol: parseInt(form.idRol, 10),
        }),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `Error ${res.status}`);
      }
      setForm(FORM_INICIAL);
      await cargarUsuarios();
    } catch (e) {
      setError("No se pudo crear el usuario: " + e.message);
    } finally {
      setCreando(false);
    }
  }

  async function handleEliminar(id) {
    if (!window.confirm("¿Seguro que deseas eliminar este usuario?")) return;
    setError("");
    try {
      const res = await fetch(`${API}/api/usuarios/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      await cargarUsuarios();
    } catch (e) {
      setError("No se pudo eliminar el usuario: " + e.message);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-fondo)] p-6">
      <h1 className="text-2xl font-bold text-[var(--color-texto)] mb-6">Gestión de Usuarios</h1>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-100 border border-red-300 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Formulario Crear */}
      <div className="bg-[var(--color-superficie)] border border-[var(--color-borde)] rounded-xl p-5 mb-8 shadow-sm">
        <h2 className="text-lg font-semibold text-[var(--color-texto)] mb-4">Nuevo Usuario</h2>
        <form onSubmit={handleCrear} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[var(--color-texto-suave)] mb-1">Nombre *</label>
            <input
              type="text"
              required
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Juan"
              className="w-full rounded-lg border border-[var(--color-borde)] bg-[var(--color-fondo)] text-[var(--color-texto)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-acento)]"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--color-texto-suave)] mb-1">Apellido *</label>
            <input
              type="text"
              required
              value={form.apellido}
              onChange={(e) => setForm({ ...form, apellido: e.target.value })}
              placeholder="Pérez"
              className="w-full rounded-lg border border-[var(--color-borde)] bg-[var(--color-fondo)] text-[var(--color-texto)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-acento)]"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--color-texto-suave)] mb-1">Email *</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="juan@mimos.co"
              className="w-full rounded-lg border border-[var(--color-borde)] bg-[var(--color-fondo)] text-[var(--color-texto)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-acento)]"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--color-texto-suave)] mb-1">Contraseña *</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              className="w-full rounded-lg border border-[var(--color-borde)] bg-[var(--color-fondo)] text-[var(--color-texto)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-acento)]"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--color-texto-suave)] mb-1">Rol *</label>
            <select
              required
              value={form.idRol}
              onChange={(e) => setForm({ ...form, idRol: e.target.value })}
              className="w-full rounded-lg border border-[var(--color-borde)] bg-[var(--color-fondo)] text-[var(--color-texto)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-acento)]"
            >
              <option value="">Seleccionar…</option>
              {roles.map((r) => (
                <option key={r.idRol} value={r.idRol}>{r.nombre}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2 flex justify-end mt-1">
            <button
              type="submit"
              disabled={creando}
              className="bg-[var(--color-acento)] text-white font-semibold px-6 py-2 rounded-lg text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {creando ? "Creando…" : "+ Crear Usuario"}
            </button>
          </div>
        </form>
      </div>

      {/* Tabla */}
      <div className="bg-[var(--color-superficie)] border border-[var(--color-borde)] rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="border-b border-[var(--color-borde)] bg-[var(--color-secundario-soft)]">
              <th className="text-left px-4 py-3 text-[var(--color-texto-suave)] font-semibold">ID</th>
              <th className="text-left px-4 py-3 text-[var(--color-texto-suave)] font-semibold">Nombre</th>
              <th className="text-left px-4 py-3 text-[var(--color-texto-suave)] font-semibold">Email</th>
              <th className="text-left px-4 py-3 text-[var(--color-texto-suave)] font-semibold">Rol</th>
              <th className="text-left px-4 py-3 text-[var(--color-texto-suave)] font-semibold">Estado</th>
              <th className="text-left px-4 py-3 text-[var(--color-texto-suave)] font-semibold">Registro</th>
              <th className="text-center px-4 py-3 text-[var(--color-texto-suave)] font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr><td colSpan={7} className="text-center py-10 text-[var(--color-texto-suave)]">Cargando…</td></tr>
            ) : usuarios.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-10 text-[var(--color-texto-suave)]">No hay usuarios registrados.</td></tr>
            ) : (
              usuarios.map((u) => (
                <tr key={u.idUsuario} className="border-b border-[var(--color-borde)] hover:bg-[var(--color-secundario-soft)] transition-colors">
                  <td className="px-4 py-3 text-[var(--color-texto-suave)]">{u.idUsuario}</td>
                  <td className="px-4 py-3 text-[var(--color-texto)] font-medium">{u.nombre} {u.apellido}</td>
                  <td className="px-4 py-3 text-[var(--color-texto-suave)]">{u.email}</td>
                  <td className="px-4 py-3 text-[var(--color-texto-suave)]">{u.rol ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${u.estado === "activo" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                      {u.estado ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-texto-suave)]">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString("es-CO") : "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleEliminar(u.idUsuario)}
                      className="text-red-600 border border-red-300 px-3 py-1 rounded-md text-xs font-semibold hover:bg-red-600 hover:text-white transition-colors"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
