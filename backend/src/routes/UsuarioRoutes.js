import express from 'express';
import { 
    procesarCheckout, 
    obtenerMisPedidos, 
    obtenerDetalleVenta,
    obtenerTodosLosPedidos, // <-- NUEVA
    actualizarEstadoPedido  // <-- NUEVA
} from '../controller/VentaController.js';
import { verificarToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// ── RUTAS DEL CLIENTE ──
router.post('/checkout', verificarToken, procesarCheckout);
router.get('/mis-pedidos', verificarToken, obtenerMisPedidos);
router.get('/mis-pedidos/:id/detalle', verificarToken, obtenerDetalleVenta);

// ── RUTAS DEL ADMINISTRADOR ──
router.get('/admin/pedidos', verificarToken, obtenerTodosLosPedidos);
router.patch('/admin/pedidos/:id/estado', verificarToken, actualizarEstadoPedido);

export default router;