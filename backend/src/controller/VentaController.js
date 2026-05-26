import { registrarCheckout, obtenerPedidosPorUsuario, obtenerDetallePorVenta } from '../model/VentaModel.js';
import { poolConect } from '../config/db.js'; // <-- Importación para conexión directa
import sql from 'mssql'; // <-- Importación para tipos de datos SQL

export const procesarCheckout = async (req, res) => {
  try {
    const id_usuario = req.usuario.id || req.usuario.id_usuario || req.usuario.sub; 
    const { total, items } = req.body;

    if (!id_usuario) return res.status(401).json({ success: false, message: 'No se detectó el ID del usuario en el token.' });
    if (!items || items.length === 0) return res.status(400).json({ success: false, message: 'El carrito está vacío.' });
    if (!total || total <= 0) return res.status(400).json({ success: false, message: 'El total de la compra es inválido.' });

    const id_venta = await registrarCheckout(id_usuario, total, items);

    res.status(201).json({ success: true, message: 'Compra procesada exitosamente', id_venta: id_venta });

  } catch (error) {
    let mensajeUsuario = 'Error interno del servidor al procesar la compra.';
    if (error.message.includes('Stock insuficiente')) {
      mensajeUsuario = error.message; 
    }
    res.status(500).json({ success: false, message: mensajeUsuario, error: error.message });
  }
};

export const obtenerMisPedidos = async (req, res) => {
  try {
    const usuarioId = req.usuario.id || req.usuario.id_usuario || req.usuario.sub; 
    if (!usuarioId) return res.status(401).json({ success: false, message: 'Usuario no autenticado.' });

    const pedidos = await obtenerPedidosPorUsuario(usuarioId);
    res.status(200).json({ success: true, data: pedidos });

  } catch (error) {
    res.status(500).json({ success: false, message: 'No se pudo obtener el historial.', error: error.message });
  }
};

export const obtenerDetalleVenta = async (req, res) => {
  try {
    const { id } = req.params;
    const detalles = await obtenerDetallePorVenta(id);
    res.status(200).json({ success: true, data: detalles });
  } catch (error) {
    res.status(500).json({ success: false, message: 'No se pudo obtener el detalle.', error: error.message });
  }
};

// =======================================================
// ── NUEVAS FUNCIONES DE ADMINISTRADOR ──
// =======================================================

export const obtenerTodosLosPedidos = async (req, res) => {
  try {
    const pool = await poolConect(); // <-- CORREGIDO AQUÍ
    const result = await pool.request().query(`
      SELECT v.id, v.total, v.fecha, v.estado, u.nombre, u.apellido, u.email
      FROM Ventas v
      INNER JOIN Usuarios u ON v.usuario_id = u.id_usuario
      ORDER BY v.fecha DESC
    `);
    
    res.status(200).json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al cargar pedidos globales.', error: error.message });
  }
};

export const actualizarEstadoPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    
    const pool = await poolConect(); // <-- CORREGIDO AQUÍ
    await pool.request()
      .input('id', sql.BigInt, id)
      .input('estado', sql.VarChar, estado)
      .query('UPDATE Ventas SET estado = @estado WHERE id = @id');

    res.status(200).json({ success: true, message: 'Estado del pedido actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al cambiar estado.', error: error.message });
  }
};