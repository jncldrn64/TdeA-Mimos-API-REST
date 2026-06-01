import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8081";

function getHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

const FORM_INICIAL = { usuarioId: "", ventaId: "", asunto: "", mensaje: "" };

const ESTADO_COLORES = {
  abierto: "bg-blue-100 text-blue-700",
  "en proceso": "bg-amber-100 text-amber-700",
  cerrado: "bg-green-100 text-green-700",
};

export default function GestionPQRS() {
  const [pqrsList, setPqrsList]     = useState([]);
  const [form, setForm]             = useState(FORM_INICIAL);
  const [cargando, setCargando]     = useState(false);
  const [creando, setCreando]       = useState(false);
  const [error, setError]           = useState("");

  useEffect(() => { cargarPQRS(); }, []);

  async function cargarPQRS() {
    setCargando(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/pqrs`, { headers: getHeaders() });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setPqrsList(await res.json());
    } catch (e) {
      setError("No se pudo cargar las PQRS: " + e.message);
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
        usuarioId: parseInt(form.usuarioId, 10),
        ventaId: form.ventaId ? parseInt(form.ventaId, 10) : null,
        asunto: form.asunto,
        mensaje: form.mensaje,
      };
      const res = await fetch(`${API}/api/pqrs`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `Error ${res.status}`);
      }
      setForm(FORM_INICIAL);
      await cargarPQRS();
    } catch (e) {
      setError("No se pudo crear la PQRS: " + e.message);
    } finally {
      setCreando(false);
    }
  }

  async function handleEliminar(id) {
    if (!window.confirm("¿Seguro que deseas eliminar esta PQRS?")) return;
    setError("");
    try {
      const res = await fetch(`${API}/api/pqrs/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      await cargarPQRS();
    } catch (e) {
      setError("No se pudo eliminar la PQRS: " + e.message);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-fondo)] p-6">
      <h1 className="text-2xl font-bold text-[var(--color-texto)] mb-6">Gestión de PQRS</h1>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-100 border border-red-300 text-red-700 text-sm">{error}</div>
      )}

      <div className="bg-[var(--color-superficie)] border border-[var(--color-borde)] rounded-xl p-5 mb-8 shadow-sm">
        <h2 className="text-lg font-semibold text-[var(--color-texto)] mb-4">Nueva PQRS</h2>
        <form onSubmit={handleCrear} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[var(--color-texto-suave)] mb-1">ID Usuario *</label>
            <input
              type="number"
              required
              value={form.usuarioId}
              onChange={(e) => setForm({ ...form, usuarioId: e.target.value })}
              placeholder="1"
              className="w-full rounded-lg border border-[var(--color-borde)] bg-[var(--color-fondo)] text-[var(--color-texto)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-acento)]"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--color-texto-suave)] mb-1">ID Venta (opcional)</label>
            <input
              type="number"
              value={form.ventaId}
              onChange={(e) => setForm({ ...form, ventaId: e.target.value })}
              placeholder="Dejar vacío si no aplica"
              className="w-full rounded-lg border border-[var(--color-borde)] bg-[var(--color-fondo)] text-[var(--color-texto)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-acento)]"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs text-[var(--color-texto-suave)] mb-1">Asunto *</label>
            <input
              type="text"
              required
              value={form.asunto}
              onChange={(e) => setForm({ ...form, asunto: e.target.value })}
              placeholder="Problema con mi pedido"
              className="w-full rounded-lg border border-[var(--color-borde)] bg-[var(--color-fondo)] text-[var(--color-texto)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-acento)]"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs text-[var(--color-texto-suave)] mb-1">Mensaje *</label>
            <textarea
              required
              rows={3}
              value={form.mensaje}
              onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
              placeholder="Describe tu solicitud…"
              className="w-full rounded-lg border border-[var(--color-borde)] bg-[var(--color-fondo)] text-[var(--color-texto)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-acento)] resize-none"
            />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={creando}
              className="bg-[var(--color-acento)] text-white font-semibold px-6 py-2 rounded-lg text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {creando ? "Enviando…" : "+ Crear PQRS"}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-[var(--color-superficie)] border border-[var(--color-borde)] rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="border-b border-[var(--color-borde)] bg-[var(--color-secundario-soft)]">
              <th className="text-left px-4 py-3 text-[var(--color-texto-suave)] font-semibold">ID</th>
              <th className="text-left px-4 py-3 text-[var(--color-texto-suave)] font-semibold">ID Usuario</th>
              <th className="text-left px-4 py-3 text-[var(--color-texto-suave)] font-semibold">ID Venta</th>
              <th className="text-left px-4 py-3 text-[var(--color-texto-suave)] font-semibold">Asunto</th>
              <th className="text-left px-4 py-3 text-[var(--color-texto-suave)] font-semibold">Estado</th>
              <th className="text-left px-4 py-3 text-[var(--color-texto-suave)] font-semibold">Fecha</th>
              <th className="text-left px-4 py-3 text-[var(--color-texto-suave)] font-semibold">Respuesta</th>
              <th className="text-center px-4 py-3 text-[var(--color-texto-suave)] font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr><td colSpan={8} className="text-center py-10 text-[var(--color-texto-suave)]">Cargando…</td></tr>
            ) : pqrsList.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-10 text-[var(--color-texto-suave)]">No hay PQRS registradas.</td></tr>
            ) : (
              pqrsList.map((p) => (
                <tr key={p.idPqrs} className="border-b border-[var(--color-borde)] hover:bg-[var(--color-secundario-soft)] transition-colors">
                  <td className="px-4 py-3 text-[var(--color-texto-suave)]">{p.idPqrs}</td>
                  <td className="px-4 py-3 text-[var(--color-texto)]">{p.usuarioId}</td>
                  <td className="px-4 py-3 text-[var(--color-texto-suave)]">{p.ventaId ?? "—"}</td>
                  <td className="px-4 py-3 text-[var(--color-texto)] max-w-[180px] truncate" title={p.asunto}>{p.asunto}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ESTADO_COLORES[p.estado] ?? "bg-gray-100 text-gray-600"}`}>
                      {p.estado ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-texto-suave)]">
                    {p.fechaCreacion ? new Date(p.fechaCreacion).toLocaleDateString("es-CO") : "—"}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-texto-suave)] max-w-[180px] truncate" title={p.respuesta ?? ""}>
                    {p.respuesta ?? <span className="italic text-[var(--color-texto-suave)] opacity-60">Sin respuesta</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleEliminar(p.idPqrs)}
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
