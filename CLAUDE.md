# CLAUDE.md: estándar del proyecto

Reglas que valen en cada sesión. Se leen antes de tocar nada. Este archivo fija el
estándar de documentación y formato; el mapa técnico vive en `docs/ARCHITECTURE.md`.

Aviso de identidad: este repo NO es TdeA-Mimos-Website, por mucho que el nombre se
parezca. Es la reconstrucción como API REST del sistema de ventas Mimos, fork de
`JackelineAristizabal/ventasMimosPPI` (merge `df0cfe0`, 2026-05-25). Otro código, otra
base de datos, otras convenciones. No se traen para acá reglas de aquel repo (arquitectura
hexagonal, casos de uso): acá no existen y no se retrofitean.

## Documentación

La documentación vive en `docs/`. Los archivos canónicos son tres: `ARCHITECTURE.md`,
`ROADMAP.md` y `DECISIONS.md`, más un anexo: `modelo-er.html` (diagrama entidad-relación
en Mermaid, autocontenido). En la raíz queda `CHANGELOG.md`. No se crea ningún archivo de
documentación nuevo sin preguntar primero. La documentación anterior era exactamente lo
contrario: 12 archivos en `status/`, uno por ronda de trabajo, duplicados enteros en
`backend/status/`; ese patrón queda prohibido.

## CHANGELOG

`CHANGELOG.md` está en la raíz, en formato [Keep a Changelog](https://keepachangelog.com).
Es un solo archivo que crece por secciones, nunca uno por ronda. Lo más nuevo va arriba, en
orden descendente. Cada sección abre con `## vX.Y — YYYY-MM-DD` y adentro lleva
`### Added`, `### Changed`, `### Fixed` o `### Removed`. Todo lo anterior a v1.0 vive en el
historial de git (46 commits desde el 2026-04-23) y no se reconstruye de memoria.

## DECISIONS

`docs/DECISIONS.md` es append-only, estilo ADR. No se borra una entrada vieja aunque quede
obsoleta; se agrega una nueva que la reemplaza y la referencia. Cada entrada abre con
`## YYYY-MM-DD — <título>`. Los 12 archivos de `status/` llegaron a contradecirse entre sí
sobre si un bug estaba resuelto; acá la historia no se reescribe, se apila con fecha.

## Fechas

Siempre ISO 8601 (`YYYY-MM-DD`). Nunca formato local. Los `status/` viejos fecharon 8
relevos distintos con el mismo "31 de mayo de 2026"; eso no vuelve a pasar.

## Commits

El mensaje es `<tipo>: <resumen imperativo corto>`, con `tipo` en `{add, chg, fix, rmv,
doc}`:

- `add`: nueva capacidad.
- `chg`: cambio de comportamiento.
- `fix`: corrección.
- `rmv`: se sacó algo.
- `doc`: solo documentación.

El cuerpo del commit no vuelve a narrar el cambio: máximo 1 o 2 líneas y una referencia a
la sección del CHANGELOG. El qué vive en el CHANGELOG, el porqué en DECISIONS, no en el
mensaje del commit. La historia previa mezcla `Add:`/`Chg:`/`Fix:` con mayúscula y
mensajes sueltos ("ahora si dio", "Esto cuesta 700.000 COP"); no se normaliza.

## Prosa

Docs y comentarios en español, aplicando dos skills:
`no-ai-slop-writing-rules:no-ai-slop` y `no-ai-slop-writing-rules:rossmann-voice`. Las dos
salen del plugin `no-ai-slop-writing-rules` (realrossmanngroup). No están vendoreadas en el
repo porque el upstream no trae licencia (ver "Vendoreo de dependencias de terceros"). Esas
referencias no resuelven hasta instalar el plugin: se instala por sesión con
`/plugin marketplace add realrossmanngroup/no_ai_slop_writing_rules` y después
`/plugin install no-ai-slop-writing-rules`
(https://github.com/realrossmanngroup/no_ai_slop_writing_rules). Sin relleno, sin frases de
IA. Cada afirmación cierra sobre un dato concreto: un número, una línea de código, una
fecha, un endpoint.

## Guion largo

Guion largo (`—`): prohibido en toda la prosa (regla 1 de no-ai-slop). Se permite
únicamente como token de formato en los encabezados de fecha de CHANGELOG
(`## vX.Y — YYYY-MM-DD`) y DECISIONS (`## YYYY-MM-DD — <título>`). La historia no se
normaliza: lo ya escrito queda como está.

## Honestidad de estado

Nada se declara "funciona" o "probado" sin una corrida real. Este proyecto necesita el
SQL Server de `MimosDemo` corriendo (contenedor Podman) para levantar el backend, porque
`ddl-auto=validate` aborta el arranque sin base; si el entorno de la sesión no lo tiene,
se dice con esas palabras en vez de citar resultados viejos como vigentes.

## Flujo de trabajo

Se trabaja vía Pull Request. Si `push`, `branch` o `PR` devuelve `403`, se para y se avisa
que falta permiso de escritura. No se arma una subida manual de archivos sueltos.

## Vendoreo de dependencias de terceros

Cuando se copia una skill, plantilla o cualquier código de terceros a este repo, se copia
también su LICENSE y su atribución, en la misma carpeta. Ojo: este repo hoy no tiene
LICENSE propia y es un fork; ese gap está en `docs/ROADMAP.md` y lo resuelve el dueño, no
un agente. Si la fuente de algo copiado no trae licencia, se para y se avisa antes de
commitear.

## Scope de escritura

Este repo (TdeA-Mimos-API-REST) es el único destino de escritura. Cualquier otro
repositorio clonado en la sesión es solo lectura y contexto: se copia DESDE él, nunca se
escribe EN él. En particular TdeA-Mimos-Website: mismo dueño, nombre parecido, proyecto
distinto. Ante duda de en qué repo estás escribiendo, se para y se pregunta.

## Versión mostrada

Las versiones de los artefactos (el `<version>` de `backend/pom.xml` y el `version` de
`frontend/package.json`) son fuente única con el CHANGELOG: siempre la última versión del
CHANGELOG. Se bumpean en el mismo PR que trae el cambio de código que lo amerita, nunca en
un PR doc-only. Hoy dicen `0.0.1-SNAPSHOT` y `0.0.0`; ese desfase está anotado como gap en
`docs/ARCHITECTURE.md` §8 y se cierra en el próximo PR de código.

## Convenciones de código

Las que el código ya cumple, verificadas contra los 57 archivos Java el 2026-07-05. El
detalle con ejemplos está en `docs/ARCHITECTURE.md` §3 y §7.

- Todo en español: entidades, servicios, páginas del frontend.
- Flujo en capas estricto: Controller → Service → Repository → Entity. El controlador no
  toca el repositorio.
- DTOs planos: la FK viaja como campo directo (`"idCategoria": 1`), nunca como objeto
  anidado. Un JSON anidado deja la FK en null; ese bug ya costó una ronda entera.
- Dos DTOs (entrada y salida) cuando la entidad tiene campos sensibles o autogenerados:
  `CrearUsuarioDTO` no expone lo que `UsuarioDTO` sí oculta (`passwordHash`).
- `BigDecimal` para dinero, nunca `double`.
- `@ManyToOne(fetch = FetchType.LAZY)` en toda FK.
- `insertable = false, updatable = false` en columnas con `DEFAULT` de SQL Server; solo
  `insertable = false` cuando el campo evoluciona (`estadoEnvio`, estado de PQRS).
- Sin `PUT` en registros transaccionales: una `Venta` mal hecha se anula y se rehace, no
  se edita. `PUT` existe solo donde el negocio lo pide (hoy: `Producto`, `Categoria`).
