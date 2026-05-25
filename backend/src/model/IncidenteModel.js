import { sql, poolConect } from '../config/db.js';

export const crearIncidente = async (incidente) => {
    const conn = await poolConect();
    const result = await conn.request()
        .input('usuario_id', sql.BigInt, incidente.usuario_id)
        .input('venta_id', sql.BigInt, incidente.venta_id || null)
        .input('asunto', sql.VarChar, incidente.asunto)
        .input('mensaje', sql.VarChar, incidente.mensaje)
        .execute('sp_CrearIncidente');
    return result.recordset[0];
};

export const listarIncidentesUsuario = async (usuario_id) => {
    const conn = await poolConect();
    const result = await conn.request()
        .input('usuario_id', sql.BigInt, usuario_id)
        .execute('sp_ListarIncidentesUsuario');
    return result.recordset;
};

export const listarTodosIncidentes = async () => {
    const conn = await poolConect();
    const result = await conn.request().execute('sp_ListarTodosIncidentes');
    return result.recordset;
};

export const actualizarEstadoIncidente = async (id_incidente, estado, respuesta = null) => {
    const conn = await poolConect();
    await conn.request()
        .input('id_incidente', sql.BigInt, id_incidente)
        .input('nuevo_estado', sql.VarChar, estado)
        .input('respuesta', sql.VarChar, respuesta)
        .execute('sp_ActualizarEstadoIncidente');
};