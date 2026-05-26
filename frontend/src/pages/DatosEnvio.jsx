import { useState } from "react";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { Link, useNavigate } from "react-router-dom";

export default function DatosEnvio() {
  const { carrito, valorTotal, vaciarCarrito } = useCart();
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  const API = import.meta.env.VITE_API_URL || "http://localhost:3500";
  const token = localStorage.getItem("token");

  // ── MATEMÁTICAS DESACOPLADAS B2C (El IVA ya viene incluido) ──
  const costoEnvio = 5000; 
  const TotalBase = valorTotal; 
  const SubtotalReal = TotalBase / 1.19;
  const IVAReal = TotalBase - SubtotalReal;
  
  // El Total final es el Valor en Vitrina + Envío (Sin volver a sumar el IVA)
  const TotalFinal = Math.round(TotalBase + costoEnvio); 

  const [formEnvio, setFormEnvio] = useState({
    direccion: "",
    ciudad: "Medellín",
    telefono: "",
    notas: ""
  });

  const [procesando, setProcesando] = useState(false);

  // Si alguien entra aquí con el carrito vacío, lo devolvemos
  if (carrito.length === 0) {
    navigate("/carrito");
    return null;
  }

  // ── FUNCIÓN DISPARADA DIRECTAMENTE POR EL BOTÓN ──
  const handleProcesarCheckout = async (e) => {
    if (e) e.preventDefault();
    
    if (!formEnvio.direccion || !formEnvio.telefono || formEnvio.telefono.length < 7) {
      alert("Por favor, completa una dirección válida y un teléfono de contacto.");
      return;
    }

    setProcesando(true);

    try {
      // Solo pedimos las firmas de Wompi usando un ID temporal (0), la venta real se hará en el siguiente paso
      const resWompi = await fetch(`${API}/api/wompi/parametros`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ id_venta: 0, total: TotalFinal })
      });

      if (verificarSesion && resWompi.status === 401) return;

      const dataWompi = await resWompi.json();

      if (dataWompi.success) {
        navigate("/pasarela", { 
          state: { 
            parametrosWompi: dataWompi.data, 
            datosEnvio: formEnvio,
            totalFinal: TotalFinal // Pasamos el total final a la pasarela
          } 
        });
      } else {
        alert("Error al contactar pasarela de pago.");
      }
    } catch (error) {
      alert("Falla de red.");
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen font-inherit">
      
      <nav className="flex text-sm text-[var(--color-texto-suave)] mb-8 items-center gap-2">
        <Link to="/carrito" className="hover:text-[var(--color-acento)] transition-colors">Carrito</Link>
        <span>›</span>
        <span className="font-bold text-[var(--color-texto)]">Envío y Facturación</span>
        <span>›</span>
        <span>Pago</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        
        <div className="lg:col-span-3">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-[var(--color-texto)] flex items-center gap-2 mb-4">
              <img src="/img/iconos/cuenta-icon.svg" className="w-5 h-5 opacity-70" alt="Contacto" onError={(e)=>e.target.style.display='none'}/>
              Información de Contacto
            </h2>
            <div className="bg-[var(--color-fondo)] p-4 rounded-lg border border-[var(--color-borde)] text-sm">
              <p className="font-medium text-[var(--color-texto)]">{usuario?.nombre} {usuario?.apellido}</p>
              <p className="text-[var(--color-texto-suave)]">{usuario?.email}</p>
            </div>
          </div>

          {/* ── FORMULARIO SIN onSubmit (React toma el control) ── */}
          <form id="form-envio">
            <h2 className="text-xl font-bold text-[var(--color-texto)] flex items-center gap-2 mb-4">
              <img src="/img/iconos/envio-icon.svg" className="w-5 h-5 opacity-70" alt="Envío" onError={(e)=>e.target.style.display='none'}/>
              Dirección de Entrega
            </h2>
            
            <div className="grid gap-4 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--color-texto-suave)] mb-1">Ciudad</label>
                  <select 
                    value={formEnvio.ciudad} onChange={(e) => setFormEnvio({...formEnvio, ciudad: e.target.value})}
                    className="w-full p-3 bg-[var(--color-superficie)] border border-[var(--color-borde)] rounded-lg text-sm outline-none focus:border-[var(--color-acento)] transition-colors"
                  >
                    <option value="Medellín">Medellín</option>
                    <option value="Bello">Bello</option>
                    <option value="Envigado">Envigado</option>
                    <option value="Sabaneta">Sabaneta</option>
                    <option value="Itagüí">Itagüí</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--color-texto-suave)] mb-1">Teléfono Móvil *</label>
                  <input 
                    type="tel" placeholder="Ej: 300 123 4567"
                    value={formEnvio.telefono} onChange={(e) => setFormEnvio({...formEnvio, telefono: e.target.value.replace(/[^0-9]/g, '')})}
                    className="w-full p-3 bg-[var(--color-superficie)] border border-[var(--color-borde)] rounded-lg text-sm outline-none focus:border-[var(--color-acento)] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-texto-suave)] mb-1">Dirección Completa *</label>
                <input 
                  type="text" placeholder="Calle, Carrera, Avenida, Número"
                  value={formEnvio.direccion} onChange={(e) => setFormEnvio({...formEnvio, direccion: e.target.value})}
                  className="w-full p-3 bg-[var(--color-superficie)] border border-[var(--color-borde)] rounded-lg text-sm outline-none focus:border-[var(--color-acento)] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-texto-suave)] mb-1">Apartamento, bloque, indicaciones (Opcional)</label>
                <input 
                  type="text" placeholder="Ej: Apto 301, Torre 2, dejar en portería"
                  value={formEnvio.notas} onChange={(e) => setFormEnvio({...formEnvio, notas: e.target.value})}
                  className="w-full p-3 bg-[var(--color-superficie)] border border-[var(--color-borde)] rounded-lg text-sm outline-none focus:border-[var(--color-acento)] transition-colors"
                />
              </div>
            </div>
          </form>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-[var(--color-superficie)] p-6 rounded-xl border border-[var(--color-borde)] shadow-sm sticky top-6">
            <h3 className="font-bold text-[var(--color-texto)] mb-4 border-b border-[var(--color-borde)] pb-2">Resumen del Pedido</h3>
            
            <div className="max-h-48 overflow-y-auto mb-4 space-y-3 pr-2">
              {carrito.map(item => (
                <div key={item.id_producto} className="flex items-center gap-3">
                  <div className="relative">
                    <img src={item.url_imagen || "/img/productos/default.png"} className="w-12 h-12 object-contain bg-[var(--color-fondo)] border border-[var(--color-borde)] rounded-md" onError={(e)=>e.target.style.display='none'}/>
                    <span className="absolute -top-2 -right-2 bg-[var(--color-texto-suave)] text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">{item.cantidad}</span>
                  </div>
                  <div className="flex-1 text-xs">
                    <p className="font-bold text-[var(--color-texto)] truncate">{item.nombre_producto}</p>
                  </div>
                  <div className="text-xs font-bold text-[var(--color-texto)]">
                    ${(item.precio_unitario * item.cantidad).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-[var(--color-borde)] pt-4 space-y-2 text-sm text-[var(--color-texto-suave)]">
              <div className="flex justify-between"><span>Subtotal </span> <span>${Math.round(SubtotalReal).toLocaleString()}</span></div>
              <div className="flex justify-between"><span>IVA (19%)</span> <span>${Math.round(IVAReal).toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Envío</span> <span>${costoEnvio.toLocaleString()}</span></div>
            </div>

            <div className="border-t border-[var(--color-borde)] mt-4 pt-4 flex justify-between items-center mb-1">
              <span className="text-lg font-bold text-[var(--color-texto)]">Total COP</span>
              <span className="text-2xl font-black text-[var(--color-texto)]">${TotalFinal.toLocaleString()}</span>
            </div>
            <p className="text-right text-[10px] text-[var(--color-texto-suave)] mb-6">Todos los impuestos incluidos</p>

            {/* ── BOTÓN TIPO BUTTON (Dispara a React sin validar el HTML5) ── */}
            <button 
              type="button" 
              onClick={handleProcesarCheckout}
              disabled={procesando}
              className="w-full bg-[var(--color-primario)] hover:bg-[var(--color-primario-dark)] text-white font-black py-4 rounded-xl shadow-md transition-all active:scale-95 text-lg disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide flex justify-center items-center gap-2"
            >
              {procesando ? "Procesando..." : "Ir al Pago"}
            </button>

            <div className="mt-6 text-center">
              <p className="text-xs text-[var(--color-texto-suave)] mb-2 flex items-center justify-center gap-1">
                <img src="/img/iconos/check-circle.svg" className="w-3 h-3 opacity-60" onError={(e)=>e.target.style.display='none'}/>
                Pago seguro y encriptado
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}