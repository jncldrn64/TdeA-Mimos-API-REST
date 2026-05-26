import express from 'express';
import { 
    getUsuarios, postUsuario, login, 
    deleteUsuario, updateUsuario, cambiarPassword, recuperarPassword, resetearPassword
} from "../controller/UsuarioController.js"; // <-- ¡Debe decir UsuarioController.js!
import { verificarToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// ── Rutas Públicas (Sin token) ──
router.post("/usuario", postUsuario); 
router.post("/login", login);         
router.post("/usuario/recuperar-password", recuperarPassword); 
router.post("/usuario/reset-password", resetearPassword); 

// ── Rutas Protegidas (Exigen token JWT válido) ──
router.get("/usuario", verificarToken, getUsuarios);

// IMPORTANTE: Esta ruta específica debe ir antes de las que tienen el parámetro dinámico :id_usuario
router.put("/usuario/cambiar-password", verificarToken, cambiarPassword);

router.delete("/usuario/:id_usuario", verificarToken, deleteUsuario);
router.put("/usuario/:id_usuario", verificarToken, updateUsuario);

export default router;