import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';

// 1. Importamos todas las vistas
import GestionRoles from './pages/GestionRoles';
import GestionUsuarios from './pages/GestionUsuarios';
import GestionCategorias from './pages/GestionCategorias';
import GestionProductos from './pages/GestionProductos';
import GestionCarritos from './pages/GestionCarritos';
import GestionCarritoItems from './pages/GestionCarritoItems';
import GestionVentas from './pages/GestionVentas';
import GestionDetalleVentas from './pages/GestionDetalleVentas';
import GestionEnvios from './pages/GestionEnvios';
import GestionPQRS from './pages/GestionPQRS';

// Componente auxiliar para pintar los botones de la cabecera
function MenuLink({ to, label }) {
  const location = useLocation();
  const activo = location.pathname === to;
  return (
    <Link 
      to={to} 
      className={`whitespace-nowrap px-3 py-2 rounded-lg text-sm font-bold transition-all ${
        activo 
          ? 'bg-[var(--color-acento)] text-white shadow-sm' 
          : 'text-[var(--color-texto-suave)] hover:bg-[var(--color-fondo)] hover:text-[var(--color-texto)]'
      }`}
    >
      {label}
    </Link>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[var(--color-fondo)] flex flex-col font-inherit">
        
        {/* ── CABECERA SUPERIOR (HEADER) ── */}
        <header className="bg-[var(--color-superficie)] border-b border-[var(--color-borde)] shadow-sm sticky top-0 z-50">
          
          {/* Título de la app */}
          <div className="border-b border-[var(--color-borde)] px-6 py-4 flex items-center justify-between">
            <h1 className="text-xl font-black text-[var(--color-texto)] tracking-tight">
              Mimos <span className="text-[var(--color-acento)]">Admin</span>
            </h1>
            <div className="text-xs font-bold px-3 py-1 bg-[var(--color-secundario-soft)] text-[var(--color-texto-suave)] rounded-full border border-[var(--color-borde)]">
              Panel de Control API
            </div>
          </div>
          
          {/* Barra de navegación con scroll horizontal */}
          <div className="px-4 py-3 overflow-x-auto flex gap-2 items-center" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <MenuLink to="/roles" label="Roles" />
            <MenuLink to="/usuarios" label="Usuarios" />
            <div className="w-px h-6 bg-[var(--color-borde)] mx-1"></div>
            <MenuLink to="/categorias" label="Categorías" />
            <MenuLink to="/productos" label="Productos" />
            <div className="w-px h-6 bg-[var(--color-borde)] mx-1"></div>
            <MenuLink to="/carritos" label="Carritos" />
            <MenuLink to="/carrito-items" label="Ítems Carrito" />
            <MenuLink to="/ventas" label="Ventas" />
            <MenuLink to="/detalle-ventas" label="Detalle Ventas" />
            <MenuLink to="/envios" label="Envíos" />
            <div className="w-px h-6 bg-[var(--color-borde)] mx-1"></div>
            <MenuLink to="/pqrs" label="PQRS" />
          </div>
        </header>

        {/* ── ÁREA PRINCIPAL (RUTAS) ── */}
        <main className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-8">
          <Routes>
            <Route path="/" element={
              <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <div className="w-16 h-16 bg-[var(--color-secundario-soft)] rounded-full flex items-center justify-center mb-6 border border-[var(--color-borde)]">
                   <svg width="24" height="24" fill="none" stroke="var(--color-texto-suave)" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                </div>
                <h2 className="text-3xl font-black text-[var(--color-texto)] mb-2 tracking-tight">Bienvenido al Panel</h2>
                <p className="text-[var(--color-texto-suave)] max-w-md">Selecciona una pestaña en la parte superior para gestionar la base de datos de manera directa y segura.</p>
              </div>
            } />
            <Route path="/roles" element={<GestionRoles />} />
            <Route path="/usuarios" element={<GestionUsuarios />} />
            <Route path="/categorias" element={<GestionCategorias />} />
            <Route path="/productos" element={<GestionProductos />} />
            <Route path="/carritos" element={<GestionCarritos />} />
            <Route path="/carrito-items" element={<GestionCarritoItems />} />
            <Route path="/ventas" element={<GestionVentas />} />
            <Route path="/detalle-ventas" element={<GestionDetalleVentas />} />
            <Route path="/envios" element={<GestionEnvios />} />
            <Route path="/pqrs" element={<GestionPQRS />} />
          </Routes>
        </main>

      </div>
    </Router>
  );
}

export default App;