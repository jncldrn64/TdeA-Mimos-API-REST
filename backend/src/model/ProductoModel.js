import { sql, poolConect } from '../config/db.js';

// Lista todos los productos activos (catálogo público)
const listarProductosActivos = async () => {
    const conn = await poolConect();
    const result = await conn.request().execute('sp_ListarProductosActivos');
    return result.recordset;
};

// Lista todos los productos (panel admin)
const listarProductosTodos = async () => {
    const conn = await poolConect();
    const result = await conn.request().execute('sp_ListarProductosTodos');
    return result.recordset;
};

// Busca productos por nombre o descripción
const buscarProductos = async (termino) => {
    const conn = await poolConect();
    const result = await conn.request()
        .input('termino', sql.VarChar, termino)
        .execute('sp_BuscarProductos');
    return result.recordset;
};

// Obtiene un producto por ID
const obtenerProductoPorId = async (id) => {
    const conn = await poolConect();
    const result = await conn.request()
        .input('id_producto', sql.BigInt, id)
        .execute('sp_ObtenerProductoPorId');
    return result.recordset[0] || null;
};

// Inserta un nuevo producto (admin)
const insertarProducto = async (producto) => {
    const conn = await poolConect();
    const result = await conn.request()
        .input('nombre_producto',       sql.VarChar,      producto.nombre_producto)
        .input('descripcion_detallada', sql.VarChar,      producto.descripcion_detallada || null)
        .input('precio_unitario',       sql.Decimal(10,2),producto.precio_unitario)
        .input('stock_disponible',      sql.Int,          producto.stock_disponible ?? 0)
        .input('url_imagen',            sql.VarChar,      producto.url_imagen || null)
        .execute('sp_InsertarProducto');
    return result.recordset[0]; // { id_producto: N }
};

// Actualiza datos de un producto (admin)
const actualizarProducto = async (id, producto) => {
    const conn = await poolConect();
    await conn.request()
        .input('id_producto',           sql.BigInt,       id)
        .input('nombre_producto',       sql.VarChar,      producto.nombre_producto)
        .input('descripcion_detallada', sql.VarChar,      producto.descripcion_detallada || null)
        .input('precio_unitario',       sql.Decimal(10,2),producto.precio_unitario)
        .input('url_imagen',            sql.VarChar,      producto.url_imagen || null)
        .execute('sp_ActualizarProducto');
};

// Actualiza solo el stock
const actualizarStock = async (id, nuevoStock) => {
    const conn = await poolConect();
    await conn.request()
        .input('id_producto', sql.BigInt, id)
        .input('nuevo_stock', sql.Int,    nuevoStock)
        .execute('sp_ActualizarStock');
};

// Desactiva un producto (soft delete)
const desactivarProducto = async (id) => {
    const conn = await poolConect();
    await conn.request()
        .input('id_producto', sql.BigInt, id)
        .execute('sp_DesactivarProducto');
};

// Activa un producto desactivado
const activarProducto = async (id) => {
    const conn = await poolConect();
    await conn.request()
        .input('id_producto', sql.BigInt, id)
        .execute('sp_ActivarProducto');
};

export {
    listarProductosActivos,
    listarProductosTodos,
    buscarProductos,
    obtenerProductoPorId,
    insertarProducto,
    actualizarProducto,
    actualizarStock,
    desactivarProducto,
    activarProducto
};
