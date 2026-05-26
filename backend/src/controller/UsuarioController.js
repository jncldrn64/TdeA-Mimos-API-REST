import { 
    listarUsuarios, insertarUsuario, loginUsuario, 
    eliminarUsuario, actualizarUsuario, 
    obtenerPasswordHash, actualizarPassword 
} from "../model/UsuarioModel.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const getUsuarios = async (req, res) => {
    try {
        const usuarios = await listarUsuarios();
        res.status(200).json({ success: true, data: usuarios });
    } catch (error) {
        res.status(500).json({ message: "Error al obtener los usuarios", error: error.message });
    }
};

const postUsuario = async (req, res) => {
    try {
        const data = await insertarUsuario(req.body);
        res.status(201).json({ success: true, message: "Usuario creado exitosamente" });
    } catch (error) {
        // Le agregamos el error.message para saber exactamente qué falló en SQL Server
        res.status(500).json({ success: false, message: "Error al crear el usuario: " + error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const usuario = await loginUsuario(email);
        if (!usuario) {
            return res.status(401).json({ message: "Usuario no encontrado" });
        }
        const validPassword = await bcrypt.compare(password, usuario.password_hash);
        if (!validPassword) {
            return res.status(401).json({ message: "Contraseña incorrecta" });
        }
        const token = jwt.sign(
            { id: usuario.id_usuario, email: usuario.email, rol: usuario.id_rol },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES }
        );
        res.json({
            success: true,
            message: "Login exitoso",
            token,
            usuario: {
                id: usuario.id_usuario,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.id_rol
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error en login", error: error.message });
    }
};

const deleteUsuario = async (req, res) => {
    try {
        await eliminarUsuario(req.params.id_usuario);
        res.status(200).json({ message: "Usuario eliminado exitosamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar el usuario", error: error.message });
    }
};

const updateUsuario = async (req, res) => {
    try {
        await actualizarUsuario({ id: req.params.id_usuario, ...req.body });
        res.status(200).json({ message: "Usuario actualizado exitosamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar el usuario", error: error.message });
    }
};

// ── LÓGICA DE SEGURIDAD: CAMBIO DE CONTRASEÑA ──
const cambiarPassword = async (req, res) => {
    try {
        // Extraemos el ID directamente del token (inyectado por authMiddleware)
        const id_usuario = req.usuario.id || req.usuario.id_usuario || req.usuario.sub;
        const { password_actual, password_nueva } = req.body;

        if (!password_actual || !password_nueva) {
            return res.status(400).json({ success: false, message: "Faltan datos obligatorios." });
        }

        // 1. Traer la contraseña encriptada actual de la BD
        const user = await obtenerPasswordHash(id_usuario);
        if (!user) {
            return res.status(404).json({ success: false, message: "Usuario no encontrado." });
        }

        // 2. Comparar lo que digitó con lo que hay en la BD
        const validPassword = await bcrypt.compare(password_actual, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ success: false, message: "La contraseña actual es incorrecta." });
        }

        // 3. Encriptar la nueva y guardarla
        const nuevoHash = await bcrypt.hash(password_nueva, 10);
        await actualizarPassword(id_usuario, nuevoHash);

        res.status(200).json({ success: true, message: "Contraseña actualizada exitosamente." });

    } catch (error) {
        res.status(500).json({ success: false, message: "Error al cambiar contraseña", error: error.message });
    }
};

export { postUsuario, login, getUsuarios, deleteUsuario, updateUsuario, cambiarPassword };