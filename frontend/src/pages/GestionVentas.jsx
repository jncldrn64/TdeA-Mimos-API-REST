import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8081";

function getHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

const FORM_INICIAL = {
  compradorId: "",
  procesadoPorId: "",
  total: "",
  estado: "",
  cedulaComprador: "",
  metodoPago: "",
  referenciaPago: "",
};

export default function GestionVentas() {
  const [ventas, setVentas]         = useState([]);
  const [form, setForm]             = useState(FORM_INICIAL);
  const [cargando, setCargando]     = useState(false);
  const [creando, setCreando]       = useState(false);
  const [error, setError]           = useState("");

  useEffect(() => { cargarVentas(); }, []);

  async function cargarVentas() {
    setCargando(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/ventas`, { headers: getHeaders() });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setVentas(await res.json());
    } catch (e) {
      setError("No se pudo cargar las ventas: " + e.message);
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
        compradorId: parseInt(form.compradorId, 10),
        procesadoPorId: form.procesadoPorId ? parseInt(form.procesadoPorId, 10) : null,
        total: parseFloat(form.total),
        estado: form.estado,
        cedulaComprador: form.cedulaComprador,
        metodoPago: form.metodoPago,
        referenciaPago: form.referenciaPago || null,
      };
      const res = await fetch(`${API}/api/ventas`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setForm(FORM_INICIAL);
      await cargarVentas();
    } catch (e) {
      setError("No se pudo crear la venta: " + e.message);
    } finally {
      setCreando(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-fondo)] p-6">
      <h1 className="text-2xl font-bold text-[var(--color-texto)] mb-6">Gestión de Ventas</h1>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-100 border border-red-300 text-red-700 text-sm">{error}</div>
      )}

      <div className="bg-[var(--color-superficie)] border border-[var(--color-borde)] rounded-xl p-5 mb-8 shadow-sm">
        <h2 className="text-lg font-semibold text-[var(--color-texto)] mb-4">Nueva Venta</h2>
        <form onSubmit={handleCrear} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[var(--color-texto-suave)] mb-1">ID Comprador *</label>
            <input type="number" required value={form.compradorId}
              onChange={(e) => setForm({ ...form, compradorId: e.target.value })}
              placeholder="1"
              className="w-full rounded-lg border border-[var(--color-borde)] bg-[var(--color-fondo)] text-[var(--color-texto)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-acento)]"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--color-texto-suave)] mb-1">ID Procesado por (opcional)</label>
            <input type="number" value={form.procesadoPorId}
              onChange={(e) => setForm({ ...form, procesadoPorId: e.target.value })}
              placeholder="Dejar vacío si es online"
              className="w-full rounded-lg border border-[var(--color-borde)] bg-[var(--color-fondo)] text-[var(--color-texto)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-acento)]"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--color-texto-suave)] mb-1">Total *</label>
            <input type="number" step="0.01" required value={form.total}
              onChange={(e) => setForm({ ...form, total: e.target.value })}
              placeholder="25000.00"
              className="w-full rounded-lg border border-[var(--color-borde)] bg-[var(--color-fondo)] text-[var(--color-texto)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-acento)]"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--color-texto-suave)] mb-1">Estado *</label>
            <input type="text" required value={form.estado}
              onChange={(e) => setForm({ ...form, estado: e.target.value })}
              placeholder="pendiente"
              className="w-full rounded-lg border border-[var(--color-borde)] bg-[var(--color-fondo)] text-[var(--color-texto)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-acento)]"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--color-texto-suave)] mb-1">Cédula Comprador *</label>
            <input type="text" required value={form.cedulaComprador}
              onChange={(e) => setForm({ ...form, cedulaComprador: e.target.value })}
              placeholder="1234567890"
              className="w-full rounded-lg border border-[var(--color-borde)] bg-[var(--color-fondo)] text-[var(--color-texto)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-acento)]"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--color-texto-suave)] mb-1">Método de pago *</label>
            <input type="text" required value={form.metodoPago}
              onChange={(e) => setForm({ ...form, metodoPago: e.target.value })}
              placeholder="efectivo / tarjeta / PSE"
              className="w-full rounded-lg border border-[var(--color-borde)] bg-[var(--color-fondo)] text-[var(--color-texto)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-acento)]"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs text-[var(--color-texto-suave)] mb-1">Referencia de pago</label>
            <input type="text" value={form.referenciaPago}
              onChange={(e) => setForm({ ...form, referenciaPago: e.target.value })}
              placeholder="REF-001 (opcional)"
              className="w-full rounded-lg border border-[var(--color-borde)] bg-[var(--color-fondo)] text-[var(--color-texto)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-acento)]"
            />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={creando}
              className="bg-[var(--color-acento)] text-white font-semibold px-6 py-2 rounded-lg text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {creando ? "Creando…" : "+ Crear Venta"}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-[var(--color-superficie)] border border-[var(--color-borde)] rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead>
            <tr className="border-b border-[var(--color-borde)] bg-[var(--color-secundario-soft)]">
              <th className="text-left px-4 py-3 text-[var(--color-texto-suave)] font-semibold">ID</th>
              <th className="text-left px-4 py-3 text-[var(--color-texto-suave)] font-semibold">Comprador</th>
              <th className="text-left px-4 py-3 text-[var(--color-texto-suave)] font-semibold">Total</th>
              <th className="text-left px-4 py-3 text-[var(--color-texto-suave)] font-semibold">Estado</th>
              <th className="text-left px-4 py-3 text-[var(--color-texto-suave)] font-semibold">Método Pago</th>
              <th className="text-left px-4 py-3 text-[var(--color-texto-suave)] font-semibold">Cédula</th>
              <th className="text-left px-4 py-3 text-[var(--color-texto-suave)] font-semibold">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr><td colSpan={7} className="text-center py-10 text-[var(--color-texto-suave)]">Cargando…</td></tr>
            ) : ventas.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-10 text-[var(--color-texto-suave)]">No hay ventas registradas.</td></tr>
            ) : (
              ventas.map((v) => (
                <tr key={v.id} className="border-b border-[var(--color-borde)] hover:bg-[var(--color-secundario-soft)] transition-colors">
                  <td className="px-4 py-3 text-[var(--color-texto-suave)]">{v.id}</td>
                  <td className="px-4 py-3 text-[var(--color-texto)]">{v.compradorId}</td>
                  <td className="px-4 py-3 text-[var(--color-texto)] font-medium">
                    ${Number(v.total).toLocaleString("es-CO")}
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-[var(--color-secundario-soft)] text-[var(--color-texto-suave)] text-xs font-semibold px-2 py-0.5 rounded-full">
                      {v.estado ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-texto-suave)]">{v.metodoPago ?? "—"}</td>
                  <td className="px-4 py-3 text-[var(--color-texto-suave)]">{v.cedulaComprador ?? "—"}</td>
                  <td className="px-4 py-3 text-[var(--color-texto-suave)]">
                    {v.fecha ? new Date(v.fecha).toLocaleDateString("es-CO") : "—"}
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
