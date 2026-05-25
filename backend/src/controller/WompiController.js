import crypto from 'crypto';

export const obtenerParametrosPago = async (req, res) => {
  try {
    const { id_venta, total } = req.body;
    
    // Wompi exige el monto en centavos y como un número entero (Ej: $25,000 COP -> 2500000)
    const montoCentavos = Math.round(total * 100);
    const moneda = 'COP';
    const referencia = `MIMOS-VENTA-${id_venta}-${Date.now()}`;
    
    // En producción, esto viene de tus variables de entorno (.env)
    const secretoIntegridad = process.env.WOMPI_INTEGRITY_SECRET || 'llave_secreta_prueba_mimos_123';
    
    // Algoritmo de Wompi: Cadena de integridad = referencia + monto_en_centavos + moneda + secreto
    const cadenaFirma = `${referencia}${montoCentavos}${moneda}${secretoIntegridad}`;
    
    // Cifrado SHA-256 Nativo de Node.js
    const firmaIntegridad = crypto
      .createHash('sha256')
      .update(cadenaFirma)
      .digest('hex');

    res.status(200).json({
      success: true,
      data: {
        publicKey: 'pub_test_Q567YuiOPlk890XFghJm', // Llave pública simulada
        referencia,
        montoCentavos,
        moneda,
        firmaIntegridad
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};