import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8081";

function getHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

const FORM_INICIAL = { ventaId: "", direccion: "", ciudad: "", fechaEntregaEstimada: "" };

const ESTADO_COLORES = {
  preparando: "bg-amber-100 text-amber-700",
  enviado: "bg-blue-100 text-blue-700",
  entregado: "bg-green-100 text-green-700",
  cancelado: "bg-red-100 text-red-600",
};

export default function GestionEnvios() {
  const [envios, setEnvios]         = useState([]);
  const [form, setForm]             = useState(FORM_INICIAL);
  const [cargando, setCargando]     = useState(false);
  const [creando, setCreando]       = useState(false);
  const [error, setError]           = useState("");

  useEffect(() => { cargarEnvios(); }, []);

  async function cargarEnvios() {
    setCargando(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/envios`, { headers: getHeaders() });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setEnvios(await res.json());
    } catch (e) {
      setError("No se pudo cargar los envíos: " + e.message);
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
        direccion: form.direccion,
        ciudad: form.ciudad,
        fechaEntregaEstimada: form.fechaEntregaEstimada || null,
      };
      const res = await fetch(`${API}/api/envios`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `Error ${res.status}`);
      }
      setForm(FORM_INICIAL);
      await cargarEnvios();
    } catch (e) {
      setError("No se pudo crear el envío: " + e.message);
    } finally {
      setCreando(false);
    }
  }

  async function handleEliminar(id) {
    if (!window.confirm("¿Seguro que deseas eliminar este envío?")) return;
    setError("");
    try {
      const res = await fetch(`${API}/api/envios/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      await cargarEnvios();
    } catch (e) {
      setError("No se pudo eliminar el envío: " + e.message);
    }
  }

  function fmtFecha(f) {
    return f ? new Date(f).toLocaleString("es-CO") : "—";
  }

  return (
    <div className="min-h-screen bg-[var(--color-fondo)] p-6">
      <h1 className="text-2xl font-bold text-[var(--color-texto)] mb-6">Gestión de Envíos</h1>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-100 border border-red-300 text-red-700 text-sm">{error}</div>
      )}

      <div className="bg-[var(--color-superficie)] border border-[var(--color-borde)] rounded-xl p-5 mb-8 shadow-sm">
        <h2 className="text-lg font-semibold text-[var(--color-texto)] mb-4">Nuevo Envío</h2>
        <form onSubmit={handleCrear} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[var(--color-texto-suave)] mb-1">ID Venta *</label>
            <input
              type="number"
              required
              value={form.ventaId}
              onChange={(e) => setForm({ ...form, ventaId: e.target.value })}
              placeholder="1"
              className="w-full rounded-lg border border-[var(--color-borde)] bg-[var(--color-fondo)] text-[var(--color-texto)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-acento)]"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--color-texto-suave)] mb-1">Ciudad *</label>
            <input
              type="text"
              required
              value={form.ciudad}
              onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
              placeholder="Medellín"
              className="w-full rounded-lg border border-[var(--color-borde)] bg-[var(--color-fondo)] text-[var(--color-texto)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-acento)]"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs text-[var(--color-texto-suave)] mb-1">Dirección *</label>
            <input
              type="text"
              required
              value={form.direccion}
              onChange={(e) => setForm({ ...form, direccion: e.target.value })}
              placeholder="Calle 50 # 10-20"
              className="w-full rounded-lg border border-[var(--color-borde)] bg-[var(--color-fondo)] text-[var(--color-texto)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-acento)]"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--color-texto-suave)] mb-1">Fecha de entrega estimada</label>
            <input
              type="datetime-local"
              value={form.fechaEntregaEstimada}
              onChange={(e) => setForm({ ...form, fechaEntregaEstimada: e.target.value })}
              className="w-full rounded-lg border border-[var(--color-borde)] bg-[var(--color-fondo)] text-[var(--color-texto)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-acento)]"
            />
          </div>
          <div className="flex items-end justify-end">
            <button
              type="submit"
              disabled={creando}
              className="bg-[var(--color-acento)] text-white font-semibold px-6 py-2 rounded-lg text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {creando ? "Creando…" : "+ Crear Envío"}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-[var(--color-superficie)] border border-[var(--color-borde)] rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="border-b border-[var(--color-borde)] bg-[var(--color-secundario-soft)]">
              <th className="text-left px-4 py-3 text-[var(--color-texto-suave)] font-semibold">ID Envío</th>
              <th className="text-left px-4 py-3 text-[var(--color-texto-suave)] font-semibold">ID Venta</th>
              <th className="text-left px-4 py-3 text-[var(--color-texto-suave)] font-semibold">Dirección</th>
              <th className="text-left px-4 py-3 text-[var(--color-texto-suave)] font-semibold">Ciudad</th>
              <th className="text-left px-4 py-3 text-[var(--color-texto-suave)] font-semibold">Estado</th>
              <th className="text-left px-4 py-3 text-[var(--color-texto-suave)] font-semibold">Despacho</th>
              <th className="text-left px-4 py-3 text-[var(--color-texto-suave)] font-semibold">Entrega Est.</th>
              <th className="text-center px-4 py-3 text-[var(--color-texto-suave)] font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr><td colSpan={8} className="text-center py-10 text-[var(--color-texto-suave)]">Cargando…</td></tr>
            ) : envios.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-10 text-[var(--color-texto-suave)]">No hay envíos registrados.</td></tr>
            ) : (
              envios.map((env) => (
                <tr key={env.idEnvio} className="border-b border-[var(--color-borde)] hover:bg-[var(--color-secundario-soft)] transition-colors">
                  <td className="px-4 py-3 text-[var(--color-texto-suave)]">{env.idEnvio}</td>
                  <td className="px-4 py-3 text-[var(--color-texto)]">{env.ventaId}</td>
                  <td className="px-4 py-3 text-[var(--color-texto-suave)]">{env.direccion}</td>
                  <td className="px-4 py-3 text-[var(--color-texto-suave)]">{env.ciudad}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ESTADO_COLORES[env.estadoEnvio] ?? "bg-gray-100 text-gray-600"}`}>
                      {env.estadoEnvio ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-texto-suave)]">{fmtFecha(env.fechaDespacho)}</td>
                  <td className="px-4 py-3 text-[var(--color-texto-suave)]">{fmtFecha(env.fechaEntregaEstimada)}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleEliminar(env.idEnvio)}
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
