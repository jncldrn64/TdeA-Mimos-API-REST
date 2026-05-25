import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext.jsx";
import { Link, useNavigate } from "react-router-dom";

export default function CarritoView() {
  const { carrito, modificarCantidad, eliminarDelCarrito, vaciarCarrito, cantidadTotal, valorTotal, sincronizarCarrito } = useCart();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const API = import.meta.env.VITE_API_URL || "http://localhost:3500";

  const [verificando, setVerificando] = useState(false);
  const [cambiosInventario, setCambiosInventario] = useState([]);

  // ── MATEMÁTICAS DESACOPLADAS (El precio de BD ya incluye IVA) ──
  const SubtotalReal = valorTotal / 1.19;
  const IVAReal = valorTotal - SubtotalReal;
  const TotalFinal = valorTotal; 

  useEffect(() => {
    const verificarStockReal = async () => {
      if (carrito.length === 0) return;
      setVerificando(true);
      try {
        const res = await fetch(`${API}/api/producto`);
        const data = await res.json();

        if (data.success) {
          // Le pasamos el catálogo fresco al contexto para que él haga los cálculos
          const nuevasAlertas = sincronizarCarrito(data.data);
          if (nuevasAlertas.length > 0) {
            setCambiosInventario(nuevasAlertas);
          }
        }
      } catch (error) {
        console.error("Error validando stock en tiempo real", error);
      } finally {
        setVerificando(false);
      }
    };

    verificarStockReal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const handleContinuar = () => {
    if (!token) {
      alert("Debes iniciar sesión para continuar con tu compra.");
      navigate("/login");
      return;
    }
    navigate("/envio");
  };

  if (carrito.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold mb-2 text-[var(--color-texto)]">Tu carrito está vacío</h2>
        <p className="text-[var(--color-texto-suave)] mb-6">Parece que aún no has agregado tus helados favoritos.</p>
        <Link to="/catalogo" className="bg-[var(--color-acento)] hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-sm">
          Explorar el Catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 min-h-screen font-inherit">
      <h1 className="text-3xl font-black mb-6 text-[var(--color-texto)] tracking-tight">Tu Pedido ({cantidadTotal})</h1>
      
      {/* Mensajes de Alerta */}
      {cambiosInventario.length > 0 && (
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-6 rounded-r-lg shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
            <h3 className="text-orange-800 font-bold text-sm">Actualización de Inventario</h3>
          </div>
          <ul className="list-disc pl-7 text-xs text-orange-700 space-y-1">
            {cambiosInventario.map((alerta, i) => <li key={i}>{alerta}</li>)}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          {verificando && <div className="text-xs text-[var(--color-texto-suave)] animate-pulse mb-2">Sincronizando con bodega...</div>}

          {carrito.map(item => (
            <div key={item.id_producto} className="flex flex-col sm:flex-row items-center bg-[var(--color-superficie)] p-4 rounded-xl border border-[var(--color-borde)] shadow-sm gap-4 transition-all">
              <img src={item.url_imagen || "/img/productos/default.png"} alt={item.nombre_producto} className="w-20 h-20 object-contain bg-[var(--color-secundario-soft)] rounded" onError={(e) => { e.target.style.display='none'; }} />

              <div className="flex-1">
                <h3 className="font-bold text-lg text-[var(--color-texto)] leading-tight">{item.nombre_producto}</h3>
                <p className="text-[var(--color-texto-suave)] font-medium text-sm mt-1">${item.precio_unitario.toLocaleString()}</p>
              </div>

              <div className="flex items-center gap-3 bg-[var(--color-fondo)] p-1 rounded-lg border border-[var(--color-borde)]">
                <button onClick={() => modificarCantidad(item.id_producto, -1)} className="w-8 h-8 flex items-center justify-center hover:bg-[var(--color-secundario)] rounded text-[var(--color-texto)] font-bold transition-colors">-</button>
                <span className="w-6 text-center font-bold text-[var(--color-texto)]">{item.cantidad}</span>
                <button onClick={() => modificarCantidad(item.id_producto, 1)} className="w-8 h-8 flex items-center justify-center hover:bg-[var(--color-secundario)] rounded text-[var(--color-texto)] font-bold transition-colors">+</button>
              </div>

              <div className="text-right ml-4 flex flex-col items-end">
                <p className="font-black text-[var(--color-texto)] text-lg">${(item.precio_unitario * item.cantidad).toLocaleString()}</p>
                <button onClick={() => eliminarDelCarrito(item.id_producto)} className="text-red-500 hover:text-red-700 text-xs font-bold hover:underline mt-1 transition-colors">Eliminar</button>
              </div>
            </div>
          ))}
          <div className="flex justify-start">
            <button onClick={vaciarCarrito} className="text-[var(--color-texto-suave)] hover:text-red-500 text-xs font-bold underline mt-4 transition-colors">VACIAR CARRITO</button>
          </div>
        </div>

        <div className="bg-[var(--color-superficie)] p-6 rounded-xl border border-[var(--color-borde)] h-fit shadow-sm">
          <h2 className="text-xl font-bold mb-6 text-[var(--color-texto)] border-b border-[var(--color-borde)] pb-2">Resumen Financiero</h2>
          <div className="space-y-3 text-sm text-[var(--color-texto-suave)] mb-6">
            <div className="flex justify-between"><span>Subtotal :</span> <span className="font-medium text-[var(--color-texto)]">${Math.round(SubtotalReal).toLocaleString()}</span></div>
            <div className="flex justify-between"><span>Impuestos (19%):</span> <span className="font-medium text-[var(--color-texto)]">${Math.round(IVAReal).toLocaleString()}</span></div>
            <div className="flex justify-between"><span>Envío:</span> <span className="font-bold text-green-600">Calculado en el siguiente paso</span></div>
          </div>

          <div className="border-t border-[var(--color-borde)] pt-4 mb-8">
            <div className="flex justify-between items-end">
              <span className="text-lg font-bold text-[var(--color-texto)]">Total a pagar:</span>
              <span className="text-2xl font-black text-[var(--color-texto)] tracking-tight">${Math.round(TotalFinal).toLocaleString()}</span>
            </div>
            <p className="text-right text-[10px] text-[var(--color-texto-suave)] mt-1">IVA incluido en el total</p>
          </div>

          <button onClick={handleContinuar} className="w-full bg-[var(--color-primario)] hover:bg-[var(--color-primario-dark)] text-white font-black py-4 rounded-xl shadow-md transition-all active:scale-95 text-lg uppercase tracking-wide flex justify-center items-center gap-2">
            Continuar a Envío
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>

      </div>
    </div>
  );
}