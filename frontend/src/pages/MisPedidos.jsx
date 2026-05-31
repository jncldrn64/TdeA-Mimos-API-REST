import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { jsPDF } from "jspdf";

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
  
  // Estado para el botón PDF
  const [generandoPDF, setGenerandoPDF] = useState(false);

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
    setReportando(false);
  };
  
  const enviarReportePedido = async (e) => {
    e.preventDefault();
    setCargandoReporte(true);
    try {
      const res = await fetch(`${API}/api/incidentes`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          venta_id: pedidoActivo.id,
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

  // ── GENERACIÓN NATIVA Y VECTORIAL DEL PDF (Cero Capturas) ──
  const descargarPDF = () => {
    if (!pedidoActivo) return;
    setGenerandoPDF(true);

    try {
      // Crear documento en tamaño carta (A4), medidas en milímetros
      const doc = new jsPDF("p", "mm", "a4");
      
    // ── EXTRACTOR DINÁMICO DE COLORES (White-Label) ──
      // Esta función lee el index.css en tiempo real y convierte el HEX a RGB para jsPDF
      const getCSSColor = (variable) => {
        const hex = getComputedStyle(document.documentElement).getPropertyValue(variable).trim().replace('#', '');
        return hex ? [parseInt(hex.substring(0, 2), 16), parseInt(hex.substring(2, 4), 16), parseInt(hex.substring(4, 6), 16)] : [0,0,0];
      };

      const colorPrimario = getCSSColor('--color-primario');   
      const colorAcento = getCSSColor('--color-acento');     
      const colorTexto = getCSSColor('--color-texto');       
      const colorGris = getCSSColor('--color-texto-suave');

      // ── CABECERA FISCAL ──
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(...colorPrimario);
      doc.text("MIMOS S.A.S.", 20, 25);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...colorGris);
      doc.text("NIT: 900.123.456-7", 20, 32);
      doc.text("Calle 78B N.° 72A - 220", 20, 37);
      doc.text("Medellín, Antioquia", 20, 42);

      // ── INFO DEL RECIBO (Derecha) ──
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(...colorAcento);
      doc.text("RECIBO", 190, 25, { align: "right" });

      doc.setFontSize(11);
      doc.setTextColor(...colorTexto);
      doc.text(`N° VENTA: #${pedidoActivo.id}`, 190, 34, { align: "right" });
      doc.setFont("helvetica", "normal");
      doc.text(`FECHA: ${new Date(pedidoActivo.fecha).toLocaleString()}`, 190, 40, { align: "right" });

      // Línea separadora
      doc.setDrawColor(229, 220, 216); // Gris claro
      doc.setLineWidth(0.5);
      doc.line(20, 48, 190, 48);

      // ── DATOS DEL CLIENTE Y PAGO ──
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...colorGris);
      doc.text("FACTURADO A:", 20, 58);
      doc.text("INFORMACIÓN DE PAGO:", 110, 58);

      doc.setFontSize(11);
      doc.setTextColor(...colorTexto);
      doc.text(`${usuario?.nombre || ""} ${usuario?.apellido || ""}`.trim() || "Consumidor Final", 20, 64);
      doc.text("Pasarela de Pagos (Wompi)", 110, 64);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      // Variables "en blanco" preparadas para la siguiente fase
      doc.text(`CC/NIT: ${pedidoActivo.cedula_comprador || "No registrado"}`, 20, 70);
      doc.text(`Método: ${pedidoActivo.metodo_pago || "Medio Digital"}`, 110, 70);
      doc.text(`Aprobación: AUTH-${pedidoActivo.id}X9`, 110, 75);

      // ── TABLA DE ARTÍCULOS ──
      // Fondo cabecera tabla
      doc.setFillColor(252, 250, 248);
      doc.rect(20, 85, 170, 10, "F");

      // Títulos tabla
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...colorGris);
      doc.text("DESCRIPCIÓN", 25, 91);
      doc.text("CANT.", 120, 91, { align: "center" });
      doc.text("V. UNIT.", 150, 91, { align: "right" });
      doc.text("SUBTOTAL", 185, 91, { align: "right" });

      // Filas de Detalles
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...colorTexto);
      let posicionY = 102;

      detalles.forEach((item) => {
        doc.text(item.nombre_producto, 25, posicionY);
        doc.text(`${item.cantidad}`, 120, posicionY, { align: "center" });
        doc.text(`$${Number(item.precio_unitario).toLocaleString()}`, 150, posicionY, { align: "right" });
        doc.text(`$${Number(item.subtotal).toLocaleString()}`, 185, posicionY, { align: "right" });
        posicionY += 8;

        // Salto de página automático si hay muchos productos
        if (posicionY > 270) {
          doc.addPage();
          posicionY = 20;
        }
      });

      // Línea final de tabla
      doc.line(20, posicionY + 2, 190, posicionY + 2);
      posicionY += 12;

      // ── DESGLOSE FINANCIERO (Totales) ──
      // Cálculos inversos (asumiendo que el total de la BD tiene IVA incluido del 19%)
      const subtotal = Number(pedidoActivo.total) / 1.19;
      const iva = Number(pedidoActivo.total) - subtotal;

      doc.setFontSize(10);
      doc.setTextColor(...colorGris);
      doc.text("Subtotal:", 150, posicionY, { align: "right" });
      doc.setTextColor(...colorTexto);
      doc.text(`$${Math.round(subtotal).toLocaleString()}`, 185, posicionY, { align: "right" });
      
      posicionY += 6;
      doc.setTextColor(...colorGris);
      doc.text("IVA (19%):", 150, posicionY, { align: "right" });
      doc.setTextColor(...colorTexto);
      doc.text(`$${Math.round(iva).toLocaleString()}`, 185, posicionY, { align: "right" });
      
      posicionY += 10;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("TOTAL PAGADO:", 150, posicionY, { align: "right" });
      doc.setFontSize(14);
      doc.text(`$${Number(pedidoActivo.total).toLocaleString()} COP`, 185, posicionY, { align: "right" });

      // ── PIE DE PÁGINA ──
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text("Este documento es un soporte de pago electrónico válido. Generado autónomamente por el sistema.", 105, 285, { align: "center" });

      // Guardar el archivo
      doc.save(`Recibo_Mimos_Pedido_${pedidoActivo.id}.pdf`);

    } catch (error) {
      console.error("Error construyendo el PDF:", error);
      alert("Error al generar el documento PDF.");
    } finally {
      setGenerandoPDF(false);
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

      {/* ── MODAL DE DETALLE DE PEDIDO (Solo Visualización en Pantalla) ── */}
      {pedidoActivo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-superficie)] w-full max-w-2xl rounded-2xl shadow-2xl border border-[var(--color-borde)] overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-6 border-b border-[var(--color-borde)] flex justify-between items-start bg-[var(--color-fondo)]">
              <div>
                <h2 className="text-xl font-black text-[var(--color-texto)]">Detalle de Compra</h2>
                <p className="text-sm text-[var(--color-texto-suave)]">Pedido #{pedidoActivo.id} • {new Date(pedidoActivo.fecha).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="mb-8 p-4 bg-[var(--color-secundario-soft)] rounded-lg border border-[var(--color-borde)]">
                <h3 className="text-xs font-bold text-[var(--color-texto-suave)] uppercase mb-4 tracking-wider">Estado del Envío</h3>
                <div className="flex items-center justify-between relative">
                  <div className="absolute left-0 top-1/2 w-full h-1 bg-[var(--color-borde)] -z-10 -translate-y-1/2"></div>
                  <div className="absolute left-0 top-1/2 w-full h-1 bg-green-500 -z-10 -translate-y-1/2"></div>
                  
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

              <h3 className="text-xs font-bold text-[var(--color-texto-suave)] uppercase mb-3 tracking-wider">Artículos Adquiridos</h3>
              
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

            {/* BOTONES DE ACCIÓN */}
            <div className="p-6 bg-[var(--color-superficie)] border-t border-[var(--color-borde)] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-bold text-[var(--color-texto-suave)]">Total Pagado</span>
                <span className="text-2xl font-black text-[var(--color-texto)]">${Number(pedidoActivo.total).toLocaleString()} COP</span>
              </div>
              
              <div className="flex gap-3 mt-4">
                <button 
                  onClick={descargarPDF} 
                  disabled={generandoPDF || cargandoDetalles}
                  className="flex-1 bg-[var(--color-acento)] hover:bg-orange-600 text-white text-xs font-bold py-3 rounded-lg transition-colors shadow-sm disabled:opacity-50 uppercase tracking-wide flex justify-center items-center gap-2"
                >
                  {generandoPDF ? "Generando Documento..." : "Descargar Recibo (PDF)"}
                  {!generandoPDF && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  )}
                </button>
                <button onClick={cerrarDetalle} className="flex-1 bg-[var(--color-fondo)] hover:bg-[var(--color-borde)] text-[var(--color-texto)] border border-[var(--color-borde)] text-xs font-bold py-3 rounded-lg transition-colors uppercase tracking-wide">
                  Cerrar
                </button>
              </div>

              {!reportando ? (
                <div className="flex justify-center mt-4 pt-4 border-t border-[var(--color-borde)]">
                   <button onClick={() => setReportando(true)} className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors uppercase tracking-wide">
                     ¿Problemas con este pedido? Abrir PQRS
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
                    <button type="submit" disabled={cargandoReporte} className="flex-1 text-xs font-bold text-white bg-red-500 rounded-lg py-2 hover:bg-red-600 transition-colors disabled:opacity-50">{cargandoReporte ? 'Enviando...' : 'Confirmar Reporte'}</button>
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