# 01 — MVP: Pantallas visuales de Arcade Vault

**Estado:** Aprobado
**Depende de:** —
**Fecha:** 2026-09-09

**Objetivo:** Implementar la interfaz visual completa de las 5 pantallas de Arcade Vault (Biblioteca, Detalle de juego, Reproductor, Autenticación y Salón de la Fama) en Next.js App Router, replicando fielmente el diseño de `references/templates`, sin implementar lógica de juego real.

## Alcance

### Incluye

- Layout global: `Nav` (desktop + drawer móvil), footer, y fondo animado (grid en perspectiva, scanlines, viñeta).
- 5 rutas reales de App Router, con slugs en español:
  - `/` → Biblioteca
  - `/juegos/[id]` → Detalle de juego
  - `/juegos/[id]/jugar` → Reproductor
  - `/iniciar-sesion` → Auth
  - `/salon-de-la-fama` → Salón de la Fama
- Fuentes `Press Start 2P` y `JetBrains Mono` cargadas vía `next/font/google`.
- Tema visual híbrido: Tailwind v4 para layout/spacing, y CSS portado (en `globals.css` o un archivo de tema aparte) para los tokens de color y efectos que Tailwind no cubre bien (glow de neón, scanlines, grid animado, estilos CRT, animaciones tipo `flicker`/`blink`/`pulse`).
- Capa de datos mock en TypeScript (`lib/data.ts`): tipos `Game`/`ScoreRow`, arrays `GAMES`, `CATS`, `PLAYERS`, y la función determinística `seededScores`, portados desde `data.jsx`.
- **Biblioteca:** hero, buscador de texto, chips de categoría (filtrado client-side), grid de tarjetas de juego con efecto tilt al hover, estado "sin resultados".
- **Detalle:** portada (gradiente CSS), tags, descripción, stats, leaderboard con scores mock específicos del juego, botones "Jugar Ahora" y "Volver al Vault".
- **Reproductor:** HUD (jugador, puntuación, vidas, nivel) con valores fijos de ejemplo; botones Pausa/Reanudar, Fin, Salir funcionales sobre el estado de UI; arena CRT decorativa estática (sin simulación de partida); modal de fin de partida con input de iniciales, "Guardar Puntuación" (persiste en `localStorage`), "Jugar de Nuevo" (reinicia el estado) y "Volver al Vault".
- **Auth:** tabs "Iniciar Sesión"/"Crear Cuenta", formulario con sesión falsa client-side (cualquier valor es válido, persiste en `localStorage`), botón "Jugar como Invitado", botones sociales decorativos (Google/GitHub, sin funcionalidad).
- **Salón de la Fama:** tabs por juego, podio top 3, tabla de posiciones con scores mock, fila "tu mejor marca" visible solo cuando hay sesión iniciada.
- Sesión fake compartida entre pantallas vía `localStorage` (`av_user`), reflejada en `Nav` y Salón de la Fama.
- Guardado de puntuaciones en `localStorage` (`av_scores`) al finalizar una partida en el Reproductor.

### No incluye

- Cualquier lógica de juego real (canvas, motor de juego, colisiones, física, WebGL).
- Simulación automática de una partida jugándose sola (sin `setInterval` que incremente el puntaje).
- Backend/API real, base de datos, autenticación real (OAuth funcional, validación de credenciales).
- Leaderboard compartido entre usuarios reales — el guardado de puntuación es local al navegador únicamente.
- Pantalla de perfil/cuenta separada — el link "Cuenta" del menú móvil apunta a `/iniciar-sesion`, igual que el template.
- Funcionalidad real de los botones sociales (Google/GitHub).
- Tests automatizados (no hay test runner configurado en el proyecto).
- Imágenes o assets reales para las portadas de juego — se mantienen como gradientes CSS (clases `cover-*`), igual que el template.

## Modelo de datos

Todo el contenido es mock, sin persistencia server-side. Se porta desde `data.jsx`/`app.jsx` a `lib/data.ts` y `lib/session.ts`:

```ts
// lib/data.ts
export type GameCategory = "ARCADE" | "PUZZLE" | "SHOOTER" | "VERSUS";
export type GameColor = "cyan" | "magenta" | "yellow" | "green";

export interface Game {
  id: string;
  title: string;
  short: string;
  long: string;
  cat: GameCategory;
  cover: string;   // sufijo de clase CSS, ej. "cover-bricks"
  color: GameColor;
  best: number;
  plays: string;
}

export interface ScoreRow {
  rank: number;
  name: string;
  score: number;
  date: string;
}

export const GAMES: Game[];         // los 8 juegos del template
export const CATS: string[];        // ["TODOS","ARCADE","PUZZLE","SHOOTER","VERSUS"]
export const PLAYERS: string[];     // nombres para generar scores mock
export function seededScores(seed: number, count?: number): ScoreRow[]; // port exacto del algoritmo pseudoaleatorio determinístico
```

```ts
// lib/session.ts
export interface SessionUser {
  name: string;
}

export function getUser(): SessionUser | null;      // lee av_user de localStorage
export function setUser(user: SessionUser | null): void; // escribe/borra av_user
export function saveScore(entry: { game: string; score: number; name: string }): void; // push a av_scores
```

## Plan de implementación

1. **Fundamentos de tema.** Configurar `next/font/google` (Press Start 2P + JetBrains Mono) en `app/layout.tsx`. Portar tokens de color y efectos visuales (scanlines, grid animado, glow, CRT, animaciones) desde `styles.css` a `app/globals.css` combinándolos con Tailwind v4. Crear el fondo global (`av-bg`) y el layout base (`Nav` + `main` + `footer`) en `app/layout.tsx`.
   *Verificable:* el sitio compila, el fondo animado y las fuentes se ven correctamente en cualquier ruta, aunque el contenido siga siendo el scaffold por defecto.

2. **Capa de datos y sesión.** Crear `lib/data.ts` y `lib/session.ts` según el modelo de datos anterior, portados desde `data.jsx`/`app.jsx`.
   *Verificable:* `npm run build` (typecheck) pasa sin errores; los datos exportados coinciden en forma y cantidad con el template.

3. **Nav.** Implementar `components/nav.tsx` (client component) con logo, links Biblioteca/Salón de la Fama, contador de créditos, botón de sesión (Iniciar Sesión / nombre de usuario), y drawer móvil, enlazado a las rutas reales.
   *Verificable:* el Nav aparece en todas las páginas, resalta el link activo según la ruta actual, el drawer móvil abre/cierra, y el estado de sesión mock se refleja correctamente.

4. **Biblioteca (`/`).** Implementar `app/page.tsx` con hero, buscador, chips de categoría y grid de tarjetas (efecto tilt al hover), usando `lib/data.ts`.
   *Verificable:* buscar y filtrar por categoría funciona en el cliente; cada tarjeta enlaza a `/juegos/[id]`; el estado "sin resultados" se muestra cuando corresponde.

5. **Detalle (`/juegos/[id]`).** Implementar la página con portada, tags, descripción, stats y leaderboard (`seededScores`), botones "Jugar Ahora"/"Volver al Vault".
   *Verificable:* cada `id` de `GAMES` renderiza su detalle correctamente; un `id` inexistente dispara `notFound()`.

6. **Reproductor (`/juegos/[id]/jugar`).** Implementar el HUD con estado interactivo real de UI (Pausa/Reanudar, Fin, Salir), arena CRT decorativa estática, y modal de fin de partida (guardar puntuación vía `lib/session.ts`, reiniciar, volver). Sin simulación automática de puntaje.
   *Verificable:* todos los botones cambian el estado de la UI como en el template; guardar puntuación persiste en `localStorage` y muestra el toast de confirmación; reiniciar limpia el estado.

7. **Auth (`/iniciar-sesion`).** Implementar tabs Iniciar Sesión/Crear Cuenta, formulario con sesión falsa (vía `lib/session.ts`, redirige a `/`), botón "Jugar como Invitado", botones sociales decorativos.
   *Verificable:* enviar el formulario con cualquier dato crea una sesión mock, redirige a Biblioteca, y el Nav refleja la sesión iniciada.

8. **Salón de la Fama (`/salon-de-la-fama`).** Implementar tabs por juego, podio top 3, tabla de posiciones y fila "tu mejor marca" condicionada a sesión iniciada.
   *Verificable:* cambiar de tab recalcula podio/tabla; la fila de usuario aparece solo con sesión iniciada.

9. **QA final.** Revisar responsive (drawer móvil, grid, tablas), ejecutar `npm run lint` y `npm run build`, y comparar visualmente cada pantalla contra `references/templates`.
   *Verificable:* lint y build pasan sin errores; las 5 pantallas coinciden visualmente con el template de referencia.

## Criterios de aceptación

- [ ] Existen las 5 rutas: `/`, `/juegos/[id]`, `/juegos/[id]/jugar`, `/iniciar-sesion`, `/salon-de-la-fama`.
- [ ] El Nav se muestra en todas las páginas, con estado activo correcto y drawer móvil funcional.
- [ ] Las fuentes Press Start 2P y JetBrains Mono cargan vía `next/font/google`.
- [ ] El fondo animado (grid en perspectiva, scanlines, viñeta) se ve en toda la app.
- [ ] Biblioteca filtra por búsqueda de texto y por categoría en tiempo real.
- [ ] Detalle muestra un leaderboard mock específico por juego.
- [ ] Reproductor permite pausar/reanudar, finalizar partida, guardar puntuación (persistida en `localStorage`) y reiniciar, sin simular el juego jugándose solo.
- [ ] Auth permite "iniciar sesión" (fake), "crear cuenta" (fake) y "jugar como invitado", persistiendo la sesión en `localStorage`.
- [ ] Salón de la Fama muestra podio + tabla por juego seleccionado, y la fila de usuario solo cuando hay sesión iniciada.
- [ ] `npm run lint` y `npm run build` pasan sin errores.
- [ ] No existe ninguna lógica de juego real (canvas, motor, colisiones).

## Decisiones tomadas y descartadas

- **Rutas reales de Next.js App Router**, en vez de la SPA con hash routing del template — es lo idiomático en Next.js y da URLs navegables. Se descartó replicar el patrón `location.hash` del template.
- **Slugs de ruta en español** (`/juegos/[id]`, `/iniciar-sesion`, `/salon-de-la-fama`) — consistente con el copy de la UI y el README, ambos en español.
- **Estilos híbridos** (Tailwind v4 + CSS portado para tokens/efectos) — se descartó portar el CSS 100% tal cual (menos alineado al stack) y también reimplementar todo en utilidades Tailwind (riesgo alto de perder fidelidad en efectos complejos como CRT/scanlines/glow).
- **Fuentes vía `next/font/google`** — se descartó mantener el `<link>` externo del template, para aprovechar self-hosting y evitar layout shift, siguiendo las convenciones actuales de Next.js.
- **Reproductor sin simulación automática de puntaje** (sin `setInterval`) — se mantiene toda la interactividad de UI (pausa, fin, guardar, reiniciar) pero se elimina la parte que finge que el juego se juega solo, respetando el alcance de "sin implementar ningún juego". Se descartaron tanto el mockup 100% estático (pierde valor demostrativo de los estados) como el port exacto del template (se acerca demasiado a simular un juego real).
- **Auth falsa client-side mantenida** (`localStorage`) — permite mostrar ambos estados de sesión en Nav y Salón de la Fama sin necesitar backend. Se descartó dejar el formulario sin funcionalidad.
- **Guardado de puntuación en `localStorage`** (`av_scores`) — igual que el template, sin conectar a un leaderboard compartido real. Se descartó dejarlo como un toast puramente visual sin persistencia.
- **Exactamente 5 pantallas + Nav**, sin pantalla de perfil/cuenta nueva — "Cuenta" en el menú móvil enlaza a `/iniciar-sesion`, igual que el template.
- **Portadas de juego como gradientes CSS** (clases `cover-*`), no imágenes — igual que el template original.

## Riesgos identificados

- El CSS portado usa `position: fixed` y animaciones globales (`.av-bg`, scanlines) que deben convivir con el reset/preflight de Tailwind v4; puede requerir ajustar especificidad o mover ese CSS fuera de las capas de Tailwind (`@layer`).
- `Nav`, `Auth`, `GamePlayer` y `Library` necesitan estado interactivo (`useState`, `localStorage`) y por lo tanto deben marcarse `"use client"`; el resto de las páginas puede quedar como Server Components. Mezclar mal esta frontera puede romper el build o el acceso a `localStorage` en el servidor.
- `seededScores` debe portarse con el mismo algoritmo exacto (LCG con la misma semilla) para que el leaderboard sea determinístico entre Detalle y Salón de la Fama, igual que en el template.
