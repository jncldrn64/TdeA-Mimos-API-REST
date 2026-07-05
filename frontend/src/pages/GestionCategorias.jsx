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

export default function GestionCategorias() {
  const [categorias, setCategorias]   = useState([]);
  const [form, setForm]               = useState(FORM_INICIAL);
  const [editando, setEditando]       = useState(null); // { id, nombre, descripcion }
  const [cargando, setCargando]       = useState(false);
  const [creando, setCreando]         = useState(false);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError]             = useState("");

  useEffect(() => { cargarCategorias(); }, []);

  async function cargarCategorias() {
    setCargando(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/categorias`, { headers: getHeaders() });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setCategorias(data);
    } catch (e) {
      setError("No se pudo cargar las categorías: " + e.message);
    } finally {
      setCargando(false);
    }
  }

  async function handleCrear(e) {
    e.preventDefault();
    setCreando(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/categorias`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ nombre: form.nombre, descripcion: form.descripcion }),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setForm(FORM_INICIAL);
      await cargarCategorias();
    } catch (e) {
      setError("No se pudo crear la categoría: " + e.message);
    } finally {
      setCreando(false);
    }
  }

  async function handleActualizar(e) {
    e.preventDefault();
    setActualizando(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/categorias/${editando.idCategoria}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ nombre: editando.nombre, descripcion: editando.descripcion }),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setEditando(null);
      await cargarCategorias();
    } catch (e) {
      setError("No se pudo actualizar la categoría: " + e.message);
    } finally {
      setActualizando(false);
    }
  }

  async function handleEliminar(id) {
    if (!window.confirm("¿Seguro que deseas eliminar esta categoría?")) return;
    setError("");
    try {
      const res = await fetch(`${API}/api/categorias/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      await cargarCategorias();
    } catch (e) {
      setError("No se pudo eliminar la categoría: " + e.message);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-fondo)] p-6">
      <h1 className="text-2xl font-bold text-[var(--color-texto)] mb-6">
        Gestión de Categorías
      </h1>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-100 border border-red-300 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Formulario Crear */}
      <div className="bg-[var(--color-superficie)] border border-[var(--color-borde)] rounded-xl p-5 mb-8 shadow-sm">
        <h2 className="text-lg font-semibold text-[var(--color-texto)] mb-4">
          Nueva Categoría
        </h2>
        <form onSubmit={handleCrear} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="block text-sm text-[var(--color-texto-suave)] mb-1">Nombre *</label>
            <input
              type="text"
              required
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Ej: Helados Artesanales"
              className="w-full rounded-lg border border-[var(--color-borde)] bg-[var(--color-fondo)] text-[var(--color-texto)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-acento)]"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm text-[var(--color-texto-suave)] mb-1">Descripción</label>
            <input
              type="text"
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              placeholder="Descripción breve"
              className="w-full rounded-lg border border-[var(--color-borde)] bg-[var(--color-fondo)] text-[var(--color-texto)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-acento)]"
            />
          </div>
          <button
            type="submit"
            disabled={creando}
            className="bg-[var(--color-acento)] text-white font-semibold px-5 py-2 rounded-lg text-sm hover:opacity-90 disabled:opacity-50 transition-opacity whitespace-nowrap"
          >
            {creando ? "Creando…" : "+ Crear Categoría"}
          </button>
        </form>
      </div>

      {/* Tabla */}
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
              <tr>
                <td colSpan={4} className="text-center py-10 text-[var(--color-texto-suave)]">
                  Cargando…
                </td>
              </tr>
            ) : categorias.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-10 text-[var(--color-texto-suave)]">
                  No hay categorías registradas.
                </td>
              </tr>
            ) : (
              categorias.map((cat) => (
                <tr
                  key={cat.idCategoria}
                  className="border-b border-[var(--color-borde)] hover:bg-[var(--color-secundario-soft)] transition-colors"
                >
                  <td className="px-4 py-3 text-[var(--color-texto-suave)]">{cat.idCategoria}</td>
                  <td className="px-4 py-3 text-[var(--color-texto)] font-medium">{cat.nombre}</td>
                  <td className="px-4 py-3 text-[var(--color-texto-suave)]">{cat.descripcion ?? "—"}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => setEditando({ ...cat })}
                        className="text-[var(--color-acento)] border border-[var(--color-acento)] px-3 py-1 rounded-md text-xs font-semibold hover:bg-[var(--color-acento)] hover:text-white transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleEliminar(cat.idCategoria)}
                        className="text-red-600 border border-red-300 px-3 py-1 rounded-md text-xs font-semibold hover:bg-red-600 hover:text-white transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Editar */}
      {editando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-[var(--color-superficie)] border border-[var(--color-borde)] rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-bold text-[var(--color-texto)] mb-4">
              Editar Categoría #{editando.idCategoria}
            </h2>
            <form onSubmit={handleActualizar} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm text-[var(--color-texto-suave)] mb-1">Nombre *</label>
                <input
                  type="text"
                  required
                  value={editando.nombre}
                  onChange={(e) => setEditando({ ...editando, nombre: e.target.value })}
                  className="w-full rounded-lg border border-[var(--color-borde)] bg-[var(--color-fondo)] text-[var(--color-texto)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-acento)]"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--color-texto-suave)] mb-1">Descripción</label>
                <input
                  type="text"
                  value={editando.descripcion ?? ""}
                  onChange={(e) => setEditando({ ...editando, descripcion: e.target.value })}
                  className="w-full rounded-lg border border-[var(--color-borde)] bg-[var(--color-fondo)] text-[var(--color-texto)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-acento)]"
                />
              </div>
              <div className="flex gap-3 justify-end mt-2">
                <button
                  type="button"
                  onClick={() => setEditando(null)}
                  className="px-4 py-2 rounded-lg border border-[var(--color-borde)] text-[var(--color-texto-suave)] text-sm hover:bg-[var(--color-fondo)] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actualizando}
                  className="bg-[var(--color-acento)] text-white font-semibold px-5 py-2 rounded-lg text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {actualizando ? "Guardando…" : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
