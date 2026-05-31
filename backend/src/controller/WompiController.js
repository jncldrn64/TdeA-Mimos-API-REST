import crypto from 'crypto';

export const obtenerParametrosPago = async (req, res) => {
  try {
    const { id_venta, total } = req.body;
    
    const montoCentavos = Math.round(total * 100);
    const moneda = 'COP';
    const referencia = `MIMOS-VENTA-${id_venta}-${Date.now()}`;
    const secretoIntegridad = process.env.WOMPI_INTEGRITY_SECRET || 'llave_secreta_prueba_mimos_123';
    const cadenaFirma = `${referencia}${montoCentavos}${moneda}${secretoIntegridad}`;
    
    const firmaIntegridad = crypto.createHash('sha256').update(cadenaFirma).digest('hex');

    // ── PSEUDO-ALGORITMO DE SIMULACIÓN BANCARIA ──
    // Tarjeta Visa de prueba (4242...) y un CVC aleatorio
    const tarjetaAprobada = `4242${Math.floor(100000000000 + Math.random() * 900000000000)}`;
    const cvcAprobado = Math.floor(100 + Math.random() * 900).toString();

    // Imprimimos la tarjeta en la consola del servidor (Para mostrarle al Jurado)
    console.log(`\n==============================================`);
    console.log(`💳 [SIMULACIÓN WOMPI] Pasarela Solicitada`);
    console.log(`Referencia: ${referencia}`);
    console.log(`Monto a cobrar: $${total} COP`);
    console.log(`----------------------------------------------`);
    console.log(`🔑 Usa estas credenciales para APROBAR el pago:`);
    console.log(`Tarjeta: ${tarjetaAprobada}`);
    console.log(`CVC: ${cvcAprobado}`);
    console.log(`Vencimiento: Cualquier fecha futura válida (Ej: 12/28)`);
    console.log(`==============================================\n`);

    res.status(200).json({
      success: true,
      data: {
        publicKey: 'pub_test_Q567YuiOPlk890XFghJm',
        referencia,
        montoCentavos,
        moneda,
        firmaIntegridad,
        tarjetaTest: tarjetaAprobada, // Se la enviamos oculta al frontend
        cvcTest: cvcAprobado
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};