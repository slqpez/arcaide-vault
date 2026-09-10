# 03 — About: página "Acerca de" + envío de correo de contacto

**Estado:** Aprobado
**Depende de:** SPEC 02
**Fecha:** 2026-09-09

**Objetivo:** Crear la página `/acerca-de` (misión, highlights y formulario de contacto) replicando `about.jsx` del template, con el envío real del formulario vía Resend a `slqpez28@gmail.com`.

## Alcance

### Incluye

- Nueva página `/acerca-de` con las secciones de `about.jsx`:
  - Hero "Acerca de": kicker "▸ ACERCA DE", título "ACERCA DE ARCADE VAULT", párrafo de misión.
  - Fila de 3 highlights ("HECHO CON ❤️ PARA JUGADORES", "JUEGOS EN HTML — CORREN EN CUALQUIER NAVEGADOR", "PROYECTO EN CONSTANTE CRECIMIENTO") con icono pixel SVG propio (`HighlightIcon`) y colores cyan/magenta/green.
  - Banner divisor animado (`about-divider`, 24 pixeles con `pxblink`).
  - Sección de contacto: intro (kicker, título, subtítulo, 3 tips) + formulario (Nombre, Correo Electrónico, Mensaje).
  - Animación reveal-on-scroll igual que Home.
- Envío real del formulario de contacto vía **Resend**:
  - Server Action que recibe `{ name, email, msg }`, envía el correo con Resend y devuelve el resultado (éxito o error) al formulario.
  - Remitente: `onboarding@resend.dev` (dominio sandbox de Resend, sin verificación DNS).
  - Destinatario fijo: `slqpez28@gmail.com` (vía variable de entorno).
  - `reply-to` del correo enviado = correo escrito por el usuario en el formulario, para poder responder directo desde el cliente de correo.
  - Estados del formulario: idle → enviando (pendiente) → éxito (terminal `.terminal-success` del template) / error (nuevo estado, no existe en el template).
  - Validación: igual al template — solo se valida que los 3 campos no estén vacíos (shake si falta alguno); no se agrega regex de formato de email.
- Extraer el hook `useReveal` (hoy local en `app/page.tsx`) a un archivo compartido `lib/use-reveal.ts`, y actualizar `app/page.tsx` y la nueva `app/acerca-de/page.tsx` para importarlo desde ahí.
- Actualizar `components/nav.tsx`: agregar el link "Acerca de" (→ `/acerca-de`) después de "Salón de la Fama", en el nav de escritorio y en el drawer móvil, con su `isActive` correspondiente.
- Portar a `app/globals.css` el bloque de estilos "ABOUT PAGE" de `styles.css` (`.about-hero`, `.about-title`, `.about-mission`, `.highlight-row`/`.highlight`, `.about-divider`/`.div-bar`/`.div-pixels`, `.about-contact`/`.contact-grid`/`.contact-intro`/`.contact-tips`, `.contact-form`, `.terminal-success`/`.term-*`), agregado después de la sección `PRICING` existente.
- Agregar la dependencia `resend` a `package.json`.
- Crear `.env.example` con `RESEND_API_KEY=` y `CONTACT_TO_EMAIL=slqpez28@gmail.com` como referencia; la clave real de Resend se coloca en `.env.local` (no versionado) por el usuario.

### No incluye

- Cambios de contenido o diseño respecto al template: textos, highlights y copy del formulario se portan literalmente.
- Persistencia del mensaje de contacto (base de datos, archivo, log de auditoría) — el único registro es el correo enviado por Resend.
- Validación de formato de email en el cliente ni en el servidor más allá de "campo no vacío".
- Protección anti-spam (honeypot, rate limiting, CAPTCHA) — se documenta como riesgo, no se implementa en este spec.
- Dominio propio verificado en Resend — se usa el sandbox `onboarding@resend.dev`.
- Cualquier cambio a Home (`app/page.tsx`) más allá de mover `useReveal` a `lib/use-reveal.ts` sin alterar su comportamiento.

## Modelo de datos

No se introduce persistencia nueva. El único "dato" que cruza la red es la forma efímera del mensaje de contacto, usada solo como payload de la Server Action y del correo de Resend:

```ts
// Payload que recibe la Server Action de app/acerca-de/actions.ts
type ContactMessage = {
  name: string;
  email: string;
  msg: string;
};
```

No se persiste en ningún almacenamiento del proyecto.

## Plan de implementación

1. **Dependencia y variables de entorno.** Agregar `resend` a `package.json` (`npm install resend`). Crear `.env.example` con `RESEND_API_KEY=` y `CONTACT_TO_EMAIL=slqpez28@gmail.com`. El usuario coloca su clave real de Resend en `.env.local`.
   *Verificable:* `npm install` corre sin errores; `.env.example` existe y no contiene secretos reales.

2. **Extraer `useReveal`.** Mover la función `useReveal` de `app/page.tsx` a `lib/use-reveal.ts` (mismo comportamiento: `useEffect` + `IntersectionObserver` sobre `.reveal`), y actualizar `app/page.tsx` para importarla desde ahí.
   *Verificable:* Home (`/`) sigue mostrando la animación reveal-on-scroll exactamente igual que antes; `npm run build` compila sin errores.

3. **Portar CSS de About.** Copiar a `app/globals.css`, después de la sección `PRICING`, el bloque "ABOUT PAGE" de `styles.css` con todas sus clases (hero, highlights, divider, contact grid, form, terminal success).
   *Verificable:* `npm run build` compila sin errores; las pantallas existentes no cambian visualmente.

4. **Hero + highlights + divider de About.** Crear `app/acerca-de/page.tsx` (`"use client"`) con el hero (kicker, título, misión), la fila de 3 highlights (componente local `HighlightIcon` con los 3 SVG del template) y el banner divisor, usando `useReveal` de `lib/use-reveal.ts`.
   *Verificable:* `/acerca-de` muestra hero, highlights y divider idénticos al template; la animación reveal funciona al hacer scroll.

5. **Server Action de contacto.** Crear `app/acerca-de/actions.ts` con una Server Action (`"use server"`) que reciba `{ name, email, msg }`, use el SDK de `resend` para enviar un correo desde `onboarding@resend.dev` a `process.env.CONTACT_TO_EMAIL` con `reply_to` = email del formulario, y devuelva `{ ok: true }` o `{ ok: false, error }`.
   *Verificable:* invocar la Server Action manualmente (o vía formulario) con datos válidos envía un correo real que llega a `slqpez28@gmail.com`, visible también en el dashboard de logs de Resend.

6. **Formulario de contacto.** Implementar en `app/acerca-de/page.tsx` la sección de contacto (intro + tips + formulario) con estados `idle` / `pending` / `success` / `error`:
   - Validación de campos no vacíos con `shake` (igual al template).
   - Al enviar, llama a la Server Action del paso 5; mientras está pendiente, deshabilita el botón y muestra un texto de carga (ej. "▶ ENVIANDO…").
   - En éxito, muestra el bloque `.terminal-success` del template con el nombre del usuario.
   - En error, muestra un nuevo estado visual (mismo contenedor tipo terminal, con línea de error en vez de éxito) y un botón para reintentar sin perder lo escrito.
   *Verificable:* enviar el formulario con datos válidos y `RESEND_API_KEY` correcta muestra el estado de éxito y el correo llega; enviar con una API key inválida (o sin variable configurada) muestra el estado de error sin perder los datos del formulario.

7. **Nav.** Actualizar `components/nav.tsx`: agregar el link "Acerca de" (→ `/acerca-de`) después de "Salón de la Fama" en el nav de escritorio y en el drawer móvil, y extender `isActive` para resaltarlo en `/acerca-de`.
   *Verificable:* el link "Acerca de" aparece y navega correctamente; se resalta como activo solo en `/acerca-de`, en desktop y en el drawer móvil.

8. **QA final.** Ejecutar `npm run lint` y `npm run build`; probar el formulario con envío exitoso y con fallo simulado (API key inválida); revisar responsive (mobile/desktop); comparar visualmente contra `about.jsx`/`arcade-vault-standalone.html`.
   *Verificable:* lint y build pasan sin errores; ambos flujos del formulario (éxito y error) funcionan; About coincide visualmente con el template; no quedan enlaces rotos.

## Criterios de aceptación

- [ ] `/acerca-de` muestra hero, misión, 3 highlights, divider animado y sección de contacto, igual que el template.
- [ ] El link "Acerca de" existe en el Nav (desktop y drawer móvil) y navega a `/acerca-de`, resaltándose como activo solo en esa ruta.
- [ ] Enviar el formulario con los 3 campos completos y `RESEND_API_KEY` válida envía un correo real a `slqpez28@gmail.com` con `reply-to` igual al email ingresado, y muestra el estado de éxito del template.
- [ ] Enviar el formulario con algún campo vacío dispara el shake y no llama a la Server Action.
- [ ] Si el envío falla (API key inválida/ausente, error de Resend), el formulario muestra un estado de error sin perder los datos escritos, con opción de reintentar.
- [ ] `useReveal` vive en `lib/use-reveal.ts` y lo usan tanto `/` como `/acerca-de` sin duplicación de código.
- [ ] `.env.example` documenta `RESEND_API_KEY` y `CONTACT_TO_EMAIL`, sin secretos reales versionados.
- [ ] `npm run lint` y `npm run build` pasan sin errores.

## Decisiones tomadas y descartadas

- **Server Action en vez de Route Handler** para el envío del correo — es el patrón nativo de Next.js App Router para mutaciones desde un formulario cliente, evita crear y mantener una ruta `app/api/contact/route.ts` separada.
- **Remitente `onboarding@resend.dev` (sandbox)** — no hay dominio propio verificado en Resend todavía; se descarta bloquear el spec en configuración de DNS. Migrar a un dominio propio queda fuera de este spec.
- **Destinatario fijo `slqpez28@gmail.com` vía env var**, no una lista ni un formulario de configuración — es el único destino necesario hoy; se evita una abstracción de "destinatarios" sin un segundo caso de uso real.
- **`reply-to` = email del formulario** — permite responder directo sin persistencia ni backend adicional; se descartó no configurarlo porque haría más fricción responder a cada mensaje.
- **Validación mínima (solo campos no vacíos, sin regex de email)** — fiel al comportamiento del template; se acepta el riesgo de que un email mal formado rompa el `reply-to` o el envío de Resend (ver Riesgos).
- **Sin persistencia del mensaje** — no hay base de datos configurada en el proyecto (ver CLAUDE.md); el correo entregado por Resend es el único registro. Se descartó agregar logging estructurado por no tener un caso de uso que lo consuma todavía.
- **`useReveal` se extrae a `lib/use-reveal.ts`** — SPEC 02 dejó explícitamente esta extracción pendiente hasta que About necesitara el mismo patrón; este es ese momento.
- **Ruta `/acerca-de`** (no `/about`) — consistente con el resto de rutas del proyecto en español (`/biblioteca`, `/salon-de-la-fama`, `/iniciar-sesion`).
- **Sin protección anti-spam (honeypot, rate limiting, CAPTCHA)** — fuera de alcance por ahora; documentado como riesgo.

## Riesgos identificados

- **Sin validación de formato de email:** un valor no-email en el campo "Correo Electrónico" se usa igual como `reply-to` en Resend; si Resend lo rechaza, el usuario verá el estado de error genérico sin saber que la causa fue el formato del campo.
- **Sin protección anti-spam:** al no haber honeypot ni rate limiting, el formulario puede ser usado para enviar volumen de correos a `slqpez28@gmail.com` si la URL se descubre y se automatiza el envío.
- **Dependencia de variable de entorno en runtime:** si `RESEND_API_KEY` o `CONTACT_TO_EMAIL` no están configuradas en el entorno de despliegue, todo envío fallará silenciosamente hacia el estado de error; hay que documentar esto al desplegar (ej. en Vercel, configurar ambas variables de entorno de producción).
- **Remitente sandbox (`onboarding@resend.dev`):** algunos proveedores de correo pueden marcar como spam o limitar la tasa de entrega de este dominio compartido; si eso ocurre, la migración a un dominio propio verificado en Resend queda fuera de este spec.
