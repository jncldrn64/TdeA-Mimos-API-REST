# DECISIONS.md: API REST Mimos

> Registro append-only, estilo ADR. No se borra una entrada vieja aunque quede obsoleta;
> se agrega una nueva que la reemplaza y la referencia. Cada entrada abre con
> `## YYYY-MM-DD — <título>`. Los 12 archivos de `status/` que este registro reemplaza
> llegaron a contradecirse sobre si un bug seguía abierto; acá la historia se apila con
> fecha, no se reescribe.

---

## 2026-07-05 — Adopción del estándar de documentación y consolidación de los `status/`

**Contexto:** la documentación eran 12 archivos en `status/` (una guía inicial, 8
updates de relevo entre IAs, un cierre, una guía definitiva y un diagrama), duplicados
enteros en `backend/status/`: 24 archivos, 152 KB por copia. Era el anti-patrón exacto
que el estándar de los otros repos del dueño prohíbe: un archivo por ronda. Encima, los
8 relevos llevan la misma fecha ("31 de mayo de 2026"), `estado_del_arte.md` no contiene
un estado del arte sino la "Guía Definitiva" (el nombre engaña), y dos documentos se
contradicen sobre el bug de `Producto` (ver la entrada siguiente).

**Decisión:** se adopta el estándar completo de TdeA-Mimos-Website / TL-FCCU /
MIDI-Scale-Trainer: `CLAUDE.md` y `CHANGELOG.md` en la raíz, `docs/` con
`ARCHITECTURE.md`, `ROADMAP.md` y `DECISIONS.md`. Los 24 archivos de `status/` se
borran; lo vigente, corregido contra el código, vive en `docs/`. El único contenido que
sobrevive tal cual es el diagrama entidad-relación, movido a `docs/modelo-er.html`.

**Razón:** una cadena de archivos "uno por ronda" no tiene fuente de verdad: para saber
el estado del bug de `Producto` había que leer 3 documentos y elegir a cuál creerle. Un
mapa único verificado (ARCHITECTURE) más un registro de porqués con fecha (este archivo)
sí la tiene. El detalle histórico no se pierde: los 24 archivos siguen completos en el
historial de git, commit por commit.

**Estado:** vigente.

---

## 2026-07-05 — El bug de la categoría nula está resuelto en el código; los docs se contradecían

**Contexto:** el "status update 8" (el informe final) lista como pendiente de alta
prioridad que `ProductoService.crear()` no asignaba la `Categoria` y los productos
quedaban con la FK en null. `estado_del_arte.md` (escrito también al cierre) declara lo
contrario: bug corregido, causa reatribuida a un desajuste del JSON de prueba (objeto
anidado contra DTO plano). Dos documentos del mismo proyecto, dos veredictos.

**Decisión:** manda el código. `ProductoService.crear()` hoy valida el `idCategoria`
contra `categoriaRepository.findById()`, tira `IllegalArgumentException` si no existe y
asigna el objeto con `setCategoria(categoria)`. Se da por resuelto en el código y así
queda escrito en `ARCHITECTURE.md` §8.

**Razón y salvedad (honestidad de estado):** la verificación del 2026-07-05 es por
lectura de código, no por corrida: en este entorno no hay SQL Server ni `MimosDemo`. Si
un POST real volviera a guardar la FK en null, esta entrada se reemplaza con la
evidencia de esa corrida.

**Estado:** vigente.

---

## 2026-07-05 — Ratificación: el contrato del API (DTOs planos, dos DTOs, sin PUT transaccional)

**Contexto:** decisiones tomadas durante las rondas de mayo de 2026 y regadas en los
`status/`; se ratifican leyendo los 57 archivos Java el 2026-07-05.

**Decisión:** se mantienen como contrato del API: DTOs planos (la FK es un campo
directo, `"idCategoria": 1`); dos DTOs cuando hay campos sensibles o autogenerados
(`CrearUsuarioDTO` recibe la contraseña, `UsuarioDTO` no expone el hash); sin `PUT` ni
`DELETE` en `Venta` y `DetalleVenta`; `BigDecimal` para dinero;
`@ManyToOne(fetch = LAZY)` en toda FK; `insertable = false, updatable = false` para
columnas con `DEFAULT` en SQL Server, y solo `insertable = false` donde el estado
evoluciona (`estadoEnvio`, estado de PQRS).

**Razón:** cada regla pagó un error real. El JSON anidado dejó FKs en null una ronda
entera. Editar una venta rompe el historial financiero que `precioSnapshot` y
`precioUnitario` existen para congelar: los precios cambian y la factura vieja no.

**Estado:** vigente.

---

## 2026-07-05 — Ratificación: infraestructura (puerto 8081, validate, dbo, MimosDemo)

**Contexto:** misma ratificación por lectura de `application.properties` y de la
historia de errores documentada.

**Decisión:** se mantienen: puerto `8081` (el 8080 lo ocupa el legacy Node.js);
`ddl-auto=validate` con el esquema mandando desde `SQLServer/db.sql`;
`PhysicalNamingStrategyStandardImpl` más `default_schema=dbo` (sin eso Hibernate tiraba
`Schema-validation: missing table`); la API trabaja contra `MimosDemo` (copia 3FN) y la
base de producción del legacy, `InventarioDB`, no se toca hasta la migración planificada.

**Razón:** cada línea de esa configuración corrigió un fallo reproducido y documentado
en mayo de 2026. Cambiarlas sin releer esa historia es repetirla.

**Estado:** vigente. La credencial embebida en el mismo archivo NO se ratifica: es el
gap número 1 (`ARCHITECTURE.md` §8) y la Fase 1 del roadmap.

---

## 2026-07-05 — Limpieza: zips de páginas alternativas y boilerplate fuera del repo

**Contexto:** `frontend/src/pages/` guardaba, junto a las 10 páginas `.jsx` en uso, dos
zips del 2026-05-31: `Claude_pages.zip` (10 archivos que coinciden byte a byte con los
`.jsx` extraídos al lado) y `Gemini_pages.zip` (la versión alternativa que se descartó).
Además: `backend/HELP.md` (boilerplate de Spring Initializr) y `frontend/README.md`
(boilerplate de la plantilla Vite), sin una línea propia del proyecto.

**Decisión:** se borran los 4 archivos. La comparación Claude contra Gemini ya se
decidió (la versión extraída es la de Claude); si alguna vez hay que revisitar la
alternativa, los zips viven en el historial de git. También se corrige el `.gitignore`
de la raíz, que ignoraba `/api_rest/target/`, una ruta que dejó de existir con la
reestructuración del commit `ae56298`; ahora ignora `backend/target/`.

**Razón:** un zip dentro de `src/` es una segunda fuente de verdad esperando a
desincronizarse, y el boilerplate de plantilla es texto que ningún lector del repo
necesita. El `.gitignore` roto era el más urgente de los tres: el próximo
`mvn package` habría dejado `backend/target/` entero como archivos sin ignorar.

**Estado:** vigente.

---

### Plantilla para nuevas entradas

```
## YYYY-MM-DD — Título corto de la decisión

**Contexto:** qué problema o pregunta motivó esto.

**Decisión:** qué se decidió, en una o dos frases.

**Razón:** por qué esta opción y no otra (mencionar alternativas descartadas si aplica).

**Estado:** vigente / reemplazada por [fecha] / obsoleta
```
