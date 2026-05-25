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

const eliminarUsuario = async (id_usuario) => {
    try {
        const conn = await poolConect();
        await conn.request()
            .input('id_usuario', sql.Int, id_usuario)
            .execute('sp_eliminarUsuario');
    } catch (error) {
        throw error;
    }
};

const actualizarUsuario = async (usuario) => {
    try {
        const conn = await poolConect();
        await conn.request()
            .input('id',       sql.BigInt,  usuario.id)
            .input('nombre',   sql.VarChar, usuario.nombre   || null)
            .input('apellido', sql.VarChar, usuario.apellido || null)
            .input('email',    sql.VarChar, usuario.email    || null)
            .input('estado',   sql.VarChar, usuario.estado   || null)
            .execute('sp_ActualizarUsuario');
    } catch (error) {
        throw error;
    }
};

// ── NUEVAS FUNCIONES PARA CAMBIO DE CONTRASEÑA ──
const obtenerPasswordHash = async (id_usuario) => {
    try {
        const conn = await poolConect();
        // Consulta directa parametrizada para no depender de un SP nuevo
        const result = await conn.request()
            .input('id', sql.BigInt, id_usuario)
            .query('SELECT password_hash FROM Usuarios WHERE id_usuario = @id');
        return result.recordset[0];
    } catch (error) {
        throw error;
    }
};

const actualizarPassword = async (id_usuario, nuevoHash) => {
    try {
        const conn = await poolConect();
        await conn.request()
            .input('id', sql.BigInt, id_usuario)
            .input('hash', sql.VarChar, nuevoHash)
            .query('UPDATE Usuarios SET password_hash = @hash WHERE id_usuario = @id');
    } catch (error) {
        throw error;
    }
};

export { 
    listarUsuarios, 
    insertarUsuario, 
    loginUsuario, 
    eliminarUsuario, 
    actualizarUsuario,
    obtenerPasswordHash,
    actualizarPassword 
};