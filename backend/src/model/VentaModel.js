import { sql, poolConect } from '../config/db.js';

const registrarCheckout = async (id_usuario, total, items) => {
  const pool = await poolConect();
  
  try {
    // Convertimos el array de Javascript a un String JSON para SQL Server
    const itemsJSON = JSON.stringify(items);

    const result = await pool.request()
      .input('usuario_id', sql.BigInt, id_usuario)
      .input('total', sql.Decimal(18, 2), total)
      .input('itemsJSON', sql.NVarChar(sql.MAX), itemsJSON)
      .execute('sp_ProcesarCheckout');

    // Retornamos el id_venta generado
    return result.recordset[0].id_venta;

  } catch (error) {
    // Capturamos el error (ej: "Stock insuficiente para: Copa Euforia")
    throw new Error(error.message);
  }
};

export { registrarCheckout };

export const obtenerPedidosPorUsuario = async (id_usuario) => {
  try {
    const conn = await poolConect();
    const result = await conn.request()
      .input('id_usuario', sql.BigInt, id_usuario)
      .query(`
        SELECT id, total, fecha, estado 
        FROM Ventas 
        WHERE usuario_id = @id_usuario 
        ORDER BY fecha DESC
      `);
    
    return result.recordset;
  } catch (error) {
    throw new Error("Error al consultar la base de datos: " + error.message);
  }
};

export const obtenerDetallePorVenta = async (venta_id) => {
  try {
    const conn = await poolConect();
    const result = await conn.request()
      .input('venta_id', sql.BigInt, venta_id)
      .execute('sp_ObtenerDetalleVenta');
    return result.recordset;
  } catch (error) {
    throw new Error("Error al consultar detalles de venta: " + error.message);
  }
};