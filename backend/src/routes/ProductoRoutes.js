import express from 'express';
import {
    getProductos, getProductosAdmin, getProductoPorId,
    postProducto, putProducto,
    patchStock, patchDesactivar, patchActivar
} from '../controller/ProductoController.js';
import { verificarToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. Rutas específicas PRIMERO (Para evitar que el parámetro :id se las coma)
router.get('/producto/admin', verificarToken, getProductosAdmin);

// 2. Rutas generales DESPUÉS
router.get('/producto', getProductos);
router.get('/producto/:id', getProductoPorId);

// 3. Resto de rutas protegidas
router.post('/producto', verificarToken, postProducto);
router.put('/producto/:id', verificarToken, putProducto);
router.patch('/producto/:id/stock', verificarToken, patchStock);
router.patch('/producto/:id/desactivar', verificarToken, patchDesactivar);
router.patch('/producto/:id/activar', verificarToken, patchActivar);

export default router;