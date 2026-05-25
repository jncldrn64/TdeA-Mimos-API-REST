import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  
  // 1. PERSISTENCIA BLINDADA
  const [carrito, setCarrito] = useState(() => {
    try {
      const guardado = localStorage.getItem("carritoMimos");
      if (!guardado) return []; 

      const parseado = JSON.parse(guardado);

      if (!Array.isArray(parseado)) {
        localStorage.removeItem("carritoMimos");
        return [];
      }
      return parseado;
    } catch (error) {
      localStorage.removeItem("carritoMimos");
      return [];
    }
  });

  // 2. AUTOGUARDADO
  useEffect(() => {
    localStorage.setItem("carritoMimos", JSON.stringify(carrito));
  }, [carrito]);

  // ── FUNCIONES PURIFICADAS (Sin efectos secundarios dentro del SetState) ──

  const agregarAlCarrito = (producto) => {
    if (producto.stock_disponible <= 0) {
      alert(`Lo sentimos, el producto "${producto.nombre_producto}" está agotado.`);
      return false;
    }

    // Buscamos el item ANTES de intentar actualizar el estado
    const itemExistente = carrito.find(item => item.id_producto === producto.id_producto);
    
    if (itemExistente) {
      if (itemExistente.cantidad >= producto.stock_disponible) {
        alert(`Límite de bodega alcanzado: Solo quedan ${producto.stock_disponible} unidades.`);
        return false; 
      }
      
      // Si la validación pasa, actualizamos el estado limpiamente
      setCarrito(prev => prev.map(item =>
        item.id_producto === producto.id_producto
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ));
      return true;
    }
    
    // Si no existía en el carrito, lo agregamos
    setCarrito(prev => [...prev, { ...producto, cantidad: 1 }]);
    return true; 
  };

  const modificarCantidad = (id, delta) => {
    // Validamos ANTES de actualizar
    const itemTarget = carrito.find(i => i.id_producto === id);
    if (!itemTarget) return;

    const nuevaCantidad = itemTarget.cantidad + delta;

    if (nuevaCantidad > itemTarget.stock_disponible) {
      alert(`Límite de bodega alcanzado: Solo quedan ${itemTarget.stock_disponible} unidades.`);
      return;
    }

    if (nuevaCantidad > 0) {
      setCarrito(prev => prev.map(item =>
        item.id_producto === id ? { ...item, cantidad: nuevaCantidad } : item
      ));
    }
  };

  const eliminarDelCarrito = (id) => {
    setCarrito(prev => prev.filter(item => item.id_producto !== id));
  };

  const vaciarCarrito = () => setCarrito([]);

  // ── SINCRONIZACIÓN CORREGIDA ──
  const sincronizarCarrito = (catalogoFresco) => {
    let alertasGeneradas = [];
    let carritoCorregido = [];

    // Validamos usando la variable externa 'carrito' (No se duplicará en StrictMode)
    carrito.forEach(itemCart => {
      const prodBD = catalogoFresco.find(p => p.id_producto === itemCart.id_producto);
      
      if (!prodBD || !prodBD.esta_activo || prodBD.stock_disponible <= 0) {
        alertasGeneradas.push(`"${itemCart.nombre_producto}" se agotó o ya no está disponible y fue retirado.`);
      } else {
        let cantidadFinal = itemCart.cantidad;
        if (prodBD.stock_disponible < itemCart.cantidad) {
          alertasGeneradas.push(`"${itemCart.nombre_producto}" bajó su stock. Ajustado automáticamente a ${prodBD.stock_disponible} unidades.`);
          cantidadFinal = prodBD.stock_disponible; 
        }

        carritoCorregido.push({
          ...itemCart,
          cantidad: cantidadFinal,
          stock_disponible: prodBD.stock_disponible,
          precio_unitario: prodBD.precio_unitario 
        });
      }
    });

    // Seteamos el estado una única vez con la información ya procesada
    setCarrito(carritoCorregido);

    return alertasGeneradas; 
  };

  const cantidadTotal = carrito.reduce((acc, item) => acc + item.cantidad, 0);
  const valorTotal = carrito.reduce((acc, item) => acc + (item.precio_unitario * item.cantidad), 0);

  return (
    <CartContext.Provider value={{
      carrito, agregarAlCarrito, modificarCantidad, eliminarDelCarrito, vaciarCarrito, cantidadTotal, valorTotal, sincronizarCarrito
    }}>
      {children}
    </CartContext.Provider>
  );
};