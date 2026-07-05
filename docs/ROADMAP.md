# ROADMAP.md: API REST Mimos

> Cómo se usa: una fase por sesión, en orden. Cada decisión que se tome durante una fase
> se anota en `DECISIONS.md` con fecha; no se pierde en un chat ni en un archivo de
> status nuevo. Una fase que toque el backend no se cierra sin correr
> `backend/testing/test_gemini.ps1` (o su equivalente) contra la base real y decir el
> resultado con números.

Depurado contra el código el 2026-07-05. Lo que los `status/` históricos daban como
pendiente y ya está hecho: el bug de la categoría nula (resuelto en
`ProductoService.crear()`), CORS (existe `config/CorsConfig.java`), el PUT de catálogo
(`Producto` y `Categoria`) y el frontend (10 páginas React funcionando contra la API).
Lo que sigue es lo que de verdad falta, en orden de urgencia.

---

## FASE 1: Rotar y externalizar la credencial de base de datos

La contraseña real de `MimosDemo` está commiteada en `application.properties` y quedó
repetida en el historial de git (estaba en 8 de los 12 `status/` borrados en v1.0).
Borrar archivos no la revoca: cualquiera que clone el repo la lee con `git log -p`. El
proyecto es educativo y sin despliegue real, así que lo expuesto es una base demo en un
contenedor local; rotar y externalizar cuesta minutos y deja el hábito correcto.

1. Rotar la credencial en el SQL Server (nueva contraseña para `api_mimos_user`, o un
   usuario nuevo y se elimina el viejo).
2. Externalizar: `spring.datasource.username=${DB_USER}` y
   `spring.datasource.password=${DB_PASSWORD}` en `application.properties`, valores por
   variable de entorno. El frontend ya usa este patrón con `VITE_API_URL`.
3. Documentar en este archivo o en `DECISIONS.md` cómo se levanta el entorno local sin
   la credencial en el repo.

**Criterio de éxito:** la aplicación arranca contra `MimosDemo` con la credencial nueva
por variable de entorno, y la contraseña vieja ya no abre nada.

---

## FASE 2: Autenticación y autorización

Hoy cualquiera con acceso a la red ejecuta `DELETE /api/usuarios/1` sin identificarse.
BCrypt ya hashea contraseñas al registrar (dependencia `spring-security-crypto`), pero
ningún endpoint exige identidad. El plan que dejaron los docs históricos sigue vigente:
Spring Security + JWT, con roles sobre la tabla `Roles` que ya existe.

**Criterio de éxito:** los endpoints de escritura rechazan requests sin token con `401`,
y `test_gemini.ps1` actualizado pasa con autenticación incluida.

---

## FASE 3: Tests que corran sin base viva

Un `contextLoads()` que necesita SQL Server no es una red de seguridad. Opciones a
decidir en `DECISIONS.md` antes de programar: tests de servicio con H2 o Testcontainers,
o tests de controlador con MockMvc y repositorios mockeados. El script E2E
`test_gemini.ps1` se queda como prueba de integración; lo que falta es lo que avise en
segundos, en cualquier máquina, sin Podman.

---

## FASE 4: PUT donde el negocio lo pide y estados que evolucionan

`estadoEnvio` y el estado de PQRS cambian en la vida real (un envío se despacha, una
queja se responde) y hoy no hay endpoint para eso: las entidades ya lo permiten
(`insertable = false` sin `updatable = false`). Definir el verbo (PUT o PATCH de estado)
y mantener la regla de oro: `Venta` y `DetalleVenta` no se editan nunca.

---

## BACKLOG (sin fecha)

- **LICENSE.** El repo es público, es fork de `ventasMimosPPI` y no tiene licencia. Qué
  licencia corresponde (y si el upstream impone algo) lo decide el dueño; se anota en
  `DECISIONS.md` cuando se resuelva.
- **Migración a `InventarioDB`.** El plan original: cuando la API esté validada y
  asegurada, apuntarla a la base de producción del legacy. Bloqueada por las Fases 1 y 2.
- **`<name>` y `<description>` del `pom.xml`**, y sincronizar las versiones de los
  artefactos con el CHANGELOG (van en el próximo PR de código).
- **Login real en el frontend.** Las 10 páginas de gestión asumen un administrador; no
  hay pantalla de login ni manejo de sesión. Depende de la Fase 2.
