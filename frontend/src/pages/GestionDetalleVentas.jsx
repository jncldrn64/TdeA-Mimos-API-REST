import { useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8081";

function getHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

const FORM_INICIAL = { ventaId: "", productoId: "", cantidad: "", precioUnitario: "" };

export default function GestionDetalleVentas() {
  const [detalles, setDetalles]     = useState([]);
  const [buscarId, setBuscarId]     = useState("");
  const [ventaActiva, setVentaActiva] = useState("");
  const [form, setForm]             = useState(FORM_INICIAL);
  const [cargando, setCargando]     = useState(false);
  const [creando, setCreando]       = useState(false);
  const [error, setError]           = useState("");

  async function cargarDetallesPorVenta(idVenta) {
    if (!idVenta) return;
    setCargando(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/detalle-ventas/venta/${idVenta}`, { headers: getHeaders() });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setDetalles(await res.json());
      setVentaActiva(idVenta);
    } catch (e) {
      setError("No se pudo cargar los detalles: " + e.message);
    } finally {
      setCargando(false);
    }
  }

  async function handleCrear(e) {
    e.preventDefault();
    setCreando(true);
    setError("");
    try {
      const body = {
        ventaId: parseInt(form.ventaId, 10),
        productoId: parseInt(form.productoId, 10),
        cantidad: parseInt(form.cantidad, 10),
        precioUnitario: parseFloat(form.precioUnitario),
      };
      const res = await fetch(`${API}/api/detalle-ventas`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setForm(FORM_INICIAL);
      if (ventaActiva) await cargarDetallesPorVenta(ventaActiva);
    } catch (e) {
      setError("No se pudo agregar el detalle: " + e.message);
    } finally {
      setCreando(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-fondo)] p-6">
      <h1 className="text-2xl font-bold text-[var(--color-texto)] mb-6">Gestión de Detalles de Venta</h1>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-100 border border-red-300 text-red-700 text-sm">{error}</div>
      )}

      {/* Buscar por venta */}
      <div className="bg-[var(--color-superficie)] border border-[var(--color-borde)] rounded-xl p-5 mb-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[var(--color-texto)] mb-3">Consultar detalles de una venta</h2>
        <div className="flex gap-3">
          <input
            type="number"
            value={buscarId}
            onChange={(e) => setBuscarId(e.target.value)}
            placeholder="ID de venta"
            className="flex-1 rounded-lg border border-[var(--color-borde)] bg-[var(--color-fondo)] text-[var(--color-texto)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-acento)]"
          />
          <button
            onClick={() => cargarDetallesPorVenta(buscarId)}
            className="bg-[var(--color-acento)] text-white font-semibold px-5 py-2 rounded-lg text-sm hover:opacity-90 transition-opacity"
          >
            Buscar
          </button>
        </div>
      </div>

      {/* Formulario Agregar Detalle */}
      <div className="bg-[var(--color-superficie)] border border-[var(--color-borde)] rounded-xl p-5 mb-8 shadow-sm">
        <h2 className="text-lg font-semibold text-[var(--color-texto)] mb-4">Agregar Detalle</h2>
        <form onSubmit={handleCrear} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { field: "ventaId", label: "ID Venta *", type: "number", placeholder: "1" },
            { field: "productoId", label: "ID Producto *", type: "number", placeholder: "5" },
            { field: "cantidad", label: "Cantidad *", type: "number", placeholder: "2" },
            { field: "precioUnitario", label: "Precio Unitario *", type: "number", step: "0.01", placeholder: "8500.00" },
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
              {creando ? "Agregando…" : "+ Agregar Detalle"}
            </button>
          </div>
        </form>
      </div>

      {/* Tabla */}
      <div className="bg-[var(--color-superficie)] border border-[var(--color-borde)] rounded-xl shadow-sm overflow-x-auto">
        {ventaActiva && (
          <p className="px-4 pt-3 text-sm text-[var(--color-texto-suave)]">
            Detalles de la venta #{ventaActiva}
          </p>
        )}
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-borde)] bg-[var(--color-secundario-soft)]">
              <th className="text-left px-4 py-3 text-[var(--color-texto-suave)] font-semibold">ID</th>
              <th className="text-left px-4 py-3 text-[var(--color-texto-suave)] font-semibold">ID Venta</th>
              <th className="text-left px-4 py-3 text-[var(--color-texto-suave)] font-semibold">ID Producto</th>
              <th className="text-left px-4 py-3 text-[var(--color-texto-suave)] font-semibold">Cantidad</th>
              <th className="text-left px-4 py-3 text-[var(--color-texto-suave)] font-semibold">Precio Unitario</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr><td colSpan={5} className="text-center py-10 text-[var(--color-texto-suave)]">Cargando…</td></tr>
            ) : detalles.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 text-[var(--color-texto-suave)]">
                {ventaActiva ? "Esta venta no tiene detalles." : "Busca una venta para ver sus detalles."}
              </td></tr>
            ) : (
              detalles.map((d) => (
                <tr key={d.id} className="border-b border-[var(--color-borde)] hover:bg-[var(--color-secundario-soft)] transition-colors">
                  <td className="px-4 py-3 text-[var(--color-texto-suave)]">{d.id}</td>
                  <td className="px-4 py-3 text-[var(--color-texto)]">{d.ventaId}</td>
                  <td className="px-4 py-3 text-[var(--color-texto)]">{d.productoId}</td>
                  <td className="px-4 py-3 text-[var(--color-texto)]">{d.cantidad}</td>
                  <td className="px-4 py-3 text-[var(--color-texto)]">
                    ${Number(d.precioUnitario).toLocaleString("es-CO")}
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
