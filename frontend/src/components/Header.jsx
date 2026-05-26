import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx"; 
import { useCart } from "../context/CartContext.jsx";

export default function Header() {
  const navigate = useNavigate();
  const { usuario, cerrarSesion } = useAuth();
  const { cantidadTotal } = useCart();
  
  const [menuAbierto, setMenuAbierto] = useState(false);
  
  // ── ESTADOS DEL SISTEMA DE NOTIFICACIONES ──
  const [notificaciones, setNotificaciones] = useState([]);
  const [mostrarNotifs, setMostrarNotifs] = useState(false);
  const API = import.meta.env.VITE_API_URL || "http://localhost:3500";

  // Estado persistente para guardar los IDs de notificaciones leídas
  const [leidas, setLeidas] = useState(() => {
    const guardadas = localStorage.getItem("notifsLeidas");
    return guardadas ? JSON.parse(guardadas) : [];
  });

  useEffect(() => {
    if (usuario) {
      const cargarNotificaciones = async () => {
        const token = localStorage.getItem("token");
        try {
          const rol = Number(usuario.rol);
          let notifs = [];

          const [resPedidos, resTickets] = await Promise.all([
            fetch(`${API}/api/ventas/mis-pedidos`, { headers: { "Authorization": `Bearer ${token}` } }).catch(() => ({ ok: false })),
            fetch(`${API}/api/incidentes/mis-tickets`, { headers: { "Authorization": `Bearer ${token}` } }).catch(() => ({ ok: false }))
          ]);

          if (resPedidos.ok) {
            const dataPedidos = await resPedidos.json();
            if (dataPedidos.success) {
              dataPedidos.data.forEach(p => {
                notifs.push({
                  id: `ped-${p.id}-${p.estado}`, // El ID cambia si el estado cambia
                  tipo: 'pedido',
                  titulo: `Pedido #${p.id}`,
                  mensaje: `Estado actualizado a: ${p.estado}`,
                  fecha: p.fecha,
                  url: '/pedidos'
                });
              });
            }
          }

          if (resTickets.ok) {
            const dataTickets = await resTickets.json();
            if (dataTickets.success) {
              dataTickets.data.forEach(t => {
                if (t.estado !== 'Abierto' || (t.respuesta && t.respuesta.trim() !== '')) {
                  notifs.push({
                    id: `tic-${t.id_incidente}-${t.estado}`, 
                    tipo: 'ticket',
                    titulo: `Ticket #${t.id_incidente}`,
                    mensaje: `Soporte: ${t.estado} ${t.respuesta ? '(Respondido)' : ''}`,
                    fecha: t.fecha_respuesta || t.fecha_creacion,
                    url: '/cuenta'
                  });
                }
              });
            }
          }

          if ([0, 1, 3].includes(rol)) {
            const resAdminPQRS = await fetch(`${API}/api/incidentes/admin`, { headers: { "Authorization": `Bearer ${token}` } }).catch(() => ({ ok: false }));
            if (resAdminPQRS.ok) {
              const dataAdmin = await resAdminPQRS.json();
              if (dataAdmin.success) {
                const ticketsAbiertos = dataAdmin.data.filter(t => t.estado === 'Abierto');
                if (ticketsAbiertos.length > 0) {
                  notifs.push({
                    id: `admin-pqrs-${ticketsAbiertos.length}`, // El ID cambia si sube o baja la cantidad
                    tipo: 'alerta-admin',
                    titulo: `🔔 Acción Requerida`,
                    mensaje: `Tienes ${ticketsAbiertos.length} tickets de clientes en estado "Abierto".`,
                    fecha: new Date().toISOString(), 
                    url: '/admin/panel'
                  });
                }
              }
            }
          }

          notifs.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
          setNotificaciones(notifs.slice(0, 8));

        } catch (error) {
          console.error("Error sincronizando notificaciones", error);
        }
      };
      cargarNotificaciones();
    }
  }, [usuario, API]);

  // ── LÓGICA DE INTERACCIÓN DE NOTIFICACIONES ──
  
  // Calcular cuántas no se han leído
  const noLeidas = notificaciones.filter(n => !leidas.includes(n.id)).length;

  const marcarLeida = (notif) => {
    if (!leidas.includes(notif.id)) {
      const nuevasLeidas = [...leidas, notif.id];
      setLeidas(nuevasLeidas);
      localStorage.setItem("notifsLeidas", JSON.stringify(nuevasLeidas));
    }
    setMostrarNotifs(false);
    navigate(notif.url);
  };

  const marcarTodasLeidas = () => {
    const todasNuevas = notificaciones.map(n => n.id);
    const combinadas = Array.from(new Set([...leidas, ...todasNuevas]));
    setLeidas(combinadas);
    localStorage.setItem("notifsLeidas", JSON.stringify(combinadas));
  };

  const handleLogout = () => {
    cerrarSesion();
    setMenuAbierto(false);
    navigate("/login");
  };

  const cerrarMenu = () => setMenuAbierto(false);

  const CampanaNotificaciones = ({ isMobile }) => (
    <div className="relative">
      <button 
        onClick={() => setMostrarNotifs(!mostrarNotifs)}
        className={`flex flex-col items-center justify-center gap-1 group relative cursor-pointer ${isMobile ? 'p-1' : ''}`}
      >
        <svg className={`opacity-70 group-hover:opacity-100 transition-opacity text-[var(--color-texto)] ${isMobile ? 'w-6 h-6' : 'w-5 h-5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
        </svg>
        {!isMobile && <span className="text-[9px] font-bold uppercase text-[var(--color-texto-suave)] group-hover:text-[var(--color-acento)]">Avisos</span>}
        
        {/* Solo muestra el contador si hay alertas no leídas */}
        {noLeidas > 0 && (
          <span className={`absolute bg-red-500 text-white font-bold rounded-full flex items-center justify-center shadow-sm ${isMobile ? '-top-1 -right-1 w-4 h-4 text-[9px]' : '-top-2 -right-2 w-4 h-4 text-[9px]'}`}>
            {noLeidas}
          </span>
        )}
      </button>
    </div>
  );

  return (
    <header className="sticky top-0 w-full font-inherit select-none z-50 shadow-sm bg-[var(--color-superficie)]">
      
      {/* ── BARRA SUPERIOR ── */}
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
        <Link to="/" onClick={cerrarMenu} className="flex-shrink-0 z-50">
          <img src="/img/logo.png" alt="Mimos" className="h-10 w-auto object-contain hover:scale-105 transition-transform" onError={(e) => e.target.style.display='none'}/>
        </Link>

        <nav className="hidden md:flex flex-1 justify-center gap-8 text-sm font-medium">
          <Link to="/" className="text-[var(--color-texto)] hover:text-[var(--color-acento)] transition-colors">Inicio</Link>
          <Link to="/catalogo" className="text-[var(--color-texto-suave)] hover:text-[var(--color-acento)] transition-colors">Menú</Link>
          <span className="text-[var(--color-texto-suave)] hover:text-[var(--color-acento)] transition-colors cursor-pointer">Convenios</span>
          <span className="text-[var(--color-texto-suave)] hover:text-[var(--color-acento)] transition-colors cursor-pointer">Contacto</span>
        </nav>

        <div className="hidden md:flex flex-shrink-0 items-center gap-5">
          {usuario ? (
            <>
              <CampanaNotificaciones isMobile={false} />

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

              <button onClick={handleLogout} className="flex flex-col items-center gap-1 group ml-1 cursor-pointer">
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

        <div className="flex md:hidden items-center gap-4 z-50">
          {usuario && <CampanaNotificaciones isMobile={true} />}

          <Link to="/carrito" onClick={cerrarMenu} className="relative">
            <img src="/img/iconos/carrito.svg" className="w-6 h-6 opacity-70" alt="Carrito" />
            {cantidadTotal > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                {cantidadTotal}
              </span>
            )}
          </Link>
          
          <button className="p-1 text-[var(--color-texto)] cursor-pointer" onClick={() => setMenuAbierto(!menuAbierto)}>
            <img src={menuAbierto ? "/img/iconos/x-icon.svg" : "/img/temp/menu-icon.svg"} alt="Menu" className="w-7 h-7 opacity-80" onError={(e) => e.target.style.display='none'} />
          </button>
        </div>
      </div>

      {/* ── PANEL DESPLEGABLE DE NOTIFICACIONES (Universal) ── */}
      {mostrarNotifs && (
        <>
          <div className="fixed inset-0 z-[80]" onClick={() => setMostrarNotifs(false)}></div>
          
          <div className="absolute right-4 md:right-32 top-[75px] w-80 bg-[var(--color-superficie)] border border-[var(--color-borde)] shadow-2xl rounded-xl overflow-hidden z-[90] animate-in slide-in-from-top-2">
            <div className="bg-[var(--color-fondo)] p-3 border-b border-[var(--color-borde)] flex justify-between items-center">
              <h3 className="font-bold text-[var(--color-texto)] text-sm">Notificaciones {noLeidas > 0 && <span className="text-red-500 ml-1">({noLeidas})</span>}</h3>
              <div className="flex items-center gap-3">
                {noLeidas > 0 && (
                  <button onClick={marcarTodasLeidas} className="text-[10px] font-bold text-[var(--color-acento)] hover:underline">Marcar leídas</button>
                )}
                <button onClick={() => setMostrarNotifs(false)} className="text-[var(--color-texto-suave)] hover:text-red-500 font-bold px-2">✕</button>
              </div>
            </div>
            
            <div className="max-h-80 overflow-y-auto">
              {notificaciones.length === 0 ? (
                <div className="p-8 text-center text-sm text-[var(--color-texto-suave)]">No hay novedades por el momento.</div>
              ) : (
                notificaciones.map(n => {
                  const esLeida = leidas.includes(n.id);
                  return (
                    <div 
                      key={n.id} 
                      onClick={() => marcarLeida(n)} 
                      className={`p-4 border-b border-[var(--color-borde)] cursor-pointer transition-colors flex gap-3 items-start ${esLeida ? 'opacity-50 bg-[var(--color-fondo)]' : 'bg-[var(--color-superficie)] hover:bg-[var(--color-fondo)]'}`}
                    >
                      <div className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${!esLeida && n.tipo === 'alerta-admin' ? 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]' : n.tipo === 'pedido' ? 'bg-green-500' : n.tipo === 'alerta-admin' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                      <div>
                        <p className={`text-xs text-[var(--color-texto)] leading-tight ${esLeida ? 'font-medium' : 'font-black'}`}>{n.titulo}</p>
                        <p className={`text-[11px] text-[var(--color-texto-suave)] leading-tight mt-1 ${esLeida ? 'font-normal' : 'font-medium text-[var(--color-texto)]'}`}>{n.mensaje}</p>
                        <p className="text-[9px] text-gray-400 mt-1.5 font-medium">{new Date(n.fecha).toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}

      {/* ── MENÚ LATERAL DESPLEGABLE (MÓVILES) ── */}
      <div className={`fixed inset-0 bg-black/60 z-[60] transition-opacity duration-300 md:hidden ${menuAbierto ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={cerrarMenu}></div>
      <div className={`fixed top-0 right-0 h-full w-4/5 max-w-sm bg-[var(--color-superficie)] z-[70] shadow-2xl flex flex-col transform transition-transform duration-300 md:hidden ${menuAbierto ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-5 border-b border-[var(--color-borde)] flex justify-between items-center bg-[var(--color-fondo)]">
          <span className="font-black text-lg text-[var(--color-texto)] tracking-tight">Menú</span>
          <button onClick={cerrarMenu} className="p-2 rounded-full hover:bg-[var(--color-borde)] transition-colors cursor-pointer">
            <img src="/img/iconos/x-icon.svg" className="w-4 h-4 opacity-70" alt="Cerrar" onError={(e)=>e.target.style.display='none'}/>
          </button>
        </div>
        <nav className="flex flex-col p-6 gap-6 text-lg font-bold text-[var(--color-texto)] flex-1 overflow-y-auto">
          <Link to="/" onClick={cerrarMenu} className="hover:text-[var(--color-acento)] transition-colors">Inicio</Link>
          <Link to="/catalogo" onClick={cerrarMenu} className="hover:text-[var(--color-acento)] transition-colors">Menú de Helados</Link>
          <span className="text-[var(--color-texto-suave)] hover:text-[var(--color-acento)] transition-colors cursor-pointer">Convenios</span>
          <span className="text-[var(--color-texto-suave)] hover:text-[var(--color-acento)] transition-colors cursor-pointer">Contacto Corporativo</span>
        </nav>
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
                <button onClick={handleLogout} className="flex flex-col items-center gap-1.5 cursor-pointer">
                  <img src="/img/iconos/x-icon.svg" className="w-6 h-6 opacity-70" alt="Salir" />
                  <span className="text-[10px] font-bold uppercase text-red-500">Salir</span>
                </button>
              </>
            ) : (
              <Link to="/login" onClick={cerrarMenu} className="flex flex-col items-center gap-1.5 w-full">
                <img src="/img/iconos/login.svg" className="w-6 h-6 opacity-70" alt="Ingresar" />
                <span className="text-[10px] font-bold uppercase text-[var(--color-texto-suave)] text-center">Ingresar a mi cuenta</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}