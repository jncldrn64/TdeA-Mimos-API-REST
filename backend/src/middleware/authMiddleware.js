import jwt from 'jsonwebtoken';

export const verificarToken = (req, res, next) => {
  try {
    // 1. Extraer el token de la cabecera (Formato: "Bearer <token>")
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Acceso denegado. Token no proporcionado o formato inválido.' });
    }

    const token = authHeader.split(' ')[1];

    // 2. Verificar la validez del token con la clave secreta
    // (Asegúrate de que el nombre de la variable de entorno coincida con el que usas en el login, ej: JWT_SECRET)
    const secret = process.env.JWT_SECRET || 'tu_clave_secreta_aqui'; 
    const decoded = jwt.verify(token, secret);

    // 3. Inyectar los datos del usuario en la request para que los controladores puedan usarlos
    req.usuario = decoded;

    // 4. Dejar pasar la petición al controlador
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Token inválido o expirado.', error: error.message });
  }
};