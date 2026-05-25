import express from 'express';
import {
    getProductos, getProductosAdmin, getProductoPorId,
    postProducto, putProducto,
    patchStock, patchDesactivar, patchActivar
} from '../controller/ProductoController.js';
import { verificarToken } from '../middleware/authMiddleware.js'; // <-- IMPORTAMOS EL PORTERO

const router = express.Router();

// ── Rutas Públicas (Catálogo visible para todos) ──
router.get('/producto', getProductos);       // catálogo + ?buscar=término
router.get('/producto/:id', getProductoPorId);

// ── Rutas Protegidas (Gestión de Inventario) ──
router.get('/producto/admin', verificarToken, getProductosAdmin); // <-- Corregido: Ahora está protegida
router.post('/producto', verificarToken, postProducto);
router.put('/producto/:id', verificarToken, putProducto);
router.patch('/producto/:id/stock', verificarToken, patchStock);
router.patch('/producto/:id/desactivar', verificarToken, patchDesactivar);
router.patch('/producto/:id/activar', verificarToken, patchActivar);

export default router;