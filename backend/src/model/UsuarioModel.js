import { poolConect } from '../config/db.js';
import sql from 'mssql';
import bcrypt from 'bcrypt';

const listarUsuarios = async () => {
    try {
        const conn = await poolConect();
        const result = await conn.request().execute("sp_ListarUsuarios");
        return result.recordset;
    } catch (error) {
        throw error;
    }
};

const insertarUsuario = async (usuario) => {
    const passwordHasheada = await bcrypt.hash(usuario.password_hash, 10);
    try {
        const conn = await poolConect();
        const result = await conn.request()
            .input('id_rol', sql.BigInt, usuario.id_rol)     
            .input('nombre', sql.VarChar, usuario.nombre)
            .input('apellido', sql.VarChar, usuario.apellido)
            .input('email', sql.VarChar, usuario.email) 
            .input('estado', sql.VarChar, usuario.estado)
            .input('password_hash', sql.VarChar, passwordHasheada)
            .execute("sp_InsertarUsuario");

        return result;
    } catch (error) {
        throw error;
    }
};

const loginUsuario = async (email) => {
    try {
        const conn = await poolConect();
        const result = await conn.request()
            .input('email', sql.VarChar, email)
            .execute("sp_LoginUsuario");
        return result.recordset[0];
    } catch (error) {
        throw error;
    }
};

export { listarUsuarios, insertarUsuario, loginUsuario };