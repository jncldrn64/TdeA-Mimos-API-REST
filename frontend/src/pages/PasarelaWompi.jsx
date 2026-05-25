import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

export default function PasarelaWompi() {
  const location = useLocation();
  const navigate = useNavigate();
  const { vaciarCarrito } = useCart();
  
  // Extraemos los datos que nos mandó el CarritoView
  const { parametrosWompi, id_venta } = location.state || {};

  const [procesando, setProcesando] = useState(false);
  const [metodo, setMetodo] = useState('tarjeta');

  // Si alguien entra a esta ruta directamente sin pasar por el carrito, lo expulsamos
  if (!parametrosWompi) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h2>
          <p className="text-gray-600 mb-6">Sesión de pago inválida o expirada.</p>
          <button onClick={() => navigate('/carrito')} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">Volver al Carrito</button>
        </div>
      </div>
    );
  }

  const simularPago = () => {
    setProcesando(true);
    // Simulamos la latencia del banco (2 segundos)
    setTimeout(() => {
      alert(`¡Pago Aprobado exitosamente!\nReferencia Wompi: ${parametrosWompi.referencia}`);
      vaciarCarrito();
      navigate("/"); // Redirigimos al inicio (o podríamos enviarlo a "Mis Pedidos")
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#111827] flex flex-col items-center justify-center p-4 font-inherit">
      
      {/* Tarjeta de la Pasarela (Estilo oscuro simulando entorno seguro) */}
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Cabecera Wompi Mock */}
        <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black tracking-tighter">wompi <span className="font-light text-sm">| simulación</span></h1>
            <p className="text-blue-200 text-xs mt-1">Entorno Sandbox Protegido</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-200">Total a Pagar</p>
            <p className="text-2xl font-bold">${(parametrosWompi.montoCentavos / 100).toLocaleString()} <span className="text-sm">COP</span></p>
          </div>
        </div>

        <div className="p-8">
          {/* Datos de Integridad (Para mostrarle al profesor que sí se hizo el hash) */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8 text-xs font-mono text-gray-500 break-all">
            <p className="font-bold text-gray-700 mb-1">Criptografía de Transacción:</p>
            <p>REF: {parametrosWompi.referencia}</p>
            <p className="mt-1 text-green-600 border-t pt-1 border-gray-200">
              HASH SHA-256:<br/>{parametrosWompi.firmaIntegridad}
            </p>
          </div>

          <h3 className="font-bold text-gray-800 mb-4">Selecciona tu método de pago</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button 
              onClick={() => setMetodo('tarjeta')}
              className={`p-4 border rounded-xl flex flex-col items-center gap-2 transition-all ${metodo === 'tarjeta' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
              <span className="text-sm font-bold">Tarjeta</span>
            </button>
            <button 
              onClick={() => setMetodo('nequi')}
              className={`p-4 border rounded-xl flex flex-col items-center gap-2 transition-all ${metodo === 'nequi' ? 'border-pink-600 bg-pink-50 text-pink-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
              <span className="text-sm font-bold">Nequi / PSE</span>
            </button>
          </div>

          {/* Formulario Ficticio de Tarjeta */}
          <div className={`space-y-4 ${metodo === 'tarjeta' ? 'block' : 'hidden'}`}>
            <input type="text" placeholder="Número de Tarjeta (Simulado)" className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500" readOnly value="**** **** **** 4242" />
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="MM/AA" className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500" readOnly value="12/28" />
              <input type="text" placeholder="CVC" className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500" readOnly value="123" />
            </div>
          </div>

          <button 
            onClick={simularPago}
            disabled={procesando}
            className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl shadow-lg transition-transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {procesando ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Procesando con el Banco...
              </>
            ) : "PAGAR AHORA"}
          </button>
          
          <p className="text-center text-xs text-gray-400 mt-6 flex justify-center items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path></svg>
            Pagos seguros mediante Wompi
          </p>
        </div>
      </div>
    </div>
  );
}