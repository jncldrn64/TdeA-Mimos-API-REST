import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8081";

function getHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

const FORM_INICIAL = { idCarrito: "", idProducto: "", cantidad: "", precioSnapshot: "" };

export default function GestionCarritoItems() {
  const [items, setItems]           = useState([]);
  const [buscarId, setBuscarId]     = useState("");
  const [carritoActivo, setCarritoActivo] = useState("");
  const [form, setForm]             = useState(FORM_INICIAL);
  const [cargando, setCargando]     = useState(false);
  const [creando, setCreando]       = useState(false);
  const [error, setError]           = useState("");

  async function cargarItemsPorCarrito(idCarrito) {
    if (!idCarrito) return;
    setCargando(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/carrito-items/carrito/${idCarrito}`, { headers: getHeaders() });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setItems(await res.json());
      setCarritoActivo(idCarrito);
    } catch (e) {
      setError("No se pudo cargar los ítems: " + e.message);
    } finally {
      setCargando(false);
    }
  }

  async function handleCrear(e) {
    e.preventDefault();
    setCreando(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/carrito-items`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          idCarrito: parseInt(form.idCarrito, 10),
          idProducto: parseInt(form.idProducto, 10),
          cantidad: parseInt(form.cantidad, 10),
          precioSnapshot: parseFloat(form.precioSnapshot),
        }),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setForm(FORM_INICIAL);
      if (carritoActivo) await cargarItemsPorCarrito(carritoActivo);
    } catch (e) {
      setError("No se pudo agregar el ítem: " + e.message);
    } finally {
      setCreando(false);
    }
  }

  async function handleEliminar(id) {
    if (!window.confirm("¿Seguro que deseas eliminar este ítem?")) return;
    setError("");
    try {
      const res = await fetch(`${API}/api/carrito-items/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      if (carritoActivo) await cargarItemsPorCarrito(carritoActivo);
    } catch (e) {
      setError("No se pudo eliminar el ítem: " + e.message);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-fondo)] p-6">
      <h1 className="text-2xl font-bold text-[var(--color-texto)] mb-6">Gestión de Ítems de Carrito</h1>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-100 border border-red-300 text-red-700 text-sm">{error}</div>
      )}

      {/* Buscar por carrito */}
      <div className="bg-[var(--color-superficie)] border border-[var(--color-borde)] rounded-xl p-5 mb-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[var(--color-texto)] mb-3">Consultar ítems de un carrito</h2>
        <div className="flex gap-3">
          <input
            type="number"
            value={buscarId}
            onChange={(e) => setBuscarId(e.target.value)}
            placeholder="ID del carrito"
            className="flex-1 rounded-lg border border-[var(--color-borde)] bg-[var(--color-fondo)] text-[var(--color-texto)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-acento)]"
          />
          <button
            onClick={() => cargarItemsPorCarrito(buscarId)}
            className="bg-[var(--color-acento)] text-white font-semibold px-5 py-2 rounded-lg text-sm hover:opacity-90 transition-opacity"
          >
            Buscar
          </button>
        </div>
      </div>

      {/* Formulario Agregar Ítem */}
      <div className="bg-[var(--color-superficie)] border border-[var(--color-borde)] rounded-xl p-5 mb-8 shadow-sm">
        <h2 className="text-lg font-semibold text-[var(--color-texto)] mb-4">Agregar Ítem</h2>
        <form onSubmit={handleCrear} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { field: "idCarrito", label: "ID Carrito *", type: "number", placeholder: "1" },
            { field: "idProducto", label: "ID Producto *", type: "number", placeholder: "5" },
            { field: "cantidad", label: "Cantidad *", type: "number", placeholder: "2" },
            { field: "precioSnapshot", label: "Precio Snapshot *", type: "number", step: "0.01", placeholder: "8500.00" },
          ].map(({ field, label, type, placeholder, step }) => (
            <div key={field}>
              <label className="block text-xs text-[var(--color-texto-suave)] mb-1">{label}</label>
              <input
                type={type}
                step={step}
                required
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                placeholder={placeholder}
                className="w-full rounded-lg border border-[var(--color-borde)] bg-[var(--color-fondo)] text-[var(--color-texto)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-acento)]"
              />
            </div>
          ))}
          <div className="sm:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={creando}
              className="bg-[var(--color-acento)] text-white font-semibold px-6 py-2 rounded-lg text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {creando ? "Agregando…" : "+ Agregar Ítem"}
            </button>
          </div>
        </form>
      </div>

      {/* Tabla */}
      <div className="bg-[var(--color-superficie)] border border-[var(--color-borde)] rounded-xl shadow-sm overflow-x-auto">
        {carritoActivo && (
          <p className="px-4 pt-3 text-sm text-[var(--color-texto-suave)]">
            Mostrando ítems del carrito #{carritoActivo}
          </p>
        )}
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-borde)] bg-[var(--color-secundario-soft)]">
              <th className="text-left px-4 py-3 text-[var(--color-texto-suave)] font-semibold">ID Ítem</th>
              <th className="text-left px-4 py-3 text-[var(--color-texto-suave)] font-semibold">ID Carrito</th>
              <th className="text-left px-4 py-3 text-[var(--color-texto-suave)] font-semibold">ID Producto</th>
              <th className="text-left px-4 py-3 text-[var(--color-texto-suave)] font-semibold">Cantidad</th>
              <th className="text-left px-4 py-3 text-[var(--color-texto-suave)] font-semibold">Precio Snapshot</th>
              <th className="text-center px-4 py-3 text-[var(--color-texto-suave)] font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr><td colSpan={6} className="text-center py-10 text-[var(--color-texto-suave)]">Cargando…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-[var(--color-texto-suave)]">
                {carritoActivo ? "Este carrito no tiene ítems." : "Busca un carrito para ver sus ítems."}
              </td></tr>
            ) : (
              items.map((item) => (
                <tr key={item.idItem} className="border-b border-[var(--color-borde)] hover:bg-[var(--color-secundario-soft)] transition-colors">
                  <td className="px-4 py-3 text-[var(--color-texto-suave)]">{item.idItem}</td>
                  <td className="px-4 py-3 text-[var(--color-texto)]">{item.idCarrito}</td>
                  <td className="px-4 py-3 text-[var(--color-texto)]">{item.idProducto}</td>
                  <td className="px-4 py-3 text-[var(--color-texto)]">{item.cantidad}</td>
                  <td className="px-4 py-3 text-[var(--color-texto)]">
                    ${Number(item.precioSnapshot).toLocaleString("es-CO")}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleEliminar(item.idItem)}
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
