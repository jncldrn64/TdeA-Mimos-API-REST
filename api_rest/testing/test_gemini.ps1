Write-Host "======================================================" -ForegroundColor Magenta
Write-Host " SCRIPT INTELIGENTE E2E - CICLO DE VIDA COMPLETO" -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Magenta

# Funcion inteligente que interactua con la API y maneja los JSON sola
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
        # Imprime el JSON formateado bonito
        Write-Host ($jsonObj | ConvertTo-Json -Depth 5) -ForegroundColor DarkGreen
        
        # Si Spring Boot arroja un error controlado, lo detectamos
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
# EJECUCION DEL FLUJO DE NEGOCIO DINAMICO
# =========================================================

# 1. Crear una Categoria Nueva
Write-Host "`n[PASO 1] Creando una Categoria de catalogo..." -ForegroundColor Yellow
$catData = @{ nombre = "Postres Premium"; descripcion = "Generado por Script E2E" }
$cat = Invoke-MimosApi "POST" "categorias" ($catData | ConvertTo-Json)
$idCat = $cat.idCategoria

# 2. Crear un Producto asociado a esa nueva Categoria
Write-Host "`n[PASO 2] Creando un Producto en la Categoria $idCat..." -ForegroundColor Yellow
$prodData = @{ nombreProducto = "Torta de Chocolate E2E"; precioUnitario = 45000; stockDisponible = 5; idCategoria = $idCat }
$prod = Invoke-MimosApi "POST" "productos" ($prodData | ConvertTo-Json)
$idProd = $prod.idProducto

# 3. Crear una Venta Nueva (Asumiendo que el Usuario 1 existe)
Write-Host "`n[PASO 3] Creando una Factura nueva para el Usuario 1..." -ForegroundColor Yellow
$ventaData = @{ comprador = @{ idUsuario = 1 }; total = 90000; cedulaComprador = "987654321"; metodoPago = "Tarjeta" }
$venta = Invoke-MimosApi "POST" "ventas" ($ventaData | ConvertTo-Json -Depth 3)
$idVenta = $venta.id

# 4. Agregar Detalle a la Venta
Write-Host "`n[PASO 4] Agregando 2 Tortas a la Factura $idVenta..." -ForegroundColor Yellow
$detData = @{ venta = @{ id = $idVenta }; producto = @{ idProducto = $idProd }; cantidad = 2; precioUnitario = 45000 }
$detalle = Invoke-MimosApi "POST" "detalle-ventas" ($detData | ConvertTo-Json -Depth 3)

# 5. Despachar la Venta (Envio)
Write-Host "`n[PASO 5] Generando el Envio para la Factura $idVenta..." -ForegroundColor Yellow
$envioData = @{ ventaId = $idVenta; direccion = "Carrera 80 # 45-12"; ciudad = "Medellin" }
$envio = Invoke-MimosApi "POST" "envios" ($envioData | ConvertTo-Json)
$idEnvio = $envio.idEnvio

# 6. Registrar una PQRS sobre esa Venta
Write-Host "`n[PASO 6] El Usuario 1 abre un Reclamo (PQRS) sobre la Venta $idVenta..." -ForegroundColor Yellow
$pqrsData = @{ usuarioId = 1; ventaId = $idVenta; asunto = "Caja Danada"; mensaje = "La torta llego aplastada" }
$pqrs = Invoke-MimosApi "POST" "pqrs" ($pqrsData | ConvertTo-Json)
$idPqrs = $pqrs.idPqrs

# 7. Comprobacion Final de Lectura (GET)
Write-Host "`n[PASO 7] Verificando que la DB guardo todo..." -ForegroundColor Yellow
Invoke-MimosApi "GET" "envios/venta/$idVenta" ""
Invoke-MimosApi "GET" "pqrs/$idPqrs" ""

Write-Host "`n======================================================" -ForegroundColor Magenta
Write-Host " SIMULACION E2E COMPLETADA CON EXITO" -ForegroundColor Green
Write-Host " La base de datos MimosDemo ha procesado una compra real."
Write-Host "======================================================" -ForegroundColor Magenta