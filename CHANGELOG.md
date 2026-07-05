# CHANGELOG

Formato basado en [Keep a Changelog](https://keepachangelog.com). Lo más nuevo, arriba.
Todo lo anterior a v1.0 vive en el historial de git (46 commits, del 2026-04-23 al
2026-07-05, incluido el fork de `JackelineAristizabal/ventasMimosPPI`) y no se
reconstruye acá.

## v1.0 — 2026-07-05

Adopción del estándar de documentación compartido con TdeA-Mimos-Website, TL-FCCU y
MIDI-Scale-Trainer, más limpieza de archivos. Ninguna línea de Java, JSX, SQL ni
configuración de la aplicación cambió.

### Added

- `CLAUDE.md`: estándar del proyecto (documentación canónica, CHANGELOG, DECISIONS,
  fechas ISO, commits `{add, chg, fix, rmv, doc}`, prosa con los skills `no-ai-slop` y
  `rossmann-voice`, honestidad de estado, scope de escritura, versión única con
  `backend/pom.xml` y `frontend/package.json`).
- `CHANGELOG.md`: este registro.
- `docs/ARCHITECTURE.md`: mapa del sistema verificado contra el código el 2026-07-05
  (57 archivos Java, 45 endpoints en 10 controladores, 10 páginas React, 10 tablas en
  3FN), con la sección "Gaps confirmados leyendo el código".
- `docs/ROADMAP.md`: el pendiente real. La Fase 1 es rotar la credencial de base de
  datos que quedó commiteada.
- `docs/DECISIONS.md`: registro append-only estilo ADR. Ratifica con fecha las
  decisiones que vivían regadas en los 12 archivos de `status/` y cierra la
  contradicción que esos archivos dejaron abierta sobre el bug de `Producto`.

### Changed

- `status/modelo_db.html` movido a `docs/modelo-er.html`: es el diagrama entidad-relación
  (Mermaid autocontenido) y es el único contenido de `status/` que sigue vigente tal
  cual. El contenido no cambió.
- `.gitignore` de la raíz: las reglas `/api_rest/target/` y `api_rest/backend/target/`
  apuntaban a rutas que dejaron de existir con la reestructuración del 2026-07-05
  (commit `ae56298`); ahora ignora `backend/target/`. Se suma `frontend/node_modules/`
  explícito por claridad, aunque `node_modules/` ya lo cubría.

### Removed

- `status/` y `backend/status/` completos: 24 archivos, dos copias idénticas byte a byte
  de los mismos 12 documentos (152 KB cada una). Eran el anti-patrón que el estándar
  prohíbe: un archivo por ronda, con 8 relevos fechados el mismo día y contradicciones
  entre sí (el update 8 declara el bug de `Producto` pendiente; `estado_del_arte.md` lo
  declara corregido). Lo vigente quedó en `docs/`; el detalle histórico sigue completo en
  el historial de git.
- `frontend/src/pages/Claude_pages.zip` y `Gemini_pages.zip`: dos versiones alternativas
  de las 10 páginas de gestión, generadas el 2026-05-31. La versión Claude es la que está
  extraída en `frontend/src/pages/` (los 10 `.jsx` coinciden byte a byte con el zip); la
  versión Gemini fue la descartada. Ambos zips siguen en el historial de git.
- `backend/HELP.md`: boilerplate de Spring Initializr, sin contenido del proyecto.
- `frontend/README.md`: boilerplate de la plantilla React + Vite, sin contenido del
  proyecto.
