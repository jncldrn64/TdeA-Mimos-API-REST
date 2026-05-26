import express from 'express';
import { 
    procesarCheckout, 
    obtenerMisPedidos, 
    obtenerDetalleVenta,
    obtenerTodosLosPedidos,   // <-- Agregado
    actualizarEstadoPedido    // <-- Agregado
} from '../controller/VentaController.js';
import { verificarToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// ── Rutas Cliente ──
router.post('/checkout', verificarToken, procesarCheckout);
router.get('/mis-pedidos', verificarToken, obtenerMisPedidos);
router.get('/mis-pedidos/:id/detalle', verificarToken, obtenerDetalleVenta);

// ── Rutas Administrador ──
router.get('/admin/pedidos', verificarToken, obtenerTodosLosPedidos);
router.patch('/admin/pedidos/:id/estado', verificarToken, actualizarEstadoPedido);

export default router;