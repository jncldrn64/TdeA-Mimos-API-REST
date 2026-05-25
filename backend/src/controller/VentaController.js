import { registrarCheckout, obtenerPedidosPorUsuario } from '../model/VentaModel.js';
import { obtenerDetallePorVenta } from '../model/VentaModel.js'; // Asegúrate de importarla arriba

export const procesarCheckout = async (req, res) => {
  try {
    // 1. Extraemos el ID del usuario con total seguridad
    const id_usuario = req.usuario.id || req.usuario.id_usuario || req.usuario.sub; 
    const { total, items } = req.body;

    if (!id_usuario) return res.status(401).json({ success: false, message: 'No se detectó el ID del usuario en el token.' });
    if (!items || items.length === 0) return res.status(400).json({ success: false, message: 'El carrito está vacío.' });
    if (!total || total <= 0) return res.status(400).json({ success: false, message: 'El total de la compra es inválido.' });

    console.log(`▶ Procesando compra... Usuario: ${id_usuario} | Total: ${total}`);

    // 2. Ejecutamos la transacción en SQL Server
    const id_venta = await registrarCheckout(id_usuario, total, items);

    res.status(201).json({ 
      success: true, 
      message: 'Compra procesada exitosamente', 
      id_venta: id_venta 
    });

  } catch (error) {
    console.error("❌ ERROR CRÍTICO EN CHECKOUT:", error.message);
    
    // 3. Interceptamos el mensaje de SQL Server para dárselo limpio al Frontend
    let mensajeUsuario = 'Error interno del servidor al procesar la compra.';
    
    // Si el error fue lanzado por nuestro RAISERROR / THROW en DBeaver:
    if (error.message.includes('Stock insuficiente')) {
      mensajeUsuario = error.message; 
    }

    res.status(500).json({ 
      success: false, 
      message: mensajeUsuario, 
      error: error.message 
    });
  }
};

export const obtenerMisPedidos = async (req, res) => {
  try {
    // Extraemos el ID sin importar la llave que use el JWT
    const usuarioId = req.usuario.id || req.usuario.id_usuario || req.usuario.sub; 
    
    console.log("▶ Buscando pedidos para el usuario con ID:", usuarioId);

    if (!usuarioId) {
      return res.status(401).json({ success: false, message: 'Usuario no autenticado o token corrupto.' });
    }

    const pedidos = await obtenerPedidosPorUsuario(usuarioId);
    
    console.log(`▶ Pedidos encontrados en BD: ${pedidos.length}`);
    res.status(200).json({ success: true, data: pedidos });

  } catch (error) {
    console.error("❌ ERROR EN MIS PEDIDOS:", error);
    res.status(500).json({ success: false, message: 'No se pudo obtener el historial.', error: error.message });
  }
};

export const obtenerDetalleVenta = async (req, res) => {
  try {
    const { id } = req.params;
    const detalles = await obtenerDetallePorVenta(id);
    res.status(200).json({ success: true, data: detalles });
  } catch (error) {
    console.error("❌ ERROR EN DETALLE DE VENTA:", error);
    res.status(500).json({ success: false, message: 'No se pudo obtener el detalle.', error: error.message });
  }
};