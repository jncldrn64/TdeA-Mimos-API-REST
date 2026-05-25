import express from 'express';
import { 
    getUsuarios, postUsuario, login, 
    deleteUsuario, updateUsuario, cambiarPassword 
} from "../controller/UsuarioController.js";
import { verificarToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// ── Rutas Públicas (Sin token) ──
router.post("/usuario", postUsuario); 
router.post("/login", login);         

// ── Rutas Protegidas (Exigen token JWT válido) ──
router.get("/usuario", verificarToken, getUsuarios);

// IMPORTANTE: Esta ruta específica debe ir antes de las que tienen el parámetro dinámico :id_usuario
router.put("/usuario/cambiar-password", verificarToken, cambiarPassword);

router.delete("/usuario/:id_usuario", verificarToken, deleteUsuario);
router.put("/usuario/:id_usuario", verificarToken, updateUsuario);

export default router;