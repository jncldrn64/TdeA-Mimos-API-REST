import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext.jsx";

export default function Catalogo() {
  const { agregarAlCarrito } = useCart();
  
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState(null); // null = Todos
  const [cargando, setCargando] = useState(true);

  const API = import.meta.env.VITE_API_URL || "http://localhost:3500";

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Hacemos ambas peticiones al mismo tiempo (como en OtraBranch)
        const [resProductos, resCategorias] = await Promise.all([
          fetch(`${API}/api/producto`),
          fetch(`${API}/api/categorias`)
        ]);

        const dataProductos = await resProductos.json();
        const dataCategorias = await resCategorias.json();

        if (dataProductos.success || dataProductos.length > 0) {
          setProductos(dataProductos.data || dataProductos);
        }
        
        if (dataCategorias.success) {
          setCategorias(dataCategorias.data);
        }
      } catch (error) {
        console.error("Error al cargar el catálogo:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [API]);

  // Filtramos los productos según la categoría seleccionada
  const productosFiltrados = categoriaActiva 
    ? productos.filter(p => p.id_categoria === categoriaActiva)
    : productos;

  if (cargando) {
    return <div className="min-h-[70vh] flex items-center justify-center font-inherit text-[var(--color-texto-suave)] animate-pulse">Cargando menú...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 font-inherit">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-black text-[var(--color-texto)] mb-4 tracking-tight uppercase">Nuestro Menú</h1>
        <p className="text-[var(--color-texto-suave)] max-w-2xl mx-auto text-sm">Descubre nuestra selección de sabores únicos y especialidades preparadas con la mejor calidad.</p>
      </div>

      {/* ── CHIPS DE CATEGORÍAS (Extraído de la lógica de OtraBranch) ── */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        <button 
          onClick={() => setCategoriaActiva(null)}
          className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-sm border ${
            categoriaActiva === null 
              ? 'bg-[var(--color-primario)] text-white border-[var(--color-primario)]' 
              : 'bg-[var(--color-superficie)] text-[var(--color-texto)] border-[var(--color-borde)] hover:border-[var(--color-primario)]'
          }`}
        >
          Todos
        </button>
        
        {categorias.map(cat => (
          <button 
            key={cat.id_categoria}
            onClick={() => setCategoriaActiva(cat.id_categoria)}
            className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-sm border ${
              categoriaActiva === cat.id_categoria 
                ? 'bg-[var(--color-primario)] text-white border-[var(--color-primario)]' 
                : 'bg-[var(--color-superficie)] text-[var(--color-texto)] border-[var(--color-borde)] hover:border-[var(--color-primario)]'
            }`}
          >
            {cat.nombre}
          </button>
        ))}
      </div>

      {/* ── GRID DE PRODUCTOS ── */}
      {productosFiltrados.length === 0 ? (
        <div className="text-center py-20 text-[var(--color-texto-suave)]">
          No hay productos disponibles en esta categoría por el momento.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {productosFiltrados.map((prod) => {
            const agotado = prod.stock_disponible <= 0;

            return (
              <div key={prod.id_producto} className={`bg-[var(--color-superficie)] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-[var(--color-borde)] flex flex-col group ${agotado ? 'opacity-70 grayscale-[50%]' : ''}`}>
                <div className="relative aspect-square overflow-hidden bg-[var(--color-fondo)] p-6">
                  {agotado && (
                     <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded shadow-md z-10 tracking-widest">Agotado</div>
                  )}
                  <img 
                    src={prod.url_imagen || "/img/productos/default.png"} 
                    alt={prod.nombre_producto} 
                    className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" 
                    onError={(e) => { e.target.src = "/img/productos/default.png" }}
                  />
                </div>
                
                <div className="p-5 flex flex-col flex-1 border-t border-[var(--color-borde)]">
                  <h3 className="font-black text-[var(--color-texto)] text-lg mb-1 leading-tight">{prod.nombre_producto}</h3>
                  <p className="text-xs text-[var(--color-texto-suave)] mb-4 line-clamp-2 min-h-[2rem]">{prod.descripcion_detallada || "Sin descripción"}</p>
                  
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-lg font-black text-[var(--color-acento)]">
                      ${Number(prod.precio_unitario).toLocaleString()}
                    </span>
                    <button 
                      disabled={agotado}
                      onClick={() => agregarAlCarrito(prod)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform active:scale-90 ${agotado ? 'bg-gray-300 cursor-not-allowed' : 'bg-[var(--color-primario)] hover:bg-[var(--color-primario-dark)] text-white shadow-md'}`}
                      aria-label="Agregar al carrito"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}