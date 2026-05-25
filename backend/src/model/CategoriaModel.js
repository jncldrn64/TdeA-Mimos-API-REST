import { poolConect } from '../config/db.js';

export const listarCategorias = async () => {
    try {
        const conn = await poolConect();
        const result = await conn.request().execute('sp_ObtenerCategorias');
        return result.recordset;
    } catch (error) {
        throw new Error("Error al consultar categorías: " + error.message);
    }
};