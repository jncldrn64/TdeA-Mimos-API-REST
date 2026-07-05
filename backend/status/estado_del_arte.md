# Documento 8 — Guía Definitiva y Explícita: API REST Mimos (TdeA)

> Este documento es el relevo final del proyecto. Está escrito de forma deliberadamente redundante, excesivamente detallada, y sin omitir ningún dolor que vivimos en el camino. Si eres un humano o una IA leyendo esto por primera vez, aquí está todo lo que necesitas saber para entender qué construimos, por qué lo construimos, cómo probarlo, y qué salió mal en el proceso.

---

## 0. Por qué existe este proyecto (el panorama completo)

Mimos es una tienda de helados artesanales que tenía, y sigue teniendo en producción, una aplicación monolítica en Node.js. En esa arquitectura monolítica, el frontend (la interfaz que ve el usuario), el backend (la lógica de negocio) y la base de datos estaban todos entrelazados como cables sin etiquetar dentro de una caja. Si querías cambiar cómo se mostraba el precio en la pantalla, tenías que tocar los mismos archivos que también hablaban con la base de datos. Si querías conectar una app de Android, no había forma limpia de hacerlo.

El objetivo de este proyecto fue construir una **API REST** en Java 17 con Spring Boot 3, conectada a una base de datos SQL Server normalizada en 3FN (Tercera Forma Normal) llamada `MimosDemo`. Esta API actúa como un intermediario universal: cualquier cliente (una página web, una app móvil, Postman, un script PowerShell) puede hablarle a esta API usando el protocolo HTTP estándar, y la API se encarga de hablar con la base de datos, validar los datos, y devolver respuestas en formato JSON.

La base de datos de **producción (`InventarioDB`) jamás fue tocada**. Todo el desarrollo ocurrió contra `MimosDemo`, una base de datos demo limpia y normalizada, para no romper el negocio real mientras desarrollábamos.

---

## 1. Qué es una API y qué es una API REST (y por qué son cosas diferentes)

### API a secas

**API** significa *Application Programming Interface* (Interfaz de Programación de Aplicaciones). El término es enormemente genérico. Una API es cualquier mecanismo que permite que dos programas se comuniquen entre sí siguiendo un contrato definido. Por ejemplo:

- Cuando tu código llama a `Math.sqrt(4)` en Java, estás usando la API de la clase `Math`. No sabes cómo calcula la raíz cuadrada internamente; simplemente llamas al método y recibes el resultado.
- Cuando una librería de mapas te da una función `getLocation(city)` y tú la llamas, estás usando su API.
- Incluso la pantalla táctil de tu teléfono expone una API al sistema operativo para reportar los toques.

La palabra API, sola, no dice absolutamente nada sobre HTTP, JSON, internet, ni nada por el estilo. Solo dice que dos partes acordaron cómo hablarse.

### API REST

**REST** significa *Representational State Transfer* (Transferencia de Estado Representacional). Es un estilo arquitectónico definido por Roy Fielding en su tesis doctoral del año 2000, que describe cómo diseñar sistemas de comunicación sobre HTTP de forma predecible y escalable.

Una API REST es una API que usa HTTP como protocolo de comunicación y sigue ciertas convenciones:

- Cada recurso (un usuario, un producto, una venta) tiene una URL propia y única. Por ejemplo, el usuario con ID 5 siempre vive en `/api/usuarios/5`.
- Las operaciones se expresan mediante los verbos HTTP (GET, POST, PUT, DELETE), no metiendo el verbo en la URL. La URL mala sería `/api/obtenerUsuario?id=5`. La URL REST correcta es `GET /api/usuarios/5`.
- El servidor no guarda estado de la sesión del cliente entre peticiones. Cada petición es completamente independiente y debe traer toda la información que el servidor necesita para procesarla.
- Las respuestas se devuelven en un formato estándar. Nosotros usamos JSON (JavaScript Object Notation).

Entonces: **todas las APIs REST son APIs, pero no todas las APIs son REST**. Lo que construimos en este proyecto es específicamente una API REST que habla JSON sobre HTTP.

---

## 2. Por qué validar el backend ANTES de tocar el frontend (regla de oro)

Esto no es una preferencia estética. Es una regla de ingeniería con consecuencias directas.

Cuando conectas un frontend (JavaScript, React, Angular, lo que sea) a un backend sin haberlo validado antes de forma aislada, y algo falla, te encuentras ante un problema de diagnóstico imposible. El error puede estar en cualquiera de estas capas simultáneamente:

1. El código JavaScript del frontend (una URL mal escrita, un campo con nombre incorrecto).
2. La configuración de CORS (Cross-Origin Resource Sharing, que es el mecanismo del navegador que bloquea peticiones cruzadas entre dominios distintos).
3. El `@RestController` de Spring Boot (un endpoint mal mapeado, una anotación incorrecta).
4. El `@Service` de Spring Boot (lógica de negocio incorrecta, una validación fallida).
5. El `@Repository` (una consulta derivada mal nombrada que Hibernate no puede generar).
6. La base de datos misma (una restricción de llave foránea violada, un `DEFAULT` que no se asignó).

Si no sabes en cuál de esas seis capas está el problema, puedes pasar horas o días mirando el código equivocado.

Al validar cada endpoint manualmente con Postman o curl **antes** de escribir una sola línea de JavaScript, eliminamos por completo la incertidumbre. Si Postman recibe un código `201 Created` con el JSON correcto, sabemos con certeza absoluta que el backend y la base de datos son perfectos. Si luego el frontend falla, sabemos que la culpa es exclusiva del frontend. Esto se llama **aislamiento de capas** y es la razón por la que existe el testing.

---

## 3. Qué es HTTP y los métodos GET, POST, PUT, DELETE

HTTP (HyperText Transfer Protocol) es el protocolo de comunicación sobre el que vive la web. Cuando tu navegador carga una página, está haciendo una petición HTTP. Cuando el servidor responde, también lo hace con HTTP.

Una petición HTTP tiene tres componentes fundamentales:

### 3.1 La URL y el Path (el destinatario)

Es la dirección exacta del recurso. En nuestro proyecto:

```
http://localhost:8081/api/usuarios/5
```

- `http://` — el protocolo.
- `localhost` — la dirección del servidor (en nuestro caso, la propia máquina).
- `8081` — el puerto (cambiamos del 8080 al 8081 porque el legacy de Node.js ya ocupaba el 8080).
- `/api/usuarios/5` — la ruta. El `5` al final es un **Path Variable**: un valor dinámico incrustado en la URL que identifica de qué recurso específico estamos hablando.

### 3.2 Las cabeceras (Headers)

Los headers son metadatos que viajan junto a la petición HTTP, como las instrucciones impresas en el sobre de una carta. El contenido de la carta puede ser cualquier cosa; el sobre le dice al destinatario cómo interpretar lo que hay dentro.

El header más crítico que usamos en este proyecto es:

```
Content-Type: application/json
```

Este header le dice al servidor: "lo que te estoy enviando en el cuerpo de esta petición está en formato JSON, no en texto plano, no en XML, no en HTML". Sin este header, Spring Boot no sabe cómo leer el cuerpo y lanza un error de parseo.

En curl lo envías con la bandera `-H`:

```bash
curl -X POST http://localhost:8081/api/roles \
  -H "Content-Type: application/json" \
  -d '{"nombre": "VENDEDOR", "descripcion": "Vendedor externo"}'
```

En Postman lo configuras yendo a la pestaña "Headers" y añadiendo la clave `Content-Type` con el valor `application/json`. Postman también lo añade automáticamente cuando seleccionas "raw → JSON" en la pestaña Body.

### 3.3 El cuerpo (Body / Payload)

El cuerpo es la carga útil de la petición. Es el JSON con los datos que quieres enviar al servidor. Solo existe cuando hay datos para crear o modificar, es decir, en peticiones POST y PUT. Una petición GET no tiene cuerpo porque GET solo pide información; no envía nada que guardar.

**Diferencia clave entre leer de la ruta y leer del cuerpo:**

- **`@PathVariable`** → lees un valor de la URL. Úsalo cuando solo necesitas un identificador simple, como un ID para buscar o borrar. Ejemplo: `GET /api/usuarios/5` → el `5` es el PathVariable.
- **`@RequestBody`** → lees el JSON que viene en el cuerpo. Úsalo cuando necesitas recibir un objeto complejo con múltiples propiedades. Ejemplo: `POST /api/usuarios` con un JSON que incluye nombre, apellido, email y contraseña.

Ambos pueden convivir en el mismo endpoint, aunque es inusual. Un `PUT /api/productos/5` podría usar `@PathVariable Long id` para saber qué producto actualizar, y `@RequestBody` para recibir los nuevos datos.

---

## 4. Los métodos HTTP: GET, POST, PUT, DELETE — CRUD y por qué usamos (o no) cada uno

CRUD es el acrónimo de las cuatro operaciones básicas sobre datos persistentes:

| CRUD | HTTP en REST | Lo que significa |
|------|-------------|-----------------|
| Create (Crear) | POST | Insertar un nuevo registro |
| Read (Leer) | GET | Consultar uno o varios registros |
| Update (Actualizar) | PUT / PATCH | Modificar un registro existente |
| Delete (Eliminar) | DELETE | Borrar un registro |

### GET — Leer

El método más seguro de todos. Por definición, un GET nunca debe modificar nada en el servidor. Se usa para consultar. No tiene cuerpo. El navegador web hace GET cuando tú escribes una URL y presionas Enter.

En nuestro proyecto lo usamos extensivamente:

```bash
# Listar todos los productos
curl -X GET http://localhost:8081/api/productos

# Buscar un producto específico por ID
curl -X GET http://localhost:8081/api/productos/3

# Productos filtrados por categoría
curl -X GET http://localhost:8081/api/productos/categoria/1

# Solo productos activos (catálogo público)
curl -X GET http://localhost:8081/api/productos/activos
```

### POST — Crear

Se usa para insertar un nuevo registro en la base de datos. Requiere un Body con el JSON del nuevo recurso. En REST, si el recurso se crea exitosamente, el servidor devuelve el código HTTP `201 Created` (no el `200 OK` genérico).

```bash
# Crear un nuevo rol
curl -X POST http://localhost:8081/api/roles \
  -H "Content-Type: application/json" \
  -d '{"nombre": "VENDEDOR", "descripcion": "Vendedor externo"}'
```

### DELETE — Eliminar

Destruye un registro. El ID del recurso a eliminar va en la URL (PathVariable). Si la operación es exitosa y no hay nada que devolver, el servidor responde con `204 No Content`.

```bash
# Eliminar el rol con ID 3
curl -X DELETE http://localhost:8081/api/roles/3
```

### PUT / PATCH — Actualizar (el ausente intencional del proyecto)

PUT reemplaza el recurso completo. PATCH modifica solo los campos indicados. Y aquí viene la parte incómoda: **en este proyecto prácticamente no usamos PUT**.

¿Por qué? No fue un olvido ni una limitación técnica. Fue una decisión de diseño consciente con raíces en auditoría y seguridad.

En un sistema transaccional comercial como una tienda de helados, la mayoría de los registros son históricos. Una `Venta` registra lo que pasó en un momento dado: quién compró, qué compró, cuánto pagó. Si permites hacer PUT a una Venta para cambiar el total, estás abriendo la puerta a que alguien modifique registros financieros pasados. Eso no está bien ni técnica ni contablemente.

La filosofía que adoptamos fue: los registros de negocio no se modifican; si algo estuvo mal, se anula y se crea uno correcto. Las únicas entidades que genuinamente necesitarían PUT son aquellas cuyos campos cambian de estado a lo largo del tiempo por diseño, como `Envio` (el estado del envío cambia de "preparando" a "despachado" a "entregado") y `PQRS` (el admin eventualmente responde la queja). Estos endpoints PUT quedaron identificados como trabajo futuro en el documento de estado 8.

Técnicamente, esto deja el CRUD incompleto (nos falta la U de Update). Es correcto. Una API REST bien diseñada no tiene que exponer los cuatro verbos para todas las entidades. Expone exactamente los que tienen sentido para el negocio.

---

## 5. Los códigos de respuesta HTTP (qué significa cada número)

Cuando el servidor procesa tu petición, siempre devuelve un código numérico de tres dígitos que indica el resultado. Los más relevantes en nuestro proyecto:

| Código | Nombre | Cuándo lo usamos |
|--------|--------|-----------------|
| 200 | OK | GET exitoso. Los datos solicitados vienen en el cuerpo de la respuesta. |
| 201 | Created | POST exitoso. El recurso fue creado. El nuevo objeto viene en el cuerpo. |
| 204 | No Content | DELETE exitoso. No hay nada que devolver. |
| 400 | Bad Request | La petición está malformada o viola una regla de negocio (ej. email ya existe, venta no encontrada al crear envío). |
| 404 | Not Found | El recurso con ese ID no existe en la base de datos. |
| 500 | Internal Server Error | Algo explotó en el servidor. Revisa la consola de Spring Boot para el stack trace. |

---

## 6. Cómo usar curl y Postman para validar cada endpoint

La API corre en `http://localhost:8081`. Todos los endpoints tienen el prefijo `/api/`.

> **Nota crítica sobre curl en Windows / PowerShell:** PowerShell intercepta la palabra `curl` y la redirige a su propio comando `Invoke-WebRequest`, que funciona completamente diferente. Siempre usa `curl.exe` (con la extensión explícita) para asegurarte de usar el curl real. Además, PowerShell destruye los JSON cuando intentas pasarlos inline con comillas. La solución validada en este proyecto se detalla en la sección 8.

---

### 6.1 Roles (`/api/roles`)

#### GET — Listar todos los roles

```bash
curl -X GET http://localhost:8081/api/roles
```

En Postman: método GET, URL `http://localhost:8081/api/roles`, clic en Send. Recibes un array JSON con todos los roles.

**Respuesta esperada (ejemplo):**
```json
[
  { "idRol": 1, "nombre": "ADMIN", "descripcion": "Administrador del sistema" },
  { "idRol": 2, "nombre": "CLIENTE", "descripcion": "Cliente registrado" }
]
```

#### GET — Buscar rol por ID

```bash
curl -X GET http://localhost:8081/api/roles/1
```

En Postman: método GET, URL `http://localhost:8081/api/roles/1`. Si el ID no existe, recibes `404 Not Found`.

#### POST — Crear un nuevo rol

**Con curl en Linux/Mac (comillas simples funcionan):**
```bash
curl -X POST http://localhost:8081/api/roles \
  -H "Content-Type: application/json" \
  -d '{"nombre": "VENDEDOR", "descripcion": "Vendedor externo"}'
```

**Con curl.exe en Windows PowerShell (método validado con archivo temporal):**
```powershell
[System.IO.File]::WriteAllText("$env:TEMP\rol.json", '{"nombre": "VENDEDOR", "descripcion": "Vendedor externo"}')
curl.exe -X POST http://localhost:8081/api/roles -H "Content-Type: application/json" -d "@$env:TEMP\rol.json"
```

**En Postman:**
1. Método: POST
2. URL: `http://localhost:8081/api/roles`
3. Pestaña Body → raw → JSON
4. Escribe:
```json
{
  "nombre": "VENDEDOR",
  "descripcion": "Vendedor externo"
}
```
5. Clic en Send. Recibes `201 Created` con el objeto creado.

#### DELETE — Eliminar un rol

```bash
curl -X DELETE http://localhost:8081/api/roles/3
```

En Postman: método DELETE, URL `http://localhost:8081/api/roles/3`. Recibes `204 No Content`.

---

### 6.2 Usuarios (`/api/usuarios`)

#### GET — Listar todos

```bash
curl -X GET http://localhost:8081/api/usuarios
```

**Importante:** La respuesta NUNCA incluye `password_hash`. El campo no existe en el `UsuarioDTO`. Esto es intencional y es una de las razones por las que usamos DTOs.

#### GET — Buscar por ID

```bash
curl -X GET http://localhost:8081/api/usuarios/1
```

#### POST — Crear usuario

**En Postman (Body → raw → JSON):**
```json
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan@mimos.co",
  "password": "miClave123",
  "idRol": 2
}
```

**Con curl.exe en PowerShell:**
```powershell
[System.IO.File]::WriteAllText("$env:TEMP\usuario.json", '{"nombre":"Juan","apellido":"Perez","email":"juan@mimos.co","password":"miClave123","idRol":2}')
curl.exe -X POST http://localhost:8081/api/usuarios -H "Content-Type: application/json" -d "@$env:TEMP\usuario.json"
```

La contraseña se encripta con BCrypt antes de guardarse. Si el email ya existe, recibes `400 Bad Request` con un mensaje de error descriptivo.

#### DELETE — Eliminar usuario

```bash
curl -X DELETE http://localhost:8081/api/usuarios/3
```

---

### 6.3 Categorías (`/api/categorias`)

#### GET — Listar todas

```bash
curl -X GET http://localhost:8081/api/categorias
```

#### GET — Buscar por ID

```bash
curl -X GET http://localhost:8081/api/categorias/1
```

#### POST — Crear categoría

**En Postman:**
```json
{
  "nombre": "Sorbetes",
  "descripcion": "Sorbetes de frutas naturales"
}
```

**Con curl.exe en PowerShell:**
```powershell
[System.IO.File]::WriteAllText("$env:TEMP\categoria.json", '{"nombre":"Sorbetes","descripcion":"Sorbetes de frutas naturales"}')
curl.exe -X POST http://localhost:8081/api/categorias -H "Content-Type: application/json" -d "@$env:TEMP\categoria.json"
```

#### DELETE — Eliminar categoría

```bash
curl -X DELETE http://localhost:8081/api/categorias/4
```

---

### 6.4 Productos (`/api/productos`)

Este controlador tiene el mayor número de endpoints de lectura especializada.

#### GET — Todos los productos (admin)

```bash
curl -X GET http://localhost:8081/api/productos
```

#### GET — Solo productos activos (catálogo público)

```bash
curl -X GET http://localhost:8081/api/productos/activos
```

Devuelve solo los productos donde `esta_activo = 1` en la base de datos. Es el endpoint que usaría el frontend público de la tienda.

#### GET — Productos por categoría

```bash
curl -X GET http://localhost:8081/api/productos/categoria/1
```

#### GET — Buscar producto por ID

```bash
curl -X GET http://localhost:8081/api/productos/5
```

#### POST — Crear producto

**En Postman:**
```json
{
  "nombreProducto": "Helado de fresa",
  "descripcionDetallada": "Helado artesanal con fresas frescas del Valle",
  "precioUnitario": 8500.00,
  "stockDisponible": 50,
  "urlImagen": "https://mimos.co/img/fresa.jpg",
  "idCategoria": 1,
  "fechaUltimoRestock": null
}
```

**Con curl.exe en PowerShell:**
```powershell
[System.IO.File]::WriteAllText("$env:TEMP\producto.json", '{"nombreProducto":"Helado de fresa","precioUnitario":8500.00,"stockDisponible":50,"idCategoria":1}')
curl.exe -X POST http://localhost:8081/api/productos -H "Content-Type: application/json" -d "@$env:TEMP\producto.json"
```

**Nota sobre el bug histórico:** En algún punto del desarrollo, una discrepancia entre lo que el DTO esperaba (`"idCategoria": 1` plano) y lo que el script de prueba enviaba (`"categoria": {"idCategoria": 1}` anidado) resultó en que la categoría se guardaba como `null` en la base de datos. Esto se corrigió alineando el JSON al formato flat del DTO. Si ves que los productos tienen categoría `null`, revisa que estés enviando `"idCategoria"` como campo directo en el JSON, no dentro de un objeto anidado.

#### DELETE — Eliminar producto

```bash
curl -X DELETE http://localhost:8081/api/productos/5
```

---

### 6.5 Carrito (`/api/carritos`) y CarritoItem (`/api/carrito-items`)

El carrito se crea por usuario; los ítems son los productos dentro de ese carrito.

#### GET — Listar todos los carritos

```bash
curl -X GET http://localhost:8081/api/carritos
```

#### GET — Buscar carrito por ID

```bash
curl -X GET http://localhost:8081/api/carritos/1
```

#### POST — Crear carrito (para un usuario)

**En Postman:**
```json
{
  "usuario": { "idUsuario": 1 }
}
```

**Con curl.exe en PowerShell:**
```powershell
[System.IO.File]::WriteAllText("$env:TEMP\carrito.json", '{"usuario":{"idUsuario":1}}')
curl.exe -X POST http://localhost:8081/api/carritos -H "Content-Type: application/json" -d "@$env:TEMP\carrito.json"
```

#### DELETE — Eliminar carrito

```bash
curl -X DELETE http://localhost:8081/api/carritos/1
```

#### GET — Items de un carrito específico

```bash
curl -X GET http://localhost:8081/api/carrito-items/carrito/1
```

#### POST — Agregar item al carrito

**En Postman:**
```json
{
  "carrito": { "idCarrito": 1 },
  "producto": { "idProducto": 2 },
  "cantidad": 3,
  "precioSnapshot": 8500.00
}
```

**Con curl.exe en PowerShell:**
```powershell
[System.IO.File]::WriteAllText("$env:TEMP\item.json", '{"carrito":{"idCarrito":1},"producto":{"idProducto":2},"cantidad":3,"precioSnapshot":8500.00}')
curl.exe -X POST http://localhost:8081/api/carrito-items -H "Content-Type: application/json" -d "@$env:TEMP\item.json"
```

Si el `idProducto` no existe en la base de datos, la base de datos lanzará una violación de llave foránea (`SQL Error: 547`) que Spring Boot captura y devuelve como error.

#### DELETE — Eliminar item del carrito

```bash
curl -X DELETE http://localhost:8081/api/carrito-items/1
```

---

### 6.6 Ventas (`/api/ventas`) y DetalleVenta (`/api/detalle-ventas`)

#### GET — Listar todas las ventas

```bash
curl -X GET http://localhost:8081/api/ventas
```

#### GET — Buscar venta por ID

```bash
curl -X GET http://localhost:8081/api/ventas/1
```

#### POST — Crear una venta

**En Postman:**
```json
{
  "comprador": { "idUsuario": 1 },
  "procesadoPor": null,
  "total": 45000.00,
  "cedulaComprador": "123456789",
  "metodoPago": "Tarjeta",
  "referenciaPago": null
}
```

**Con curl.exe en PowerShell:**
```powershell
[System.IO.File]::WriteAllText("$env:TEMP\venta.json", '{"comprador":{"idUsuario":1},"procesadoPor":null,"total":45000.00,"cedulaComprador":"123456789","metodoPago":"Tarjeta"}')
curl.exe -X POST http://localhost:8081/api/ventas -H "Content-Type: application/json" -d "@$env:TEMP\venta.json"
```

Los campos `fecha` y `estado` aparecerán como `null` en la respuesta del POST. Esto es comportamiento esperado y correcto: la base de datos los asigna con `DEFAULT GETDATE()` y `DEFAULT 'pendiente'`, pero Hibernate no re-lee la fila inmediatamente después del INSERT. Si haces un GET posterior, verás los valores reales.

#### GET — Detalles de una venta

```bash
curl -X GET http://localhost:8081/api/detalle-ventas/venta/1
```

#### POST — Agregar detalle a una venta

**En Postman:**
```json
{
  "venta": { "id": 1 },
  "producto": { "idProducto": 2 },
  "cantidad": 2,
  "precioUnitario": 8500.00
}
```

**Con curl.exe en PowerShell:**
```powershell
[System.IO.File]::WriteAllText("$env:TEMP\detalle.json", '{"venta":{"id":1},"producto":{"idProducto":2},"cantidad":2,"precioUnitario":8500.00}')
curl.exe -X POST http://localhost:8081/api/detalle-ventas -H "Content-Type: application/json" -d "@$env:TEMP\detalle.json"
```

---

### 6.7 Envíos (`/api/envios`)

#### GET — Listar todos los envíos

```bash
curl -X GET http://localhost:8081/api/envios
```

#### GET — Buscar envío por ID

```bash
curl -X GET http://localhost:8081/api/envios/1
```

#### GET — Envío de una venta específica

```bash
curl -X GET http://localhost:8081/api/envios/venta/1
```

#### GET — Envíos por estado

```bash
# Estados posibles: preparando, despachado, entregado
curl -X GET http://localhost:8081/api/envios/estado/preparando
```

#### POST — Crear envío

**En Postman:**
```json
{
  "ventaId": 1,
  "direccion": "Calle 50 # 10-20, Barrio Laureles",
  "ciudad": "Medellín",
  "fechaEntregaEstimada": null
}
```

**Con curl.exe en PowerShell:**
```powershell
[System.IO.File]::WriteAllText("$env:TEMP\envio.json", '{"ventaId":1,"direccion":"Calle 50 # 10-20","ciudad":"Medellin","fechaEntregaEstimada":null}')
curl.exe -X POST http://localhost:8081/api/envios -H "Content-Type: application/json" -d "@$env:TEMP\envio.json"
```

**Nota:** Si la venta ya tiene un envío asociado, el servidor devuelve `400 Bad Request` con un mensaje explicativo. Esto es validación de negocio, no un bug.

#### DELETE — Eliminar envío

```bash
curl -X DELETE http://localhost:8081/api/envios/1
```

---

### 6.8 PQRS — Peticiones, Quejas, Reclamos y Sugerencias (`/api/pqrs`)

#### GET — Listar todas las PQRS

```bash
curl -X GET http://localhost:8081/api/pqrs
```

#### GET — Buscar PQRS por ID

```bash
curl -X GET http://localhost:8081/api/pqrs/1
```

#### GET — PQRS de un usuario

```bash
curl -X GET http://localhost:8081/api/pqrs/usuario/1
```

#### GET — PQRS por estado

```bash
# Estados posibles: abierto, cerrado
curl -X GET http://localhost:8081/api/pqrs/estado/abierto
```

#### GET — PQRS asociadas a una venta

```bash
curl -X GET http://localhost:8081/api/pqrs/venta/1
```

#### POST — Crear PQRS (con venta asociada)

**En Postman:**
```json
{
  "usuarioId": 1,
  "ventaId": 1,
  "asunto": "Helado llegó derretido",
  "mensaje": "El pedido llegó completamente derretido. Solicito reposición."
}
```

#### POST — Crear PQRS (sin venta, queja general)

**En Postman:**
```json
{
  "usuarioId": 1,
  "ventaId": null,
  "asunto": "Consulta sobre productos",
  "mensaje": "¿Tienen opciones sin azúcar?"
}
```

**Con curl.exe en PowerShell:**
```powershell
[System.IO.File]::WriteAllText("$env:TEMP\pqrs.json", '{"usuarioId":1,"ventaId":1,"asunto":"Helado llegado derretido","mensaje":"Solicito reposicion del pedido"}')
curl.exe -X POST http://localhost:8081/api/pqrs -H "Content-Type: application/json" -d "@$env:TEMP\pqrs.json"
```

#### DELETE — Eliminar PQRS

```bash
curl -X DELETE http://localhost:8081/api/pqrs/1
```

---

## 7. Las anotaciones de Spring Boot en los Controllers: qué hace cada una

En Java, las anotaciones (las palabras que empiezan con `@`) son instrucciones que le damos al framework en tiempo de compilación o de ejecución. Spring Boot usa extensivamente anotaciones para saber qué hace cada clase y método.

### `@RestController`

Le dice a Spring que esta clase es un controlador web y que todos sus métodos deben devolver sus valores directamente como respuesta HTTP, serializados automáticamente a JSON. Es la combinación de `@Controller` (que registra la clase como componente web) y `@ResponseBody` (que convierte los objetos Java a JSON automáticamente usando Jackson, la librería de serialización incluida en Spring Boot).

Sin `@RestController`, Spring no expone ningún endpoint de esa clase al mundo. Literalmente no existe para HTTP.

### `@RequestMapping("/api/roles")`

Define la URL base para todos los endpoints de la clase. Todos los métodos dentro de un controlador anotado con `@RequestMapping("/api/roles")` tendrán URLs que empiezan con `/api/roles`. Es el prefijo común de la familia de endpoints.

### `@GetMapping`, `@PostMapping`, `@DeleteMapping`, `@PutMapping`

Cada una de estas anotaciones mapea un verbo HTTP específico a un método Java específico. Cuando Spring Boot recibe una petición HTTP, revisa el verbo (GET, POST, etc.) y la URL, y dirige la petición al método Java que tenga la combinación correcta de `@RequestMapping` + `@GetMapping/PostMapping/etc.`.

```java
@GetMapping("/activos")   // → GET /api/productos/activos
@PostMapping              // → POST /api/productos
@DeleteMapping("/{id}")   // → DELETE /api/productos/5
```

Durante el desarrollo cometimos el error de escribir `@getMapping` en minúscula. Java es sensible a mayúsculas y minúsculas (case-sensitive). La anotación correcta es `@GetMapping` con G mayúscula. El resultado fue un error de compilación que generó siete mensajes de error encadenados (`cannot find symbol`) que durante unos minutos fueron confusos porque ninguno decía explícitamente "la anotación está en minúscula".

### `@PathVariable`

Extrae un fragmento de la URL y lo inyecta como parámetro del método. El fragmento se marca en la URL con llaves:

```java
@GetMapping("/{id}")
public ResponseEntity<RolDTO> buscarPorId(@PathVariable Long id) { ... }
```

Cuando alguien llama a `GET /api/roles/5`, Spring extrae el `5` de la URL y lo convierte a `Long`, pasándolo al parámetro `id`.

### `@RequestBody`

Lee el JSON que viene en el cuerpo de la petición HTTP y lo convierte (deserializa) automáticamente a un objeto Java. Jackson (la librería de serialización incluida) hace la conversión automáticamente, emparejando los campos del JSON con las propiedades del objeto Java por nombre.

```java
@PostMapping
public ResponseEntity<RolDTO> crear(@RequestBody Rol rol) { ... }
```

### `@RequiredArgsConstructor` (de Lombok)

Lombok es una librería que genera código repetitivo automáticamente en tiempo de compilación. `@RequiredArgsConstructor` genera un constructor con todos los campos declarados como `final`. Esto activa la **inyección de dependencias por constructor**, que es la forma recomendada en Spring Boot moderno para inyectar dependencias.

```java
@RequiredArgsConstructor
public class RolController {
    private final RolService rolService; // Spring inyecta esto automáticamente
}
```

Sin esta anotación (o sin `@Autowired`), `rolService` sería `null` y el servidor explotaría con un `NullPointerException` en el primer request.

### `ResponseEntity<T>`

Es el objeto que devuelven todos nuestros métodos de controlador. `ResponseEntity` encapsula tres cosas: el cuerpo de la respuesta (el JSON), el código HTTP (200, 201, 404, etc.) y los headers de respuesta. Usando `ResponseEntity` podemos controlar exactamente qué código HTTP devolvemos en cada situación:

```java
ResponseEntity.ok(objeto)              // 200 OK con el objeto
ResponseEntity.status(HttpStatus.CREATED).body(objeto)  // 201 Created
ResponseEntity.notFound().build()      // 404 Not Found sin cuerpo
ResponseEntity.noContent().build()     // 204 No Content
ResponseEntity.badRequest().body(msg)  // 400 Bad Request con mensaje
```

---

## 8. El diseño de la base de datos: por qué existen las tablas intermedias (relaciones N:M)

La base de datos `MimosDemo` tiene 10 tablas. No todas representan entidades del negocio directamente. Dos de ellas, `CarritoItem` y `DetalleVenta`, son lo que en modelado de datos se llama **tablas de unión** o **tablas intermedias**, y existen por una razón matemática y una razón de integridad histórica.

### La razón matemática: relaciones N:M

Una relación **N:M** (o muchos a muchos) existe cuando un registro de la tabla A puede relacionarse con muchos registros de la tabla B, y viceversa.

**Ejemplo con el carrito:**

Un carrito puede contener muchos productos (la persona puede añadir helado de fresa, helado de vainilla y una torta). Y un producto puede estar en los carritos de muchas personas diferentes (el helado de fresa puede estar en el carrito de Juan, de María y de Pedro).

¿Cómo representas eso en SQL? No puedes poner una columna `id_producto` en la tabla `Carrito` porque solo cabría un producto. No puedes poner una columna `id_carrito` en `Productos` porque un producto puede estar en miles de carritos.

La solución es una **tabla intermedia** (`CarritoItem`) que tiene una fila por cada par (carrito, producto):

```
id_carrito=1, id_producto=2, cantidad=3, precio_snapshot=8500.00
id_carrito=1, id_producto=5, cantidad=1, precio_snapshot=12000.00
id_carrito=2, id_producto=2, cantidad=2, precio_snapshot=8500.00
```

Así, el carrito 1 tiene dos productos, y el producto 2 aparece en dos carritos. La relación N:M se resuelve a través de dos relaciones 1:N (un carrito tiene muchos items; un producto aparece en muchos items).

Lo mismo aplica para `DetalleVenta`: una venta tiene muchos productos comprados, y un producto puede aparecer en muchas ventas.

### La razón de integridad histórica: el precio congelado

Hay una segunda razón, igual de importante, para que `CarritoItem` tenga el campo `precio_snapshot` y `DetalleVenta` tenga `precio_unitario`.

Supón que hoy el helado de fresa cuesta $8,500. Juan lo compra. Lo registramos con `precio_unitario = 8500`. Mañana, el precio sube a $10,000. ¿Qué debería mostrar la factura de Juan del día de ayer?

Si la factura apuntara directamente al precio actual del producto (haciendo JOIN con la tabla `Productos`), mostraría $10,000. Eso es un fraude contable. Juan pagó $8,500 y su recibo siempre debe decir $8,500.

Al guardar el precio en la tabla intermedia en el momento exacto de la transacción, **congelamos la realidad en el tiempo**. El precio en `DetalleVenta` y `CarritoItem` no cambia aunque el precio del producto en la tabla `Productos` cambie mañana, el año que viene, o nunca.

### La relación entre todas las tablas

```
Roles ──────────────────< Usuarios
                               │
              ┌────────────────┼────────────────┐
              │                │                │
           Carrito           Ventas            PQRS
              │                │                │
         CarritoItem       DetalleVenta         │
              │                │                │
              └────────┬───────┘                │
                       │                        │
                   Productos >─── Categorias    │
                                                │
                               Ventas ──────────┘
                                  │
                               Envios
```

---

## 9. Los problemas que vivimos: la bitácora completa de errores

Este proyecto tuvo una particularidad inusual: múltiples IAs trabajaron en paralelo, con diferentes conversaciones tomando diferentes entidades, y los estados se pasaban mediante documentos de relevo. Esto generó tanto problemas de coordinación como problemas técnicos acumulados. Aquí están todos, sin omitir ninguno.

### Error 1: Colisión de puerto 8080

El primer intento de arrancar Spring Boot falló con `Port 8080 was already in use`. La aplicación legacy de Node.js ya ocupaba el puerto 8080. Solución: `server.port=8081` en `application.properties`.

### Error 2: El laberinto de red Podman + VM Windows

La base de datos SQL Server vivía en un contenedor Podman en un host Linux con IP `10.10.1.1`. El código se desarrollaba en una Máquina Virtual Windows. Cuando la VM intentaba conectarse a la base de datos usando `localhost` o `127.0.0.1`, la conexión fallaba con `Connection refused` porque esas direcciones apuntaban dentro de la VM, no al host. Solución: configurar la URL JDBC explícitamente con la IP del host Podman:

```properties
spring.datasource.url=jdbc:sqlserver://10.10.1.1:1433;databaseName=MimosDemo;encrypt=false
```

### Error 3: `Schema-validation: missing table`

Hibernate, por defecto, asume que los nombres de las tablas están en minúscula y busca en el esquema por defecto del usuario de la base de datos, que puede no ser `dbo`. Nuestra tabla se llama `Roles` (con R mayúscula), y Hibernate buscaba `roles`. Solución: configurar la estrategia de nomenclatura física y el esquema por defecto en `application.properties`:

```properties
spring.jpa.hibernate.naming.physical-strategy=org.hibernate.boot.model.naming.PhysicalNamingStrategyStandardImpl
spring.jpa.properties.hibernate.default_schema=dbo
```

### Error 4: El falso `curl` de PowerShell

PowerShell tiene un alias llamado `curl` que en realidad ejecuta `Invoke-WebRequest`, el comando nativo de PowerShell. `Invoke-WebRequest` funciona completamente diferente al curl real: tiene flags distintos, parsea los argumentos diferente, y no acepta el `-d` de la misma manera. Cualquier comando curl que escribiéramos fallaba de formas inexplicables hasta que descubrimos el alias. Solución: siempre usar `curl.exe` (con la extensión) para forzar el uso del ejecutable real.

### Error 5: PowerShell destruye los JSON (la crisis de las comillas)

Este fue el problema más persistente del proyecto y el que más tiempo nos costó. Cuando intentábamos enviar un JSON en el cuerpo de una petición POST usando curl.exe con comillas:

```powershell
curl.exe -X POST ... -d '{"nombre": "VENDEDOR"}'
```

PowerShell interpretaba las comillas simples y dobles de forma diferente a bash, destruyendo el JSON antes de pasárselo a curl. El servidor recibía texto corrupto y respondía con `400 Bad Request: JSON parse error: Unexpected character '' (code 92)`.

Intentamos variables:

```powershell
$body = '{"nombre": "VENDEDOR"}'
curl.exe -X POST ... -d $body
```

También fallaba. PowerShell expandía el contenido de `$body` y corrompía los caracteres.

**La solución definitiva**, validada y usada en todo el proyecto a partir del status update 4:

```powershell
[System.IO.File]::WriteAllText("$env:TEMP\payload.json", '{"nombre": "VENDEDOR"}')
curl.exe -X POST http://localhost:8081/api/roles -H "Content-Type: application/json" -d "@$env:TEMP\payload.json"
```

Esto escribe el JSON en un archivo en el disco con codificación UTF-8 sin BOM, y le dice a curl que lea el body desde ese archivo (el `@` antes de la ruta es la sintaxis de curl para "lee el body desde este archivo"). PowerShell no puede corromper lo que ya está en el disco.

### Error 6: `package ...bcrypt does not exist` al compilar

Al implementar la entidad `Usuario`, decidimos encriptar las contraseñas con BCrypt antes de guardarlas en la base de datos. BCrypt está en la librería `spring-security-crypto`. Pero esta dependencia no estaba en el `pom.xml`. Solución: agregarla al `pom.xml` y ejecutar `.\\mvnw dependency:resolve` para que Maven la descargara.

### Error 7: Archivo con nombre incorrecto → `cannot find symbol` en cascada

Al crear `CrearProductoDTO.java`, el archivo fue guardado accidentalmente con el nombre `GenerarProductoDTO.java`. En Java, el nombre del archivo público debe coincidir exactamente con el nombre de la clase pública que contiene. El compilador lanzó el error `class CrearProductoDTO should be declared in a file named CrearProductoDTO.java`. Hasta aquí, el error era claro.

El problema fue que el error cascadeó: Lombok dejó de procesar las entidades que dependían del DTO mal nombrado, y el compilador comenzó a lanzar `cannot find symbol: method getNombre()` en múltiples Services, porque los getters que Lombok debía generar no existían. Parecía que todos los Services estaban rotos. Solución: renombrar el archivo y ejecutar `.\\mvnw clean spring-boot:run` para limpiar el directorio `target/` y recompilar desde cero.

### Error 8: `Out-File: utf8NoBOM not valid`

PowerShell 5.x (la versión que viene preinstalada en Windows 10/11) no soporta el parámetro `-Encoding utf8NoBOM` en el cmdlet `Out-File`. Este parámetro solo existe en PowerShell 7+. Cada vez que intentábamos guardar el JSON en un archivo con `Out-File`, el comando fallaba. Solución: usar `[System.IO.File]::WriteAllText()` que es una llamada directa al .NET Framework subyacente y funciona en cualquier versión de PowerShell y Windows, escribiendo UTF-8 sin BOM correctamente.

### Error 9: El bug de la categoría nula en Producto

Este fue el bug más sutil del proyecto y el que atravesó más estados de relevo sin resolverse del todo. Al hacer POST para crear un producto, la categoría aparecía como `null` en la respuesta y los endpoints de filtrado por categoría devolvían arrays vacíos `[]`.

**Causa raíz:** Hubo una discrepancia entre el DTO y los JSON de prueba. La IA que implementó `CrearProductoDTO` lo diseñó esperando un campo plano `"idCategoria": 1`. Pero algunos scripts de prueba enviaban la estructura anidada `"categoria": {"idCategoria": 1}`. Spring Boot, al no encontrar el campo `idCategoria` en el nivel raíz del JSON (sino dentro de un objeto anidado `categoria`), lo dejaba en `null`. La base de datos guardaba el producto sin categoría.

**Solución:** Asegurarse de que el JSON del POST coincida exactamente con la estructura del DTO:

```json
{
  "nombreProducto": "Helado de fresa",
  "precioUnitario": 8500.00,
  "idCategoria": 1
}
```

Y NO esto:
```json
{
  "nombreProducto": "Helado de fresa",
  "precioUnitario": 8500.00,
  "categoria": { "idCategoria": 1 }
}
```

### Error 10: El "falso" error 400 del Envío (que no era un error)

Al intentar crear un segundo envío para la Venta 1, el servidor devolvió `400 Bad Request`. Inmediatamente asumimos que era un bug. Resultó ser la validación de negocio correcta funcionando perfectamente: la Venta 1 ya tenía un envío despachado, y el `EnvioService` tenía lógica explícita para impedir crear envíos duplicados para la misma venta. El servidor devolvió un mensaje de error descriptivo explicando exactamente eso. No era un bug; era el sistema protegiéndose de inconsistencias de datos.

### Error 11: NetBeans y la variable `${start-class}`

Intentar ejecutar el proyecto desde el IDE NetBeans fallaba con un error relacionado a `${start-class}`. El plugin `exec-maven-plugin` que NetBeans usa para ejecutar aplicaciones Java intentaba encontrar la clase principal de una forma que no es compatible con la estructura de Spring Boot cuando el proyecto está en un directorio anidado dentro de un monorepo. Solución: abandonar la ejecución desde el IDE para Spring Boot y usar siempre la consola:

```powershell
cd api_rest
.\mvnw spring-boot:run
```

O si hay errores de compilación anteriores:

```powershell
.\mvnw clean spring-boot:run
```

---

## 10. El script de testing automático (PowerShell E2E)

En la carpeta `testing/` del proyecto hay un script PowerShell (`test_gemini.ps1`) que automatiza la validación completa del ciclo de vida del negocio de principio a fin. Lo que hace en orden:

1. Crea una categoría nueva ("Postres Premium").
2. Crea un producto asociado a esa categoría ("Torta de Chocolate E2E").
3. Crea una venta nueva para el usuario 1.
4. Agrega el producto creado como detalle de esa venta.
5. Genera un envío para esa venta.
6. Abre una PQRS asociada a la venta.
7. Hace GET de los recursos creados para verificar que la base de datos guardó todo correctamente.

El script encapsula la solución al problema de PowerShell en una función `Invoke-MimosApi` que internamente usa `WriteAllText` para todos los POSTs. Si el script corre de principio a fin sin errores, significa que todos los endpoints están funcionando y conectados correctamente a la base de datos.

Para ejecutarlo:

```powershell
cd testing
.\test_gemini.ps1
```

---

## 11. Resumen de todos los endpoints de la API

| Método | URL | Descripción | Código éxito |
|--------|-----|-------------|-------------|
| GET | `/api/roles` | Listar todos los roles | 200 |
| GET | `/api/roles/{id}` | Buscar rol por ID | 200 / 404 |
| POST | `/api/roles` | Crear rol | 201 |
| DELETE | `/api/roles/{id}` | Eliminar rol | 204 |
| GET | `/api/usuarios` | Listar usuarios (sin password) | 200 |
| GET | `/api/usuarios/{id}` | Buscar usuario por ID | 200 / 404 |
| POST | `/api/usuarios` | Crear usuario (encripta clave) | 201 |
| DELETE | `/api/usuarios/{id}` | Eliminar usuario | 204 |
| GET | `/api/categorias` | Listar categorías | 200 |
| GET | `/api/categorias/{id}` | Buscar categoría por ID | 200 / 404 |
| POST | `/api/categorias` | Crear categoría | 201 |
| DELETE | `/api/categorias/{id}` | Eliminar categoría | 204 |
| GET | `/api/productos` | Listar todos los productos | 200 |
| GET | `/api/productos/activos` | Solo productos activos | 200 |
| GET | `/api/productos/categoria/{id}` | Productos por categoría | 200 |
| GET | `/api/productos/{id}` | Buscar producto por ID | 200 / 404 |
| POST | `/api/productos` | Crear producto | 201 |
| DELETE | `/api/productos/{id}` | Eliminar producto | 204 |
| GET | `/api/carritos` | Listar carritos | 200 |
| GET | `/api/carritos/{id}` | Buscar carrito por ID | 200 / 404 |
| POST | `/api/carritos` | Crear carrito | 201 |
| DELETE | `/api/carritos/{id}` | Eliminar carrito | 204 |
| GET | `/api/carrito-items/carrito/{id}` | Items de un carrito | 200 |
| POST | `/api/carrito-items` | Agregar item al carrito | 201 |
| DELETE | `/api/carrito-items/{id}` | Eliminar item | 204 |
| GET | `/api/ventas` | Listar ventas | 200 |
| GET | `/api/ventas/{id}` | Buscar venta por ID | 200 / 404 |
| POST | `/api/ventas` | Crear venta | 201 |
| GET | `/api/detalle-ventas/venta/{id}` | Detalles de una venta | 200 |
| POST | `/api/detalle-ventas` | Agregar detalle a venta | 201 |
| GET | `/api/envios` | Listar envíos | 200 |
| GET | `/api/envios/{id}` | Buscar envío por ID | 200 / 404 |
| GET | `/api/envios/venta/{id}` | Envío de una venta | 200 / 404 |
| GET | `/api/envios/estado/{estado}` | Filtrar por estado | 200 |
| POST | `/api/envios` | Crear envío | 201 |
| DELETE | `/api/envios/{id}` | Eliminar envío | 204 |
| GET | `/api/pqrs` | Listar PQRS | 200 |
| GET | `/api/pqrs/{id}` | Buscar PQRS por ID | 200 / 404 |
| GET | `/api/pqrs/usuario/{id}` | PQRS de un usuario | 200 |
| GET | `/api/pqrs/estado/{estado}` | Filtrar por estado | 200 |
| GET | `/api/pqrs/venta/{id}` | PQRS de una venta | 200 |
| POST | `/api/pqrs` | Crear PQRS | 201 |
| DELETE | `/api/pqrs/{id}` | Eliminar PQRS | 204 |

---

## 12. El estado del proyecto al cerrar este documento

### Lo que está completo y validado

Las 10 entidades de la base de datos tienen implementación completa (Entity, Repository, DTO, Service, Controller) y fueron validadas con pruebas reales contra `MimosDemo`:

- Roles ✅
- Usuarios ✅ (con encriptación BCrypt de contraseñas)
- Categorías ✅
- Productos ✅
- Carrito y CarritoItem ✅
- Ventas y DetalleVenta ✅
- Envíos ✅
- PQRS ✅

### Lo que queda pendiente para el futuro

**Prioridad Alta:**

El campo UPDATE (PUT) está ausente en la mayoría de entidades. Los candidatos principales son `Envio` (actualizar estado y fechas de despacho/entrega) y `PQRS` (registrar la respuesta del admin). Ambos endpoints son necesarios antes de conectar el frontend, porque el flujo de negocio los requiere.

**Prioridad Alta:**

Spring Security + JWT (JSON Web Tokens). Actualmente, cualquier persona que tenga acceso a la red donde corre el servidor puede llamar a `DELETE /api/usuarios/1` y borrar el usuario administrador. No hay ninguna capa de autenticación ni autorización. Esto es completamente inaceptable para producción. La implementación de seguridad requiere su propio documento de contexto.

**Prioridad Media:**

Script de migración de `MimosDemo` a `InventarioDB` (la base de datos de producción). Una vez que el sistema esté estabilizado y protegido, habrá que adaptar el esquema de la DB demo al esquema de producción sin romper el legacy de Node.js.

---

## 13. Glosario rápido

| Término | Qué es en este contexto |
|---------|------------------------|
| **API** | Cualquier contrato entre dos programas para comunicarse |
| **API REST** | API que usa HTTP y sigue convenciones de URLs y verbos |
| **Endpoint** | Una URL específica de la API que acepta peticiones HTTP |
| **HTTP** | Protocolo de comunicación estándar de la web |
| **JSON** | Formato de texto para representar datos estructurados |
| **Header / Cabecera** | Metadatos que acompañan una petición HTTP (ej. `Content-Type`) |
| **Body / Payload / Cuerpo** | El JSON con los datos enviados en un POST o PUT |
| **PathVariable** | Un valor dinámico incrustado en la URL (ej. el `5` en `/usuarios/5`) |
| **RequestBody** | El JSON del cuerpo de una petición, mapeado a un objeto Java |
| **DTO** | Data Transfer Object — objeto que controla qué datos salen al exterior |
| **Entity** | Clase Java que mapea una tabla de la base de datos |
| **Repository** | Interfaz que Spring implementa automáticamente para acceder a la DB |
| **Service** | Clase que contiene la lógica de negocio |
| **Controller** | Clase que expone endpoints HTTP y conecta HTTP con el Service |
| **JPA / Hibernate** | Frameworks de persistencia que traducen entre Java y SQL |
| **3FN** | Tercera Forma Normal — nivel de normalización de la base de datos |
| **CRUD** | Create, Read, Update, Delete — las cuatro operaciones sobre datos |
| **N:M** | Relación muchos a muchos entre dos tablas |
| **Tabla intermedia** | Tabla que resuelve una relación N:M (ej. CarritoItem, DetalleVenta) |
| **BCrypt** | Algoritmo de hashing de contraseñas, irreversible por diseño |
| **Maven / mvnw** | Gestor de dependencias y herramienta de build del proyecto Java |
| **Podman** | Contenedor donde vive el SQL Server en el entorno de desarrollo |

---

*Documento generado como cierre del estado 8 del proyecto API REST Mimos. Fecha: 31 de mayo de 2026.*
