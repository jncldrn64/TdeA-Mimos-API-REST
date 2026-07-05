Write-Host "======================================================" -ForegroundColor Magenta
Write-Host " SCRIPT E2E DEFINITIVO: VALIDACION TOTAL Y DATOS SEMILLA" -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Magenta

# ---------------------------------------------------------
# FUNCION BASE DE COMUNICACION HTTP
# ---------------------------------------------------------
function Invoke-MimosApi {
    param([string]$Metodo, [string]$Endpoint, [string]$BodyJson)
    
    $url = "http://localhost:8081/api/$Endpoint"
    Write-Host "`n>>> [$Metodo] /$Endpoint" -ForegroundColor Cyan
    
    if ($BodyJson) {
        $tempFile = "$env:TEMP\mimos_payload.json"
        [System.IO.File]::WriteAllText($tempFile, $BodyJson)
        $resp = curl.exe -s -X $Metodo $url -H "Content-Type: application/json" -d "@$tempFile"
    } else {
        $resp = curl.exe -s -X $Metodo $url
    }

    if ([string]::IsNullOrWhiteSpace($resp)) {
        Write-Host "  [OK] Operacion exitosa (sin contenido de respuesta)." -ForegroundColor DarkGray
        return $null
    }

    try {
        $jsonObj = $resp | ConvertFrom-Json
        Write-Host ($jsonObj | ConvertTo-Json -Depth 5) -ForegroundColor DarkGreen
        
        if ($null -ne $jsonObj.status -and $null -ne $jsonObj.error) {
            Write-Host "  [!] ERROR HTTP $($jsonObj.status): $($jsonObj.message)" -ForegroundColor Red
        }
        return $jsonObj
    } catch {
        Write-Host "  [!] Respuesta recibida: $resp" -ForegroundColor Yellow
        return $null
    }
}

# =========================================================
# FASES 1-7: EL CICLO DE VIDA BASE (Ya lo validamos)
# =========================================================

Write-Host "`n--- CREANDO FLUJO BASE DE PRUEBA ---" -ForegroundColor DarkGray
$catData = @{ nombre = "Postres E2E"; descripcion = "Generado por Script E2E" }
$idCat = (Invoke-MimosApi "POST" "categorias" ($catData | ConvertTo-Json)).idCategoria

$prodData = @{ nombreProducto = "Helado Basico"; precioUnitario = 1000; stockDisponible = 50; idCategoria = $idCat }
$idProd = (Invoke-MimosApi "POST" "productos" ($prodData | ConvertTo-Json)).idProducto

$ventaData = @{ comprador = @{ idUsuario = 1 }; total = 2000; cedulaComprador = "111"; metodoPago = "Efectivo" }
$idVenta = (Invoke-MimosApi "POST" "ventas" ($ventaData | ConvertTo-Json -Depth 3)).id

$detData = @{ venta = @{ id = $idVenta }; producto = @{ idProducto = $idProd }; cantidad = 2; precioUnitario = 1000 }
Invoke-MimosApi "POST" "detalle-ventas" ($detData | ConvertTo-Json -Depth 3)

$envioData = @{ ventaId = $idVenta; direccion = "Test 123"; ciudad = "Medellin" }
$idEnvio = (Invoke-MimosApi "POST" "envios" ($envioData | ConvertTo-Json)).idEnvio

$pqrsData = @{ usuarioId = 1; ventaId = $idVenta; asunto = "Test"; mensaje = "Mensaje Test" }
$idPqrs = (Invoke-MimosApi "POST" "pqrs" ($pqrsData | ConvertTo-Json)).idPqrs

# =========================================================
# FASE 8: VALIDANDO LOS PUT (Lo que ya hicimos)
# =========================================================
Write-Host "`n======================================================" -ForegroundColor Magenta
Write-Host " FASE 8: VALIDANDO PUT (CATALOGOS)" -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Magenta

# 8.1 Actualizar la Categoria
Write-Host "`n[PASO 8.1] Actualizando Categoria $idCat..." -ForegroundColor Yellow
$catUpdateData = @{ nombre = "Postres E2E PREMIUM"; descripcion = "Descripcion actualizada" }
Invoke-MimosApi "PUT" "categorias/$idCat" ($catUpdateData | ConvertTo-Json)

# 8.2 Actualizar el Producto
Write-Host "`n[PASO 8.2] Actualizando Producto $idProd..." -ForegroundColor Yellow
$prodUpdateData = @{ nombreProducto = "Helado Premium Plus"; precioUnitario = 5000; stockDisponible = 10; idCategoria = $idCat }
Invoke-MimosApi "PUT" "productos/$idProd" ($prodUpdateData | ConvertTo-Json)

# =========================================================
# FASE 9: PREDICCION DE LO QUE HARA LA OTRA IA (NUEVO)
# =========================================================
Write-Host "`n======================================================" -ForegroundColor Magenta
Write-Host " FASE 9: VALIDANDO PATCH (ESTADOS DE TRANSACCION)" -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Magenta
Write-Host " NOTA: Estos fallaran con 404/405 hasta que la otra IA te de el codigo." -ForegroundColor DarkGray

# 9.1 Actualizar Estado del Envio (Prediciendo que usara PATCH o PUT con JSON plano)
Write-Host "`n[PASO 9.1] Intentando marcar el Envio $idEnvio como 'entregado'..." -ForegroundColor Yellow
$envioPatchData = @{ estadoEnvio = "entregado" }
# Usamos PUT como suposicion, pero quizas la IA decida usar PATCH
Invoke-MimosApi "PUT" "envios/$idEnvio/estado" ($envioPatchData | ConvertTo-Json)

# 9.2 Responder una PQRS
Write-Host "`n[PASO 9.2] Intentando responder y cerrar el PQRS $idPqrs..." -ForegroundColor Yellow
$pqrsPatchData = @{ respuesta = "Sentimos el inconveniente. Le enviamos un cupon."; estado = "cerrado" }
Invoke-MimosApi "PUT" "pqrs/$idPqrs/responder" ($pqrsPatchData | ConvertTo-Json)


# =========================================================
# FASE 10: DATOS QUEMADOS (SEED) PARA POSTMAN / FRONTEND
# =========================================================
Write-Host "`n======================================================" -ForegroundColor Magenta
Write-Host " FASE 10: INYECTANDO DATOS DE MUESTRA PARA POSTMAN" -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Magenta

# Preguntamos si quiere inyectar los datos (para no saturar la DB sin permiso)
$respuesta = Read-Host "¿Quieres inyectar categorias y productos de muestra para probar en Postman? (s/n)"

if ($respuesta -eq "s") {
    Write-Host "`nInyectando datos semilla..." -ForegroundColor Yellow
    
    # Categorias de Muestra
    $c1 = Invoke-MimosApi "POST" "categorias" (@{ nombre = "Bebidas Frias"; descripcion = "Gaseosas y Jugos" } | ConvertTo-Json)
    $c2 = Invoke-MimosApi "POST" "categorias" (@{ nombre = "Paletas"; descripcion = "Paletas de agua y leche" } | ConvertTo-Json)
    
    # Productos de Muestra usando los IDs generados arriba
    Invoke-MimosApi "POST" "productos" (@{ nombreProducto = "Gaseosa Cola 500ml"; precioUnitario = 3500; stockDisponible = 100; idCategoria = $c1.idCategoria } | ConvertTo-Json)
    Invoke-MimosApi "POST" "productos" (@{ nombreProducto = "Jugo de Naranja Natural"; precioUnitario = 4000; stockDisponible = 30; idCategoria = $c1.idCategoria } | ConvertTo-Json)
    Invoke-MimosApi "POST" "productos" (@{ nombreProducto = "Paleta de Mango Biche"; precioUnitario = 2500; stockDisponible = 200; idCategoria = $c2.idCategoria } | ConvertTo-Json)
    Invoke-MimosApi "POST" "productos" (@{ nombreProducto = "Paleta de Ron con Pasas"; precioUnitario = 3000; stockDisponible = 150; idCategoria = $c2.idCategoria } | ConvertTo-Json)

    Write-Host "`n[OK] Datos de muestra inyectados exitosamente. ¡Abre Postman y lanza un GET a /api/productos!" -ForegroundColor Green
} else {
    Write-Host "`n[SKIPPED] No se inyectaron datos adicionales." -ForegroundColor DarkGray
}

Write-Host "`n======================================================" -ForegroundColor Magenta
Write-Host " VALIDACION FINALIZADA" -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Magenta