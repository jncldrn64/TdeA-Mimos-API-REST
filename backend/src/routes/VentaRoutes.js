import express from 'express';
import { procesarCheckout, obtenerMisPedidos, obtenerDetalleVenta } from '../controller/VentaController.js';
import { verificarToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Ruta para procesar el pago y crear el pedido
router.post('/checkout', verificarToken, procesarCheckout);

// Ruta para listar el historial general del cliente
router.get('/mis-pedidos', verificarToken, obtenerMisPedidos);

// Ruta para ver el desglose y recibo de un pedido específico
router.get('/mis-pedidos/:id/detalle', verificarToken, obtenerDetalleVenta);

export default router;