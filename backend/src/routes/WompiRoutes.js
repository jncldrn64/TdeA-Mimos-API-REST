import express from 'express';
import { obtenerParametrosPago } from '../controller/WompiController.js';
import { verificarToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Le quitamos el /wompi de aquí, porque ya se lo pusiste en el server.js
router.post('/parametros', verificarToken, obtenerParametrosPago);

export default router;