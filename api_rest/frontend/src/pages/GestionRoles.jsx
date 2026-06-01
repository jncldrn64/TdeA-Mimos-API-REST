import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8081";

function getHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

const FORM_INICIAL = { nombre: "", descripcion: "" };

export default function GestionRoles() {
  const [roles, setRoles]       = useState([]);
  const [form, setForm]         = useState(FORM_INICIAL);
  const [cargando, setCargando] = useState(false);
  const [creando, setCreando]   = useState(false);
  const [error, setError]       = useState("");

  useEffect(() => { cargarRoles(); }, []);

  async function cargarRoles() {
    setCargando(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/roles`, { headers: getHeaders() });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setRoles(await res.json());
    } catch (e) {
      setError("No se pudo cargar los roles: " + e.message);
    } finally {
      setCargando(false);
    }
  }

  async function handleCrear(e) {
    e.preventDefault();
    setCreando(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/roles`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ nombre: form.nombre, descripcion: form.descripcion }),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setForm(FORM_INICIAL);
      await cargarRoles();
    } catch (e) {
      setError("No se pudo crear el rol: " + e.message);
    } finally {
      setCreando(false);
    }
  }

  async function handleEliminar(id) {
    if (!window.confirm("¿Seguro que deseas eliminar este rol?")) return;
    setError("");
    try {
      const res = await fetch(`${API}/api/roles/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      await cargarRoles();
    } catch (e) {
      setError("No se pudo eliminar el rol: " + e.message);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-fondo)] p-6">
      <h1 className="text-2xl font-bold text-[var(--color-texto)] mb-6">Gestión de Roles</h1>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-100 border border-red-300 text-red-700 text-sm">{error}</div>
      )}

      <div className="bg-[var(--color-superficie)] border border-[var(--color-borde)] rounded-xl p-5 mb-8 shadow-sm">
        <h2 className="text-lg font-semibold text-[var(--color-texto)] mb-4">Nuevo Rol</h2>
        <form onSubmit={handleCrear} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="block text-xs text-[var(--color-texto-suave)] mb-1">Nombre *</label>
            <input
              type="text"
              required
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Ej: ADMIN"
              className="w-full rounded-lg border border-[var(--color-borde)] bg-[var(--color-fondo)] text-[var(--color-texto)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-acento)]"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-[var(--color-texto-suave)] mb-1">Descripción</label>
            <input
              type="text"
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              placeholder="Descripción del rol"
              className="w-full rounded-lg border border-[var(--color-borde)] bg-[var(--color-fondo)] text-[var(--color-texto)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-acento)]"
            />
          </div>
          <button
            type="submit"
            disabled={creando}
            className="bg-[var(--color-acento)] text-white font-semibold px-5 py-2 rounded-lg text-sm hover:opacity-90 disabled:opacity-50 transition-opacity whitespace-nowrap"
          >
            {creando ? "Creando…" : "+ Crear Rol"}
          </button>
        </form>
      </div>

      <div className="bg-[var(--color-superficie)] border border-[var(--color-borde)] rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-borde)] bg-[var(--color-secundario-soft)]">
              <th className="text-left px-4 py-3 text-[var(--color-texto-suave)] font-semibold">ID</th>
              <th className="text-left px-4 py-3 text-[var(--color-texto-suave)] font-semibold">Nombre</th>
              <th className="text-left px-4 py-3 text-[var(--color-texto-suave)] font-semibold">Descripción</th>
              <th className="text-center px-4 py-3 text-[var(--color-texto-suave)] font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr><td colSpan={4} className="text-center py-10 text-[var(--color-texto-suave)]">Cargando…</td></tr>
            ) : roles.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-10 text-[var(--color-texto-suave)]">No hay roles registrados.</td></tr>
            ) : (
              roles.map((r) => (
                <tr key={r.idRol} className="border-b border-[var(--color-borde)] hover:bg-[var(--color-secundario-soft)] transition-colors">
                  <td className="px-4 py-3 text-[var(--color-texto-suave)]">{r.idRol}</td>
                  <td className="px-4 py-3 text-[var(--color-texto)] font-medium">{r.nombre}</td>
                  <td className="px-4 py-3 text-[var(--color-texto-suave)]">{r.descripcion ?? "—"}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleEliminar(r.idRol)}
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
