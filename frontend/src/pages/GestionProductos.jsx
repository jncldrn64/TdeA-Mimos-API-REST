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
  nombreProducto: "",
  descripcionDetallada: "",
  precioUnitario: "",
  stockDisponible: "",
  urlImagen: "",
  idCategoria: "",
  fechaUltimoRestock: "",
};

export default function GestionProductos() {
  const [productos, setProductos]       = useState([]);
  const [categorias, setCategorias]     = useState([]);
  const [form, setForm]                 = useState(FORM_INICIAL);
  const [editando, setEditando]         = useState(null);
  const [cargando, setCargando]         = useState(false);
  const [creando, setCreando]           = useState(false);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError]               = useState("");

  useEffect(() => {
    cargarProductos();
    cargarCategorias();
  }, []);

  async function cargarProductos() {
    setCargando(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/productos`, { headers: getHeaders() });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setProductos(await res.json());
    } catch (e) {
      setError("No se pudo cargar los productos: " + e.message);
    } finally {
      setCargando(false);
    }
  }

  async function cargarCategorias() {
    try {
      const res = await fetch(`${API}/api/categorias`, { headers: getHeaders() });
      if (res.ok) setCategorias(await res.json());
    } catch (_) {}
  }

  function handleChange(e, obj, setObj) {
    setObj({ ...obj, [e.target.name]: e.target.value });
  }

  async function handleCrear(e) {
    e.preventDefault();
    setCreando(true);
    setError("");
    try {
      const body = {
        nombreProducto: form.nombreProducto,
        descripcionDetallada: form.descripcionDetallada,
        precioUnitario: parseFloat(form.precioUnitario),
        stockDisponible: parseInt(form.stockDisponible, 10),
        urlImagen: form.urlImagen || null,
        idCategoria: parseInt(form.idCategoria, 10),
        fechaUltimoRestock: form.fechaUltimoRestock || null,
      };
      const res = await fetch(`${API}/api/productos`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `Error ${res.status}`);
      }
      setForm(FORM_INICIAL);
      await cargarProductos();
    } catch (e) {
      setError("No se pudo crear el producto: " + e.message);
    } finally {
      setCreando(false);
    }
  }

  async function handleActualizar(e) {
    e.preventDefault();
    setActualizando(true);
    setError("");
    try {
      const body = {
        nombreProducto: editando.nombreProducto,
        descripcionDetallada: editando.descripcionDetallada,
        precioUnitario: parseFloat(editando.precioUnitario),
        stockDisponible: parseInt(editando.stockDisponible, 10),
        urlImagen: editando.urlImagen || null,
        idCategoria: parseInt(editando.idCategoria, 10),
        fechaUltimoRestock: editando.fechaUltimoRestock || null,
      };
      const res = await fetch(`${API}/api/productos/${editando.idProducto}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `Error ${res.status}`);
      }
      setEditando(null);
      await cargarProductos();
    } catch (e) {
      setError("No se pudo actualizar el producto: " + e.message);
    } finally {
      setActualizando(false);
    }
  }

  async function handleEliminar(id) {
    if (!window.confirm("¿Seguro que deseas eliminar este producto?")) return;
    setError("");
    try {
      const res = await fetch(`${API}/api/productos/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      await cargarProductos();
    } catch (e) {
      setError("No se pudo eliminar el producto: " + e.message);
    }
  }

  function abrirEdicion(p) {
    setEditando({
      idProducto: p.idProducto,
      nombreProducto: p.nombreProducto,
      descripcionDetallada: p.descripcionDetallada ?? "",
      precioUnitario: p.precioUnitario,
      stockDisponible: p.stockDisponible,
      urlImagen: p.urlImagen ?? "",
      idCategoria: categorias.find((c) => c.nombre === p.categoria)?.idCategoria ?? "",
      fechaUltimoRestock: p.fechaUltimoRestock ? p.fechaUltimoRestock.slice(0, 16) : "",
    });
  }

  const camposFormulario = (obj, setObj) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label className="block text-xs text-[var(--color-texto-suave)] mb-1">Nombre *</label>
        <input
          name="nombreProducto"
          type="text"
          required
          value={obj.nombreProducto}
          onChange={(e) => handleChange(e, obj, setObj)}
          placeholder="Ej: Helado de Fresa"
          className="w-full rounded-lg border border-[var(--color-borde)] bg-[var(--color-fondo)] text-[var(--color-texto)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-acento)]"
        />
      </div>
      <div>
        <label className="block text-xs text-[var(--color-texto-suave)] mb-1">Precio unitario *</label>
        <input
          name="precioUnitario"
          type="number"
          step="0.01"
          required
          value={obj.precioUnitario}
          onChange={(e) => handleChange(e, obj, setObj)}
          placeholder="8500.00"
          className="w-full rounded-lg border border-[var(--color-borde)] bg-[var(--color-fondo)] text-[var(--color-texto)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-acento)]"
        />
      </div>
      <div>
        <label className="block text-xs text-[var(--color-texto-suave)] mb-1">Stock disponible *</label>
        <input
          name="stockDisponible"
          type="number"
          required
          value={obj.stockDisponible}
          onChange={(e) => handleChange(e, obj, setObj)}
          placeholder="50"
          className="w-full rounded-lg border border-[var(--color-borde)] bg-[var(--color-fondo)] text-[var(--color-texto)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-acento)]"
        />
      </div>
      <div>
        <label className="block text-xs text-[var(--color-texto-suave)] mb-1">Categoría *</label>
        <select
          name="idCategoria"
          required
          value={obj.idCategoria}
          onChange={(e) => handleChange(e, obj, setObj)}
          className="w-full rounded-lg border border-[var(--color-borde)] bg-[var(--color-fondo)] text-[var(--color-texto)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-acento)]"
        >
          <option value="">Seleccionar…</option>
          {categorias.map((c) => (
            <option key={c.idCategoria} value={c.idCategoria}>{c.nombre}</option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className="block text-xs text-[var(--color-texto-suave)] mb-1">Descripción detallada</label>
        <textarea
          name="descripcionDetallada"
          rows={2}
          value={obj.descripcionDetallada}
          onChange={(e) => handleChange(e, obj, setObj)}
          placeholder="Descripción del producto…"
          className="w-full rounded-lg border border-[var(--color-borde)] bg-[var(--color-fondo)] text-[var(--color-texto)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-acento)] resize-none"
        />
      </div>
      <div>
        <label className="block text-xs text-[var(--color-texto-suave)] mb-1">URL de imagen</label>
        <input
          name="urlImagen"
          type="text"
          value={obj.urlImagen}
          onChange={(e) => handleChange(e, obj, setObj)}
          placeholder="https://..."
          className="w-full rounded-lg border border-[var(--color-borde)] bg-[var(--color-fondo)] text-[var(--color-texto)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-acento)]"
        />
      </div>
      <div>
        <label className="block text-xs text-[var(--color-texto-suave)] mb-1">Fecha último restock</label>
        <input
          name="fechaUltimoRestock"
          type="datetime-local"
          value={obj.fechaUltimoRestock}
          onChange={(e) => handleChange(e, obj, setObj)}
          className="w-full rounded-lg border border-[var(--color-borde)] bg-[var(--color-fondo)] text-[var(--color-texto)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-acento)]"
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--color-fondo)] p-6">
      <h1 className="text-2xl font-bold text-[var(--color-texto)] mb-6">Gestión de Productos</h1>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-100 border border-red-300 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Formulario Crear */}
      <div className="bg-[var(--color-superficie)] border border-[var(--color-borde)] rounded-xl p-5 mb-8 shadow-sm">
        <h2 className="text-lg font-semibold text-[var(--color-texto)] mb-4">Nuevo Producto</h2>
        <form onSubmit={handleCrear} className="flex flex-col gap-4">
          {camposFormulario(form, setForm)}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={creando}
              className="bg-[var(--color-acento)] text-white font-semibold px-6 py-2 rounded-lg text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {creando ? "Creando…" : "+ Crear Producto"}
            </button>
          </div>
        </form>
      </div>

      {/* Tabla */}
      <div className="bg-[var(--color-superficie)] border border-[var(--color-borde)] rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead>
            <tr className="border-b border-[var(--color-borde)] bg-[var(--color-secundario-soft)]">
              <th className="text-left px-4 py-3 text-[var(--color-texto-suave)] font-semibold">ID</th>
              <th className="text-left px-4 py-3 text-[var(--color-texto-suave)] font-semibold">Nombre</th>
              <th className="text-left px-4 py-3 text-[var(--color-texto-suave)] font-semibold">Precio</th>
              <th className="text-left px-4 py-3 text-[var(--color-texto-suave)] font-semibold">Stock</th>
              <th className="text-left px-4 py-3 text-[var(--color-texto-suave)] font-semibold">Categoría</th>
              <th className="text-left px-4 py-3 text-[var(--color-texto-suave)] font-semibold">Activo</th>
              <th className="text-center px-4 py-3 text-[var(--color-texto-suave)] font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-[var(--color-texto-suave)]">Cargando…</td>
              </tr>
            ) : productos.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-[var(--color-texto-suave)]">No hay productos registrados.</td>
              </tr>
            ) : (
              productos.map((p) => (
                <tr
                  key={p.idProducto}
                  className="border-b border-[var(--color-borde)] hover:bg-[var(--color-secundario-soft)] transition-colors"
                >
                  <td className="px-4 py-3 text-[var(--color-texto-suave)]">{p.idProducto}</td>
                  <td className="px-4 py-3 text-[var(--color-texto)] font-medium">{p.nombreProducto}</td>
                  <td className="px-4 py-3 text-[var(--color-texto)]">
                    ${Number(p.precioUnitario).toLocaleString("es-CO")}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-texto)]">{p.stockDisponible}</td>
                  <td className="px-4 py-3 text-[var(--color-texto-suave)]">{p.categoria ?? "—"}</td>
                  <td className="px-4 py-3">
                    {p.estaActivo ? (
                      <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">Activo</span>
                    ) : (
                      <span className="bg-red-100 text-red-600 text-xs font-semibold px-2 py-0.5 rounded-full">Inactivo</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => abrirEdicion(p)}
                        className="text-[var(--color-acento)] border border-[var(--color-acento)] px-3 py-1 rounded-md text-xs font-semibold hover:bg-[var(--color-acento)] hover:text-white transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleEliminar(p.idProducto)}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-[var(--color-superficie)] border border-[var(--color-borde)] rounded-2xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-[var(--color-texto)] mb-4">
              Editar Producto #{editando.idProducto}
            </h2>
            <form onSubmit={handleActualizar} className="flex flex-col gap-4">
              {camposFormulario(editando, setEditando)}
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
