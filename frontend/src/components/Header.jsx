import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx"; 
import { useCart } from "../context/CartContext.jsx";

export default function Header() {
  const navigate = useNavigate();
  const { usuario, cerrarSesion } = useAuth();
  const { cantidadTotal } = useCart();

  const handleLogout = () => {
    cerrarSesion();
    navigate("/login");
  };

  return (
    <header className="w-full font-inherit select-none z-50 shadow-sm bg-[var(--color-superficie)]">
      
      {/* ── BARRA SUPERIOR (Solo Redes y Mensaje Corporativo) ── */}
      <div className="bg-[var(--color-primario)] text-white text-xs px-6 py-2 flex justify-between items-center min-h-[36px]">
        <div className="text-white/80 tracking-wide font-medium">
          {usuario ? `Bienvenido de nuevo, ${usuario.nombre}` : "La mejor calidad en cada producto"}
        </div>
        
        {/* Redes Sociales */}
        <div className="flex gap-3 text-white/80">
          <a href="#" className="w-5 h-5 border border-white/20 rounded-full flex items-center justify-center text-[10px] hover:bg-white/10 hover:text-white transition-all">f</a>
          <a href="#" className="w-5 h-5 border border-white/20 rounded-full flex items-center justify-center text-[10px] hover:bg-white/10 hover:text-white transition-all">x</a>
          <a href="#" className="w-5 h-5 border border-white/20 rounded-full flex items-center justify-center text-[10px] hover:bg-white/10 hover:text-white transition-all">ig</a>
        </div>
      </div>

      {/* ── BARRA PRINCIPAL ── */}
      <div className="bg-[var(--color-superficie)] px-6 py-4 flex items-center justify-between border-b border-[var(--color-borde)]">
        
        {/* Logo */}
        <Link to="/" className="flex items-center group">
          <img src="/img/logo.png" alt="Mimos" className="h-10 w-auto object-contain group-hover:scale-105 transition-transform" />
        </Link>

        {/* Menú de Navegación Central */}
        <nav className="hidden md:flex gap-8 text-sm font-medium">
          <Link to="/" className="text-[var(--color-texto)] hover:text-[var(--color-acento)] transition-colors">Inicio</Link>
          <Link to="/catalogo" className="text-[var(--color-texto-suave)] hover:text-[var(--color-acento)] transition-colors">Menú</Link>
          <span className="text-[var(--color-texto-suave)] hover:text-[var(--color-acento)] transition-colors cursor-pointer">Convenios</span>
          <span className="text-[var(--color-texto-suave)] hover:text-[var(--color-acento)] transition-colors cursor-pointer">Contacto</span>
        </nav>

        {/* ── BOTONERA DE ACCIONES (UX Mejorada) ── */}
        <div className="flex items-center gap-5">
          
          {usuario ? (
            <>
              {/* Botón: Mi Cuenta */}
              <Link to="/cuenta" className="flex flex-col items-center gap-1 group">
                <img src="/img/iconos/login.svg" className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" alt="Cuenta" />
                <span className="text-[9px] font-bold uppercase text-[var(--color-texto-suave)] group-hover:text-[var(--color-acento)]">Mi Cuenta</span>
              </Link>

              {/* Botón: Panel (Solo Admin/Dev/Gestor) */}
              {[0, 1, 2].includes(Number(usuario.rol)) && (
                <Link to="/admin/panel" className="flex flex-col items-center gap-1 group">
                  <img src="/img/iconos/info.svg" className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" alt="Panel" />
                  <span className="text-[9px] font-bold uppercase text-[var(--color-texto-suave)] group-hover:text-[var(--color-acento)]">Panel</span>
                </Link>
              )}

              {/* Botón: Mis Pedidos */}
              <Link to="/pedidos" className="flex flex-col items-center gap-1 group">
                <img src="/img/iconos/pedidos.svg" className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" alt="Pedidos" />
                <span className="text-[9px] font-bold uppercase text-[var(--color-texto-suave)] group-hover:text-[var(--color-acento)]">Pedidos</span>
              </Link>

              {/* Botón: Cerrar Sesión ('X') */}
              <button onClick={handleLogout} className="flex flex-col items-center gap-1 group ml-1">
				<img src="/img/iconos/x-icon.svg" className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" alt="Ingresar" />
                <span className="text-[9px] font-bold uppercase text-red-400 group-hover:text-red-600">Salir</span>
              </button>
            </>
          ) : (
            /* Botón: Ingresar (Si no hay sesión) */
            <Link to="/login" className="flex flex-col items-center gap-1 group">
              <img src="/img/iconos/login.svg" className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" alt="Ingresar" />
              <span className="text-[9px] font-bold uppercase text-[var(--color-texto-suave)] group-hover:text-[var(--color-acento)]">Ingresar</span>
            </Link>
          )}

          {/* Separador Visual */}
          <div className="w-px h-8 bg-[var(--color-borde)] mx-1"></div>

          {/* Botón: Carrito */}
          <Link to="/carrito" className="flex flex-col items-center gap-1 group relative">
            <div className="relative">
              <img src="/img/iconos/carrito.svg" className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" alt="Carrito" />
              {cantidadTotal > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {cantidadTotal}
                </span>
              )}
            </div>
            <span className="text-[9px] font-bold uppercase text-[var(--color-texto-suave)] group-hover:text-[var(--color-acento)]">Carrito</span>
          </Link>

        </div>
      </div>
    </header>
  );
}