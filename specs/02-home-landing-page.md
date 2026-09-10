# 02 — Home: landing page de Arcade Vault

**Estado:** Aprobado
**Depende de:** SPEC 01
**Fecha:** 2026-09-09

**Objetivo:** Convertir `/` en la landing page de Arcade Vault (hero, por qué elegirnos, juegos destacados, stats, actividad en vivo, precios y CTA final) replicando `home.jsx` del template, moviendo la Biblioteca actual a `/biblioteca`.

## Alcance

### Incluye

- Nueva página `/` con las secciones de `home.jsx`:
  - Hero: silhouettes SVG flotantes decorativas, eyebrow "INSERTA UNA MONEDA", título de 3 líneas con gradientes, subtítulo, CTAs "Explorar Juegos" (→ `/biblioteca`) y "Crear Cuenta" (→ `/iniciar-sesion`), indicador de scroll.
  - "¿Por qué Arcade Vault?": grid de 4 tarjetas con icono pixel (SVG), título y descripción.
  - "Juegos Disponibles Ahora": mini-rail con los primeros 6 juegos de `lib/data.ts` (`GAMES`), cada uno enlazando a `/juegos/[id]`, y botón "Ver Todos Los Juegos" (→ `/biblioteca`).
  - "Stats": 3 bloques numéricos (juegos, partidas, ranking).
  - "Actividad en Vivo": ticker de últimas puntuaciones y tabla de top 5 jugadores de hoy, con botón "Ver Salón" (→ `/salon-de-la-fama`).
  - "Precios": tarjeta de plan único gratis con lista de beneficios y botón "Empezar Gratis" (→ `/iniciar-sesion`), más bloque de FAQ.
  - CTA final: título, botón "Insertar Moneda" (→ `/biblioteca`), texto de apoyo.
  - Animación reveal-on-scroll (`IntersectionObserver`) igual que en el template.
- Mover la Biblioteca actual (hero simple + buscador + chips + grid de juegos) de `app/page.tsx` a `app/biblioteca/page.tsx`, sin cambios funcionales.
- Actualizar todos los enlaces internos que hoy apuntan a `/` asumiendo que es la Biblioteca, para que apunten a `/biblioteca`:
  - `app/juegos/[id]/page.tsx` ("VOLVER AL VAULT").
  - `components/game-player.tsx` ("VOLVER AL VAULT" en el modal de fin de partida).
  - `app/salon-de-la-fama/page.tsx` ("VOLVER A LA BIBLIOTECA").
- Actualizar `components/nav.tsx`: agregar el link "Inicio" (→ `/`), mantener "Biblioteca" (→ `/biblioteca`) y "Salón de la Fama", y ajustar la lógica `isActive` para las nuevas rutas (desktop y drawer móvil).
- Portar a `app/globals.css` el bloque de estilos de Home de `styles.css` (sección `/* ===== HOME PAGE ===== */`: `.home`, `.home-hero`, `.home-title`, `.home-silos`, `.home-section`, `.feature-grid`/`.feature-card`, `.mini-rail`/`.mini-card`, `.home-stats`, `.home-final`, `.reveal`).

### No incluye

- La pantalla "Acerca de" (`about.jsx`) ni su formulario de contacto — queda para un spec separado.
- Cambios de contenido o diseño respecto al template: los textos, números y datos mock (actividad en vivo, top jugadores, precios, FAQ) se portan literalmente.
- Cualquier lógica de backend para las puntuaciones de "Actividad en Vivo" — son datos decorativos hardcodeados, no provienen de `seededScores` ni de partidas reales.
- Cambios al modelo de datos existente (`lib/data.ts`, `lib/session.ts`) — Home solo lee `GAMES` para el mini-rail.
- Redirects o alias desde una eventual URL previa hacia `/biblioteca` — no se configura ninguna regla de redirección.

## Modelo de datos

No se introduce ningún modelo de datos nuevo. Home reutiliza `GAMES` de `lib/data.ts` (primeros 6 elementos) para el mini-rail de juegos destacados. Los datos de "Actividad en Vivo" (últimas puntuaciones y top 5 del día) se definen como constantes locales dentro de `app/page.tsx`, portadas tal cual desde los arrays literales de `home.jsx` — no se generan con `seededScores` ni se persisten.

## Plan de implementación

1. **Mover Biblioteca a `/biblioteca`.** Crear `app/biblioteca/page.tsx` con el contenido íntegro y sin cambios del actual `app/page.tsx` (hero, buscador, chips de categoría, grid de `GameCard`).
   *Verificable:* `/biblioteca` funciona exactamente igual a como funcionaba `/` antes (buscar y filtrar por categoría en tiempo real).

2. **Actualizar enlaces "volver".** Cambiar el `href`/`Link` de "VOLVER AL VAULT" en `app/juegos/[id]/page.tsx` y `components/game-player.tsx`, y de "VOLVER A LA BIBLIOTECA" en `app/salon-de-la-fama/page.tsx`, para que apunten a `/biblioteca` en vez de `/`.
   *Verificable:* desde Detalle, Reproductor y Salón de la Fama, esos botones navegan a `/biblioteca`.

3. **Portar CSS de Home.** Copiar a `app/globals.css` las clases de la sección "HOME PAGE" de `styles.css` (hero, silhouettes, feature grid, mini-rail, stats, final CTA, `.reveal`).
   *Verificable:* `npm run build` compila sin errores; las pantallas existentes no cambian visualmente.

4. **Hero de Home.** Implementar `app/page.tsx` (marcado `"use client"`) con el hero: componente local `FloatingSilhouettes` (SVGs decorativos), eyebrow, título de 3 líneas, subtítulo, botones "Explorar Juegos" y "Crear Cuenta", indicador de scroll.
   *Verificable:* `/` muestra el hero completo; ambos botones navegan a `/biblioteca` y `/iniciar-sesion` respectivamente.

5. **Sección "Por qué" y "Juegos disponibles".** Implementar el feature grid (4 tarjetas con `FeatureIcon` local) y el mini-rail con `GAMES.slice(0, 6)` (componente local `MiniCard`, distinto de `GameCard`), enlazando a `/juegos/[id]`, más el botón "Ver Todos Los Juegos" hacia `/biblioteca`.
   *Verificable:* el mini-rail muestra 6 juegos reales de `lib/data.ts`; cada tarjeta enlaza al detalle correcto de ese juego.

6. **Stats y Actividad en Vivo.** Implementar el bloque de 3 stats y el bloque de actividad (ticker de puntuaciones + top 5 del día) con las constantes locales portadas del template, y el botón "Ver Salón" hacia `/salon-de-la-fama`.
   *Verificable:* ambos bloques renderizan las listas mock del template; el botón navega al Salón de la Fama.

7. **Precios y CTA final.** Implementar la tarjeta de precio único gratis con su lista de beneficios y botón "Empezar Gratis" (→ `/iniciar-sesion`), el bloque de FAQ, y la sección de CTA final con botón "Insertar Moneda" (→ `/biblioteca`).
   *Verificable:* ambas secciones se muestran con los textos del template y los botones navegan a las rutas correctas.

8. **Reveal-on-scroll.** Implementar el hook local `useReveal` (`useEffect` + `IntersectionObserver` sobre `.reveal`) en `app/page.tsx`.
   *Verificable:* al hacer scroll, las secciones aparecen con la transición fade/slide, igual que en el template.

9. **Nav.** Actualizar `components/nav.tsx`: agregar el link "Inicio" (→ `/`) antes de "Biblioteca", y ajustar `isActive` para que `/` resalte "Inicio" y `/biblioteca` (+ `/juegos/*`) resalte "Biblioteca", tanto en desktop como en el drawer móvil.
   *Verificable:* el link activo correcto se resalta en `/`, `/biblioteca`, `/juegos/[id]`, `/salon-de-la-fama` e `/iniciar-sesion`.

10. **QA final.** Ejecutar `npm run lint` y `npm run build`, revisar responsive (mobile/desktop) de todas las secciones de Home, y comparar visualmente contra `home.jsx`/`arcade-vault-standalone.html`.
    *Verificable:* lint y build pasan sin errores; Home coincide visualmente con el template; no quedan enlaces rotos entre pantallas.

## Criterios de aceptación

- [ ] `/` muestra la landing page completa: hero, por qué Arcade Vault, juegos destacados, stats, actividad en vivo, precios y CTA final.
- [ ] `/biblioteca` muestra el buscador, chips de categoría y grid de juegos que antes estaban en `/`, sin pérdida de funcionalidad.
- [ ] El mini-rail de Home muestra 6 juegos reales de `lib/data.ts` y cada uno enlaza a su `/juegos/[id]`.
- [ ] Todos los botones "volver"/"salir" (Detalle, Reproductor, Salón de la Fama) apuntan a `/biblioteca`.
- [ ] El Nav muestra "Inicio", "Biblioteca" y "Salón de la Fama", con el estado activo correcto en cada ruta, en desktop y en el drawer móvil.
- [ ] Las secciones de Home aparecen con la animación reveal-on-scroll al hacer scroll.
- [ ] Los CTAs de Home navegan correctamente: "Explorar Juegos"/"Ver Todos Los Juegos"/"Insertar Moneda" → `/biblioteca`; "Crear Cuenta"/"Empezar Gratis" → `/iniciar-sesion`; "Ver Salón" → `/salon-de-la-fama`.
- [ ] `npm run lint` y `npm run build` pasan sin errores.
- [ ] No existe ninguna pantalla ni ruta de "Acerca de" añadida por este spec.

## Decisiones tomadas y descartadas

- **`/` pasa a ser Home; la Biblioteca se mueve a `/biblioteca`** — replica la estructura del Nav del template (Inicio y Biblioteca como rutas separadas). Se descartó dejar la Biblioteca en `/` y ubicar Home en otra ruta (ej. `/inicio`), porque no reflejaría el comportamiento real del template ni el rol de "portada" que cumple Home ahí.
- **About queda fuera de este spec** — el folder de referencia se llama "home-about" pero el pedido fue específicamente el home page; About se implementará en un spec independiente.
- **Datos de "Actividad en Vivo" hardcodeados como constantes locales en `app/page.tsx`**, en vez de generarlos con `seededScores`/`PLAYERS` — son contenido decorativo de landing, no un leaderboard real; se descartó mezclarlos con los datos "reales" usados en Detalle/Salón de la Fama para no implicar que reflejan partidas reales.
- **Mini-rail con un componente `MiniCard` propio**, no reutilizando `GameCard` — el template usa una tarjeta más simple (sin score badge) para esta sección; forzar la reutilización de `GameCard` se alejaría visualmente del template.
- **`useReveal` como hook local dentro de `app/page.tsx`**, no como utilidad compartida en `lib/` — en este spec solo lo usa Home; se evita crear una abstracción compartida antes de que About (que usa el mismo patrón) entre en alcance.
- **Sin redirect desde ninguna URL antigua hacia `/biblioteca`** — la Biblioteca nunca tuvo una URL pública distinta de `/` fuera de este proyecto en desarrollo, así que no aplica una migración de URLs con usuarios reales.

## Riesgos identificados

- Mover `/` de Biblioteca a Home cambia el significado de la URL raíz de la app; cualquier acceso directo a `/` esperando ver el catálogo de juegos dejará de funcionar como antes (mitigado por el link "Explorar Juegos" del hero y el nuevo link "Biblioteca" en el Nav).
- El CSS de Home incluye gradientes de texto (`background-clip: text`) y animaciones (`float`, `bounce`) que deben convivir con el reset/preflight de Tailwind v4, igual que el resto del CSS portado en SPEC 01.
- `app/page.tsx` pasa de Server Component (implícito) a Client Component (`"use client"`) por el hook `useReveal`; hay que verificar que esto no afecte negativamente el SEO/first paint de la nueva página de aterrizaje, que es la más visitada del sitio.
