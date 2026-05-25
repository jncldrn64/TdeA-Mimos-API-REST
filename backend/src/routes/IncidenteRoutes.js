import express from 'express';
import * as IncidenteController from '../controller/IncidenteController.js';
import { verificarToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rutas del Cliente
router.post('/incidentes', verificarToken, IncidenteController.crearTicket);
router.get('/incidentes/mis-tickets', verificarToken, IncidenteController.obtenerMisTickets);

// Rutas de Administración / Soporte
router.get('/incidentes/admin', verificarToken, IncidenteController.obtenerTodosTicketsAdmin);
router.patch('/incidentes/:id_incidente/estado', verificarToken, IncidenteController.actualizarTicket);

export default router;