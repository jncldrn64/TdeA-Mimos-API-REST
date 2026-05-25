import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext.jsx";

// Función para formatear a pesos colombianos
const formatPrecio = (valor) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(valor);

export default function Catalogo() {
  const { agregarAlCarrito } = useCart(); 
  const API = import.meta.env.VITE_API_URL || "http://localhost:3500";
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [buscar, setBuscar] = useState("");
  const [buscarDebounce, setBuscarDebounce] = useState("");

  // Retraso para no saturar la base de datos al buscar
  useEffect(() => {
    const t = setTimeout(() => setBuscarDebounce(buscar), 400);
    return () => clearTimeout(t);
  }, [buscar]);

  // Consulta a SQL Server
  useEffect(() => {
    const fetchProductos = async () => {
      setCargando(true);
      setError(null);
      try {
        const url = buscarDebounce
          ? `${API}/api/producto?buscar=${encodeURIComponent(buscarDebounce)}`
          : `${API}/api/producto`;
        const res = await fetch(url);
        
        if (!res.ok) throw new Error("Fallo en la petición");
        
        const data = await res.json();
        if (data.success) {
          setProductos(data.data);
        } else {
          setError("No se pudieron cargar los productos de la base de datos.");
        }
      } catch {
        setError("Error de conexión. Verifica si el servidor backend está encendido.");
      } finally {
        setCargando(false);
      }
    };
    fetchProductos();
  }, [buscarDebounce, API]);

  return (
    <div className="w-full min-h-screen bg-[var(--color-fondo)] px-6 py-10 font-inherit">
      <div className="max-w-7xl mx-auto">

        {/* ── ENCABEZADO Y FILTRO DE BÚSQUEDA ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-[var(--color-borde)]">
          <div>
            <h1 className="text-3xl font-black text-[var(--color-texto)] tracking-tight">
              Catálogo de Productos
            </h1>
            <p className="text-xs text-[var(--color-texto-suave)] mt-1">
              Inventario sincronizado en tiempo real.
            </p>
          </div>

          <div className="w-full md:w-80">
            <div className="relative flex items-center bg-[var(--color-superficie)] border border-[var(--color-borde)] rounded-lg px-3 focus-within:border-[var(--color-acento)] transition-colors shadow-sm">
              <img src="/img/iconos/buscar.svg" alt="Buscar" className="w-4 h-4 opacity-40 mr-2" onError={(e) => e.target.style.display='none'} />
              <input
                type="text"
                placeholder="Buscar producto..."
                value={buscar}
                onChange={(e) => setBuscar(e.target.value)}
                className="w-full py-2.5 text-sm bg-transparent outline-none text-[var(--color-texto)] font-inherit"
              />
              {buscar && (
                <button onClick={() => setBuscar("")} className="text-xs text-gray-400 hover:text-gray-600 transition-colors ml-2 font-bold">✕</button>
              )}
            </div>
          </div>
        </div>

        {/* ── ESTADOS DE CARGA Y ERROR ── */}
        {cargando && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-[var(--color-secundario)] border-t-[var(--color-primario)] rounded-full animate-spin"></div>
            <p className="text-xs text-[var(--color-texto-suave)] animate-pulse">Sincronizando catálogo...</p>
          </div>
        )}

        {!cargando && error && (
          <div className="bg-red-50/50 border border-red-200 rounded-xl p-8 text-center max-w-md mx-auto flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-lg">!</div>
            <p className="text-sm text-red-800 font-medium">{error}</p>
          </div>
        )}

        {!cargando && !error && productos.length === 0 && (
          <div className="bg-[var(--color-superficie)] border border-[var(--color-borde)] rounded-xl p-12 text-center max-w-md mx-auto flex flex-col items-center gap-3 shadow-sm">
            <img src="/img/iconos/empty-box.svg" alt="Sin resultados" className="w-16 h-16 opacity-40 mb-2" onError={(e) => e.target.style.display='none'} />
            <h3 className="font-bold text-sm text-[var(--color-texto)]">No se encontraron productos</h3>
            <p className="text-xs text-[var(--color-texto-suave)] leading-relaxed">
              No hay coincidencias en el inventario actual.
            </p>
          </div>
        )}

        {/* ── REJILLA DE PRODUCTOS ── */}
        {!cargando && !error && productos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productos.map((producto) => {
              // Lógica visual: ¿Está agotado?
              const sinStock = producto.stock_disponible <= 0;

              return (
                <div
                  key={producto.id_producto}
                  className={`bg-[var(--color-superficie)] rounded-xl border border-[var(--color-borde)] overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col will-change-transform ${sinStock ? 'opacity-80' : 'hover:-translate-y-1'}`}
                >
                  <div className={`w-full h-44 bg-[var(--color-secundario-soft)] flex items-center justify-center p-4 border-b border-[var(--color-borde)]/60 relative select-none ${sinStock ? 'grayscale opacity-70' : ''}`}>
                    
                    {/* Etiqueta de Agotado sobre la imagen */}
                    {sinStock && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[1px] z-10">
                        <span className="bg-gray-800 text-white text-xs font-black uppercase tracking-widest px-3 py-1 rounded shadow-lg transform -rotate-12">
                          Agotado
                        </span>
                      </div>
                    )}

                    <img
                      src={producto.url_imagen || "/img/productos/default.png"}
                      alt={producto.nombre_producto}
                      className="w-full h-full object-contain mix-blend-multiply"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = "/img/iconos/empty-box.svg";
                        e.target.className = "w-12 h-12 opacity-30 object-contain";
                      }}
                    />
                  </div>

                  <div className="p-4 flex flex-col flex-grow gap-2">
                    <div className="flex-grow">
                      <h3 className="font-bold text-sm text-[var(--color-texto)] tracking-tight line-clamp-1">
                        {producto.nombre_producto}
                      </h3>
                      <p className="text-xs text-[var(--color-texto-suave)] mt-1 line-clamp-2 leading-relaxed min-h-[32px]">
                        {producto.descripcion_detallada || "Sin descripción disponible."}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-[var(--color-borde)]/60 mt-2">
                      <span className={`text-sm font-black tracking-tight ${sinStock ? 'text-[var(--color-texto-suave)] line-through' : 'text-[var(--color-texto)]'}`}>
                        {formatPrecio(producto.precio_unitario || 0)}
                      </span>
                      
                      {/* Botón Inteligente */}
                      <button
                        disabled={sinStock}
                        className={`text-xs font-bold px-3 py-2 rounded-md transition-all flex items-center gap-1.5 ${
                          sinStock 
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                            : 'bg-[var(--color-primario)] hover:bg-[var(--color-primario-dark)] text-white active:scale-95'
                        }`}
                        onClick={(e) => {
                          // Solo si el contexto retorna true, hacemos la animación
                          const exito = agregarAlCarrito(producto);
                          if (exito) {
                            const btn = e.currentTarget;
                            const textoOriginal = btn.innerHTML;
                            btn.innerHTML = '¡Añadido!';
                            btn.classList.replace('bg-[var(--color-primario)]', 'bg-green-600');
                            btn.classList.replace('hover:bg-[var(--color-primario-dark)]', 'hover:bg-green-700');
                            setTimeout(() => {
                              btn.innerHTML = textoOriginal;
                              btn.classList.replace('bg-green-600', 'bg-[var(--color-primario)]');
                              btn.classList.replace('hover:bg-green-700', 'hover:bg-[var(--color-primario-dark)]');
                            }, 800);
                          }
                        }}
                      >
                        {!sinStock && <img src="/img/iconos/agregar.svg" alt="" className="w-3.5 h-3.5 invert" onError={(e) => e.target.style.display='none'} />}
                        {sinStock ? 'Agotado' : 'Agregar'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}