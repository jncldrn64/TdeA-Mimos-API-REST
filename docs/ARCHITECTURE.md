# ARCHITECTURE.md: API REST Mimos

> **Regla de este documento:** todo lo que está acá se verificó contra el código real el
> 2026-07-05, con archivo y línea. Lo que no se pudo verificar se marca como tal. La
> documentación anterior (12 archivos en `status/`) llegó a contradecirse a sí misma
> sobre si un bug seguía abierto (ver §8); no se repite ese patrón.

## 0. Qué es y de dónde viene

Reconstrucción como API REST del sistema de ventas de helados Mimos. El original es un
monolito Node.js de 3 capas con frontend, backend y lógica acoplados; este repo lo
reemplaza por una API Spring Boot contra una base SQL Server normalizada en 3FN
(`MimosDemo`), más un frontend React de administración. Es fork de
`JackelineAristizabal/ventasMimosPPI` (merge `df0cfe0`, 2026-05-25), con 46 commits desde
el 2026-04-23. No confundir con TdeA-Mimos-Website: mismo dueño, misma marca, proyecto y
código distintos.

Monorepo de tres piezas, reestructurado a la raíz el 2026-07-05 (commit `ae56298`):

| Carpeta | Qué es | Stack |
|---|---|---|
| `backend/` | La API REST | Spring Boot 3.5.14, Java 17, JPA/Hibernate, SQL Server |
| `frontend/` | UI de administración, 10 páginas CRUD | React 19.2.6, Vite 8.0.12, Tailwind 4.3.0, react-router-dom 7.16.0 |
| `SQLServer/db.sql` | Esquema completo de `MimosDemo` | 10 tablas en 3FN |

Los números del backend, contados el 2026-07-05: 57 archivos Java: 10 entidades, 10
repositorios, 10 servicios, 10 controladores, 14 DTOs, `CorsConfig`, la clase main y un
test. Este repo no tiene LICENSE; ese gap está en §8 y en el roadmap.

## 1. Backend: capas y flujo

```
Controller → Service → Repository → Entity
     ↕ DTO (entrada/salida)
```

El controlador recibe y devuelve DTOs, nunca entidades crudas. El servicio arma la
entidad, aplica las reglas de negocio y habla con el repositorio (Spring Data JPA). No
hay capa de casos de uso ni puertos: son 5 capas contadas con DTO y base de datos, no la
arquitectura hexagonal del Website.

Los 45 endpoints, contados por anotación en los 10 controladores:

| Controlador | Ruta base | Endpoints |
|---|---|---|
| `ProductoController` | `/api/productos` | 7 (incluye `PUT /{id}`) |
| `PQRSController` | `/api/pqrs` | 7 (incluye `GET /estado/{estado}`) |
| `EnvioController` | `/api/envios` | 6 (incluye `GET /venta/{ventaId}` y `GET /estado/{estado}`) |
| `CategoriaController` | `/api/categorias` | 5 (incluye `PUT /{id}`) |
| `UsuarioController` | `/api/usuarios` | 4 |
| `RolController` | `/api/roles` | 4 |
| `CarritoController` | `/api/carritos` | 4 |
| `VentaController` | `/api/ventas` | 3 (sin DELETE: una venta no se borra) |
| `CarritoItemController` | `/api/carrito-items` | 3 |
| `DetalleVentaController` | `/api/detalle-ventas` | 2 (sin DELETE, mismo motivo) |

CORS está configurado en `config/CorsConfig.java`: todos los endpoints, origen
`http://localhost:5173` (el dev server de Vite), métodos GET/POST/PUT/DELETE/OPTIONS,
`allowCredentials(true)`. La documentación vieja decía que CORS no estaba implementado;
el código dice otra cosa.

## 2. Configuración que no es accidente (`application.properties`)

Cada línea rara de `backend/src/main/resources/application.properties` pagó un error
real, documentado en los `status/` históricos:

- `server.port=8081`: el 8080 lo ocupaba el sistema legacy Node.js.
- `spring.jpa.hibernate.ddl-auto=validate`: Hibernate verifica que las tablas existan
  pero no las crea ni las altera. El esquema manda desde `SQLServer/db.sql`.
- `PhysicalNamingStrategyStandardImpl` + `default_schema=dbo`: sin esto Hibernate
  buscaba tablas en minúscula en un esquema inexistente y tiraba
  `Schema-validation: missing table`.
- La URL JDBC apunta a la IP del contenedor Podman que corre SQL Server, no a
  `localhost`: el desarrollo se hizo desde una VM Windows contra un host Linux.
- El archivo lleva usuario y contraseña de la base en texto plano. Eso es el gap más
  serio del repo (§8) y la Fase 1 del roadmap.

## 3. El contrato del API: las decisiones que lo definen

**DTOs planos.** La FK viaja como campo directo: `{"idCategoria": 1}`. El formato
anidado `{"categoria": {"idCategoria": 1}}` no lo deserializa el DTO y la FK queda en
null; ese desajuste costó una ronda entera de debugging (el "bug de la categoría nula").

**Dos DTOs por entidad sensible.** `CrearUsuarioDTO` recibe la contraseña;
`UsuarioDTO` de salida no expone el hash. Mismo patrón en `Producto`, `Envio` y `PQRS`
para campos autogenerados.

**Sin PUT transaccional.** Una `Venta` o un `DetalleVenta` no se editan ni se borran:
son historial financiero con el precio congelado al momento de la compra
(`precioSnapshot` en `CarritoItem`, `precioUnitario` en `DetalleVenta`). `PUT` existe
solo en `Producto` y `Categoria`, que son catálogo, no transacción.

**`BigDecimal` para dinero y `FetchType.LAZY` en toda FK.** Lo primero evita el error
de representación binaria de `double`; lo segundo evita cargar el grafo entero de
objetos en cada consulta.

**Defaults de SQL Server respetados.** Columnas con `DEFAULT` en la base
(`fechaIngreso`, `estaActivo`, `createdAt`) llevan `insertable = false,
updatable = false` en la entidad: nacen null en la respuesta del POST y las llena la
base. `estadoEnvio` y el estado de PQRS llevan solo `insertable = false`, porque esos
sí evolucionan.

## 4. Frontend

10 páginas de gestión en `frontend/src/pages/`, una por entidad
(`GestionProductos.jsx`, `GestionVentas.jsx`, etc.), ruteadas en `App.jsx:81-90` con
react-router. Cada página pega a la API con `fetch` sobre
`import.meta.env.VITE_API_URL || "http://localhost:8081"`, así que el destino se cambia
por variable de entorno sin tocar código. Las páginas son la versión generada por
Claude el 2026-05-31; la alternativa de Gemini se descartó (ver DECISIONS del
2026-07-05).

## 5. Base de datos

`SQLServer/db.sql` crea las 10 tablas de `MimosDemo`: Roles, Usuarios, Categorias,
Productos, Carrito, CarritoItem, Ventas, DetalleVenta, Envios y PQRS. Las intermedias
`CarritoItem` y `DetalleVenta` resuelven las relaciones N:M y congelan el precio. El
diagrama entidad-relación vive en `docs/modelo-er.html` (Mermaid autocontenido, se abre
en el navegador).

`MimosDemo` es una copia limpia y normalizada; la base de producción del legacy
(`InventarioDB`) no se toca nunca. La migración es trabajo futuro (roadmap, backlog).

## 6. Testing

Un solo test JUnit: `ApiRestApplicationTests.contextLoads()`, que ni corre sin la base
(`ddl-auto=validate` aborta el arranque). La validación real del backend fue manual
(curl/Postman, endpoint por endpoint) más `backend/testing/test_gemini.ps1`: 130 líneas
de PowerShell que corren el ciclo completo categoría → producto → venta → detalle →
envío → PQRS contra la API viva, con el patrón `WriteAllText` + `curl.exe -d "@archivo"`
que esquiva el mangling de JSON de PowerShell.

**En la sesión del 2026-07-05 no se corrió nada de esto**: no hay SQL Server ni
`MimosDemo` en este entorno. Todo "validado" en este documento significa "validado en
las corridas documentadas de mayo de 2026", no hoy.

## 7. Convenciones de código

Las obligatorias están en `CLAUDE.md`. Regla general: ante la duda, copiá la forma de la
entidad `Rol`, que fue la plantilla de las otras 9. Los comentarios del código ya vienen
en español y explican el porqué, no el qué
(`ProductoService.java`: "fechaIngreso y estaActivo NO se tocan: updatable=false en la
Entity los protege"); mantené esa línea.

## 8. Gaps confirmados leyendo el código (2026-07-05)

- **Credenciales de base de datos commiteadas.** `application.properties` lleva el
  usuario y la contraseña reales de `MimosDemo` en texto plano, y la misma contraseña
  aparecía repetida en 8 de los 12 archivos `status/` borrados. Borrarlos no la saca del
  historial de git: la credencial se rota y se externaliza (Fase 1 del roadmap), no se
  "esconde".
- **Cero autenticación.** No hay Spring Security ni JWT: cualquiera con acceso a la red
  puede ejecutar `DELETE /api/usuarios/1`. BCrypt hashea contraseñas al registrar
  usuarios, pero ningún endpoint exige identidad. Fase 2 del roadmap.
- **Sin LICENSE.** El repo es público y es fork de `ventasMimosPPI`; qué licencia
  corresponde lo decide el dueño revisando el upstream. Hasta entonces, acá no se
  vendorea nada de terceros.
- **El bug de la categoría nula quedó resuelto en el código, pero los docs históricos se
  contradicen.** `ProductoService.crear()` valida el `idCategoria` contra el repositorio
  y asigna el objeto con `setCategoria(categoria)`; el update 8 lo daba por pendiente y
  `estado_del_arte.md` por corregido. El código actual es la fuente: resuelto por
  lectura de código, sin corrida real en esta sesión (ver DECISIONS del 2026-07-05).
- **`backend/pom.xml` tiene `<name/>` y `<description/>` vacíos**, y las versiones de los
  artefactos (`0.0.1-SNAPSHOT` en el pom, `0.0.0` en `frontend/package.json`) no están
  sincronizadas con el CHANGELOG v1.0. El bump va en el próximo PR de código, nunca en
  uno doc-only (regla "Versión mostrada" de `CLAUDE.md`).
- **Sin tests automatizados de verdad.** Un `contextLoads()` y un script E2E manual. No
  hay tests de servicio ni de controlador que corran sin base viva.
