import express from 'express';
import { obtenerCategorias } from '../controller/CategoriaController.js';

const router = express.Router();

// Esta ruta es pública, cualquiera puede ver los filtros del catálogo
router.get('/categorias', obtenerCategorias);

export default router;