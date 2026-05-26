import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx"; 
import { useCart } from "../context/CartContext.jsx";

export default function Header() {
  const navigate = useNavigate();
  const { usuario, cerrarSesion } = useAuth();
  const { cantidadTotal } = useCart();
  
  // Estado para el menú hamburguesa (móvil)
  const [menuAbierto, setMenuAbierto] = useState(false);

  const handleLogout = () => {
    cerrarSesion();
    setMenuAbierto(false);
    navigate("/login");
  };

  const cerrarMenu = () => setMenuAbierto(false);

  return (
    <header className="sticky top-0 w-full font-inherit select-none z-50 shadow-sm bg-[var(--color-superficie)]">
      
      {/* ── BARRA SUPERIOR (Redes y Bienvenida) ── */}
      <div className="bg-[var(--color-primario)] text-white text-xs px-6 py-2 flex justify-between items-center min-h-[36px]">
        <div className="text-white/80 tracking-wide font-medium truncate">
          {usuario ? `Bienvenido, ${usuario.nombre}` : "La mejor calidad en cada producto"}
        </div>
        <div className="flex gap-3 text-white/80 shrink-0">
          <a href="#" className="w-5 h-5 border border-white/20 rounded-full flex items-center justify-center text-[10px] hover:bg-white/10 hover:text-white transition-all">f</a>
          <a href="#" className="w-5 h-5 border border-white/20 rounded-full flex items-center justify-center text-[10px] hover:bg-white/10 hover:text-white transition-all">x</a>
          <a href="#" className="w-5 h-5 border border-white/20 rounded-full flex items-center justify-center text-[10px] hover:bg-white/10 hover:text-white transition-all">ig</a>
        </div>
      </div>

      {/* ── BARRA PRINCIPAL ── */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-[var(--color-borde)] relative">
        
        {/* 1. IZQUIERDA: Logo */}
        <Link to="/" onClick={cerrarMenu} className="flex-shrink-0 z-50">
          <img src="/img/logo.png" alt="Mimos" className="h-10 w-auto object-contain hover:scale-105 transition-transform" onError={(e) => e.target.style.display='none'}/>
        </Link>

        {/* 2. CENTRO EXACTO: Navegación de Texto (Solo Desktop) */}
        <nav className="hidden md:flex flex-1 justify-center gap-8 text-sm font-medium">
          <Link to="/" className="text-[var(--color-texto)] hover:text-[var(--color-acento)] transition-colors">Inicio</Link>
          <Link to="/catalogo" className="text-[var(--color-texto-suave)] hover:text-[var(--color-acento)] transition-colors">Menú</Link>
          <span className="text-[var(--color-texto-suave)] hover:text-[var(--color-acento)] transition-colors cursor-pointer">Convenios</span>
          <span className="text-[var(--color-texto-suave)] hover:text-[var(--color-acento)] transition-colors cursor-pointer">Contacto</span>
        </nav>

        {/* 3. DERECHA: Botonera de Iconos (Solo Desktop) */}
        <div className="hidden md:flex flex-shrink-0 items-center gap-5">
          {usuario ? (
            <>
              <Link to="/cuenta" className="flex flex-col items-center gap-1 group">
                <img src="/img/iconos/login.svg" className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" alt="Cuenta" onError={(e)=>e.target.style.display='none'} />
                <span className="text-[9px] font-bold uppercase text-[var(--color-texto-suave)] group-hover:text-[var(--color-acento)]">Mi Cuenta</span>
              </Link>

              {[0, 1, 2, 3].includes(Number(usuario.rol)) && (
                <Link to="/admin/panel" className="flex flex-col items-center gap-1 group">
                  <img src="/img/iconos/info.svg" className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" alt="Panel" onError={(e)=>e.target.style.display='none'} />
                  <span className="text-[9px] font-bold uppercase text-[var(--color-texto-suave)] group-hover:text-[var(--color-acento)]">Panel</span>
                </Link>
              )}

              <Link to="/pedidos" className="flex flex-col items-center gap-1 group">
                <img src="/img/iconos/pedidos.svg" className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" alt="Pedidos" onError={(e)=>e.target.style.display='none'} />
                <span className="text-[9px] font-bold uppercase text-[var(--color-texto-suave)] group-hover:text-[var(--color-acento)]">Pedidos</span>
              </Link>

              <button onClick={handleLogout} className="flex flex-col items-center gap-1 group ml-1">
                <img src="/img/iconos/x-icon.svg" className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" alt="Salir" onError={(e)=>e.target.style.display='none'} />
                <span className="text-[9px] font-bold uppercase text-red-400 group-hover:text-red-600">Salir</span>
              </button>
            </>
          ) : (
            <Link to="/login" className="flex flex-col items-center gap-1 group">
              <img src="/img/iconos/login.svg" className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" alt="Ingresar" onError={(e)=>e.target.style.display='none'} />
              <span className="text-[9px] font-bold uppercase text-[var(--color-texto-suave)] group-hover:text-[var(--color-acento)]">Ingresar</span>
            </Link>
          )}

          <div className="w-px h-8 bg-[var(--color-borde)] mx-1"></div>

          <Link to="/carrito" className="flex flex-col items-center gap-1 group relative">
            <div className="relative">
              <img src="/img/iconos/carrito.svg" className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" alt="Carrito" onError={(e)=>e.target.style.display='none'} />
              {cantidadTotal > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {cantidadTotal}
                </span>
              )}
            </div>
            <span className="text-[9px] font-bold uppercase text-[var(--color-texto-suave)] group-hover:text-[var(--color-acento)]">Carrito</span>
          </Link>
        </div>

        {/* ── BOTÓN HAMBURGUESA (Solo Móvil) ── */}
        <div className="flex md:hidden items-center gap-4 z-50">
          {/* Dejamos el carrito visible afuera del menú en móviles para acceso rápido */}
          <Link to="/carrito" onClick={cerrarMenu} className="relative">
            <img src="/img/iconos/carrito.svg" className="w-6 h-6 opacity-70" alt="Carrito" />
            {cantidadTotal > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                {cantidadTotal}
              </span>
            )}
          </Link>
          
          <button className="p-1 text-[var(--color-texto)]" onClick={() => setMenuAbierto(!menuAbierto)}>
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuAbierto ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>
		{/* ======================================================== */}
		{/* ── MENÚ LATERAL DESPLEGABLE (DRAWER) PARA MÓVILES ── */}
		{/* ======================================================== */}
      
      {/* Overlay oscuro para tapar el fondo (Elevado a z-60) */}
      <div 
        className={`fixed inset-0 bg-black/60 z-[60] transition-opacity duration-300 md:hidden ${menuAbierto ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={cerrarMenu}
      ></div>

      {/* Cajón lateral (Elevado a z-70 para tapar el botón de PQRS) */}
      <div className={`fixed top-0 right-0 h-full w-4/5 max-w-sm bg-[var(--color-superficie)] z-[70] shadow-2xl flex flex-col transform transition-transform duration-300 md:hidden ${menuAbierto ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Cabecera del Cajón */}
        <div className="p-5 border-b border-[var(--color-borde)] flex justify-between items-center bg-[var(--color-fondo)]">
          <span className="font-black text-lg text-[var(--color-texto)] tracking-tight">Menú</span>
          <button onClick={cerrarMenu} className="p-2 rounded-full hover:bg-[var(--color-borde)] transition-colors">
            <img src="/img/iconos/x-icon.svg" className="w-4 h-4 opacity-70" alt="Cerrar" onError={(e)=>e.target.style.display='none'}/>
          </button>
        </div>

        {/* Links de Navegación (Verticales) */}
        <nav className="flex flex-col p-6 gap-6 text-lg font-bold text-[var(--color-texto)] flex-1 overflow-y-auto">
          <Link to="/" onClick={cerrarMenu} className="hover:text-[var(--color-acento)] transition-colors">Inicio</Link>
          <Link to="/catalogo" onClick={cerrarMenu} className="hover:text-[var(--color-acento)] transition-colors">Menú de Helados</Link>
          <span className="text-[var(--color-texto-suave)] hover:text-[var(--color-acento)] transition-colors cursor-pointer">Convenios</span>
          <span className="text-[var(--color-texto-suave)] hover:text-[var(--color-acento)] transition-colors cursor-pointer">Contacto Corporativo</span>
        </nav>

        {/* Barra de Acciones (Horizontal tipo App Nativa) */}
        <div className="mt-auto bg-[var(--color-fondo)] border-t border-[var(--color-borde)] p-4 pb-8">
          <div className="flex flex-row justify-around items-center">
            {usuario ? (
              <>
                <Link to="/cuenta" onClick={cerrarMenu} className="flex flex-col items-center gap-1.5">
                  <img src="/img/iconos/login.svg" className="w-6 h-6 opacity-70" alt="Cuenta" />
                  <span className="text-[10px] font-bold uppercase text-[var(--color-texto-suave)]">Perfil</span>
                </Link>

                {[0, 1, 2, 3].includes(Number(usuario.rol)) && (
                  <Link to="/admin/panel" onClick={cerrarMenu} className="flex flex-col items-center gap-1.5">
                    <img src="/img/iconos/info.svg" className="w-6 h-6 opacity-70" alt="Panel" />
                    <span className="text-[10px] font-bold uppercase text-[var(--color-texto-suave)]">Panel</span>
                  </Link>
                )}

                <Link to="/pedidos" onClick={cerrarMenu} className="flex flex-col items-center gap-1.5">
                  <img src="/img/iconos/pedidos.svg" className="w-6 h-6 opacity-70" alt="Pedidos" />
                  <span className="text-[10px] font-bold uppercase text-[var(--color-texto-suave)]">Pedidos</span>
                </Link>

                <button onClick={handleLogout} className="flex flex-col items-center gap-1.5">
                  <img src="/img/iconos/x-icon.svg" className="w-6 h-6 opacity-70" alt="Salir" />
                  <span className="text-[10px] font-bold uppercase text-red-500">Salir</span>
                </button>
              </>
            ) : (
              <Link to="/login" onClick={cerrarMenu} className="flex flex-col items-center gap-1.5 w-full">
                <img src="/img/iconos/login.svg" className="w-6 h-6 opacity-70" alt="Ingresar" />
                <span className="text-[10px] font-bold uppercase text-[var(--color-texto-suave)]">Ingresar a mi cuenta</span>
              </Link>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}