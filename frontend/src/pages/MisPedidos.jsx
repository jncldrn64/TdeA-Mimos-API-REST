import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function MisPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const { usuario } = useAuth();
  
  // Estados para el Modal de Detalles
  const [pedidoActivo, setPedidoActivo] = useState(null);
  const [detalles, setDetalles] = useState([]);
  const [cargandoDetalles, setCargandoDetalles] = useState(false);
  const [reportando, setReportando] = useState(false);
  const [formReporte, setFormReporte] = useState({ asunto: "", mensaje: "" });
  const [cargandoReporte, setCargandoReporte] = useState(false);
  
  const API = import.meta.env.VITE_API_URL || "http://localhost:3500";
  const token = localStorage.getItem("token");

  useEffect(() => {
    const cargarMisPedidos = async () => {
      try {
        const res = await fetch(`${API}/api/ventas/mis-pedidos`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setPedidos(data.data);
      } catch (error) {
        console.error("Error al cargar pedidos", error);
      } finally {
        setCargando(false);
      }
    };
    cargarMisPedidos();
  }, [API, token]);

  const abrirDetalle = async (pedido) => {
    setPedidoActivo(pedido);
    setCargandoDetalles(true);
    try {
      const res = await fetch(`${API}/api/ventas/mis-pedidos/${pedido.id}/detalle`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setDetalles(data.data);
    } catch (error) {
      alert("Error al cargar los detalles del pedido.");
    } finally {
      setCargandoDetalles(false);
    }
  };

  const cerrarDetalle = () => {
    setPedidoActivo(null);
    setDetalles([]);
  };
  
  const enviarReportePedido = async (e) => {
    e.preventDefault();
    setCargandoReporte(true);
    try {
      const res = await fetch(`${API}/api/incidentes`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          venta_id: pedidoActivo.id, // Vínculo duro a la Base de Datos
          asunto: `Problema con Pedido #${pedidoActivo.id} - ${formReporte.asunto}`,
          mensaje: formReporte.mensaje
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("Incidente reportado exitosamente. Nuestro equipo lo revisará.");
        setReportando(false);
        setFormReporte({ asunto: "", mensaje: "" });
      } else {
        alert("Error: " + data.message);
      }
    } catch(e) {
      alert("Falla de red al enviar reporte.");
    } finally {
      setCargandoReporte(false);
    }
  };

  if (cargando) return <div className="min-h-[60vh] flex items-center justify-center animate-pulse text-[var(--color-texto-suave)]">Sincronizando historial...</div>;

  if (pedidos.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center font-inherit">
        <div className="bg-[var(--color-fondo)] p-6 rounded-full mb-6 border border-[var(--color-borde)]">
          <img src="/img/iconos/empty-box.svg" alt="Sin pedidos" className="w-16 h-16 opacity-40" onError={(e) => e.target.style.display='none'} />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-[var(--color-texto)]">Aún no tienes pedidos</h2>
        <p className="text-[var(--color-texto-suave)] mb-6 max-w-md">Parece que todavía no has realizado ninguna compra. Explora nuestro catálogo y descubre tus productos favoritos.</p>
        <Link to="/catalogo" className="bg-[var(--color-primario)] hover:bg-[var(--color-primario-dark)] text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-sm uppercase tracking-wide text-sm">
          Ir al Catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen font-inherit">
      <h1 className="text-2xl font-black mb-8 text-[var(--color-texto)] border-b border-[var(--color-borde)] pb-4">
        Historial de Pedidos
      </h1>
      
      <div className="space-y-4">
        {pedidos.map(pedido => (
          <div key={pedido.id} className="bg-[var(--color-superficie)] p-5 rounded-xl border border-[var(--color-borde)] shadow-sm flex flex-col sm:flex-row sm:justify-between sm:items-center hover:shadow-md transition-shadow gap-4">
            <div>
              <p className="text-sm text-[var(--color-texto-suave)] font-bold mb-1">Pedido #{pedido.id}</p>
              <p className="font-black text-lg text-[var(--color-texto)]">${Number(pedido.total).toLocaleString()} COP</p>
              <p className="text-xs text-[var(--color-texto-suave)] mt-1">{new Date(pedido.fecha).toLocaleDateString()}</p>
            </div>
            <div className="text-left sm:text-right flex flex-col sm:items-end">
              <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full uppercase tracking-wide w-fit">
                {pedido.estado}
              </span>
              <button 
                onClick={() => abrirDetalle(pedido)}
                className="block mt-3 text-xs text-[var(--color-acento)] font-bold hover:underline transition-all"
              >
                Ver detalle
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── MODAL DE DETALLE DE PEDIDO ── */}
      {pedidoActivo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-superficie)] w-full max-w-2xl rounded-2xl shadow-2xl border border-[var(--color-borde)] overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Cabecera del Modal */}
            <div className="p-6 border-b border-[var(--color-borde)] flex justify-between items-start bg-[var(--color-fondo)]">
              <div>
                <h2 className="text-xl font-black text-[var(--color-texto)]">Recibo de Compra</h2>
                <p className="text-sm text-[var(--color-texto-suave)]">Pedido #{pedidoActivo.id} • {new Date(pedidoActivo.fecha).toLocaleDateString()}</p>
              </div>
              <button onClick={cerrarDetalle} className="text-[var(--color-texto-suave)] hover:text-red-500 font-bold text-lg px-2">✕</button>
            </div>

            {/* Cuerpo Escroleable */}
            <div className="p-6 overflow-y-auto flex-1">
              
              {/* Línea de tiempo de envío (Placeholder visual) */}
              <div className="mb-8 p-4 bg-[var(--color-secundario-soft)] rounded-lg border border-[var(--color-borde)]">
                <h3 className="text-xs font-bold text-[var(--color-texto-suave)] uppercase mb-4 tracking-wider">Estado del Envío</h3>
                <div className="flex items-center justify-between relative">
                  <div className="absolute left-0 top-1/2 w-full h-1 bg-[var(--color-borde)] -z-10 -translate-y-1/2"></div>
                  <div className="absolute left-0 top-1/2 w-full h-1 bg-green-500 -z-10 -translate-y-1/2"></div> {/* Cambiar w-full dinámicamente según el estado */}
                  
                  <div className="flex flex-col items-center gap-1 bg-[var(--color-secundario-soft)] px-2">
                    <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">✓</div>
                    <span className="text-[10px] font-bold text-[var(--color-texto)] uppercase">Procesado</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 bg-[var(--color-secundario-soft)] px-2">
                    <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">✓</div>
                    <span className="text-[10px] font-bold text-[var(--color-texto)] uppercase">Enviado</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 bg-[var(--color-secundario-soft)] px-2">
                    <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">✓</div>
                    <span className="text-[10px] font-bold text-[var(--color-texto)] uppercase">Entregado</span>
                  </div>
                </div>
              </div>

              <h3 className="text-xs font-bold text-[var(--color-texto-suave)] uppercase mb-3 tracking-wider">Artículos</h3>
              
              {cargandoDetalles ? (
                <div className="text-sm text-center py-8 animate-pulse text-[var(--color-texto-suave)]">Recuperando desglose...</div>
              ) : (
                <div className="space-y-3">
                  {detalles.map(item => (
                    <div key={item.detalle_id} className="flex items-center gap-4 p-3 border border-[var(--color-borde)] rounded-lg bg-[var(--color-fondo)]">
                      <img src={item.url_imagen || "/img/productos/default.png"} className="w-12 h-12 object-contain bg-white rounded border border-[var(--color-borde)]" onError={(e) => e.target.style.display='none'}/>
                      <div className="flex-1">
                        <p className="font-bold text-sm text-[var(--color-texto)]">{item.nombre_producto}</p>
                        <p className="text-xs text-[var(--color-texto-suave)]">Cant: {item.cantidad} x ${Number(item.precio_unitario).toLocaleString()}</p>
                      </div>
                      <div className="font-black text-sm text-[var(--color-texto)]">
                        ${Number(item.subtotal).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pie del Modal con Totales */}
			<div className="p-6 bg-[var(--color-fondo)] border-t border-[var(--color-borde)]">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-bold text-[var(--color-texto-suave)]">Total Pagado</span>
                <span className="text-2xl font-black text-[var(--color-texto)]">${Number(pedidoActivo.total).toLocaleString()} COP</span>
              </div>
              
              {!reportando ? (
                <div className="flex justify-between items-center mt-2 pt-4 border-t border-[var(--color-borde)]">
                   <p className="text-[10px] text-[var(--color-texto-suave)]">IVA y envío incluidos</p>
                   <button onClick={() => setReportando(true)} className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors uppercase tracking-wide flex items-center gap-1">
                     ¿Problemas con este pedido?
                   </button>
                </div>
              ) : (
                <form onSubmit={enviarReportePedido} className="mt-4 pt-4 border-t border-[var(--color-borde)] animate-in fade-in slide-in-from-top-2 duration-200">
                  <h4 className="text-xs font-bold text-red-600 uppercase mb-3">Reportar Inconveniente</h4>
                  <select required value={formReporte.asunto} onChange={e => setFormReporte({...formReporte, asunto: e.target.value})} className="w-full p-2.5 mb-2 bg-[var(--color-superficie)] border border-[var(--color-borde)] rounded-lg text-sm outline-none focus:border-red-400 transition-colors">
                    <option value="">Selecciona un motivo...</option>
                    <option value="Helado derretido o en mal estado">Helado derretido o en mal estado</option>
                    <option value="Faltan artículos en la entrega">Faltan artículos en la entrega</option>
                    <option value="El pedido nunca llegó">El pedido nunca llegó</option>
                    <option value="Facturación incorrecta">Facturación incorrecta</option>
                  </select>
                  <textarea required rows="2" placeholder="Detalla el problema..." value={formReporte.mensaje} onChange={e => setFormReporte({...formReporte, mensaje: e.target.value})} className="w-full p-2.5 mb-3 bg-[var(--color-superficie)] border border-[var(--color-borde)] rounded-lg text-sm outline-none focus:border-red-400 transition-colors resize-none"></textarea>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setReportando(false)} className="flex-1 text-xs font-bold text-[var(--color-texto-suave)] border border-[var(--color-borde)] rounded-lg py-2 hover:bg-[var(--color-secundario)] transition-colors">Cancelar</button>
                    <button type="submit" disabled={cargandoReporte} className="flex-1 text-xs font-bold text-white bg-red-500 rounded-lg py-2 hover:bg-red-600 transition-colors disabled:opacity-50">{cargandoReporte ? 'Enviando...' : 'Abrir Ticket'}</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}