# ScoreRun

> Corré mejor. Entendé tu carrera.

PWA mobile-first para corredores amateurs y principiantes (5K–10K) sin entrenador.
El eje del producto es el **Run Score**: un número de 0 a 100 que responde, en cinco
segundos, *¿cómo estoy y qué hago hoy?*

Filosofía: **menos datos, más decisiones**. Si un elemento no ayuda a responder esa
pregunta, no entra.

## Stack

| Capa | Elección |
|---|---|
| Front | Vite + React 18 + Tailwind |
| Datos / auth | Supabase (Postgres, Auth, Edge Functions) |
| Estado | Zustand (sesión) + TanStack Query (datos del servidor) |
| Íconos | Phosphor Icons |
| Deploy | Netlify desde GitHub |
| PWA | `vite-plugin-pwa`, instalable desde el primer deploy |

## Arranque local

```bash
npm install
cp .env.example .env      # completá URL y anon key del proyecto de Supabase
npm run dev
```

## Supabase

1. Crear el proyecto en [supabase.com](https://supabase.com) y copiar URL y anon key al `.env`.
2. Aplicar las migraciones en orden:

```bash
supabase link --project-ref TU-REF
supabase db push
```

3. Desplegar las funciones y cargar los secretos. Cada función es **autónoma**
   (no importa módulos locales), así que también se puede pegar tal cual en el
   editor web del dashboard de Supabase:

```bash
supabase functions deploy compute-score coach detect-pr render-share-card
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
```

4. En **Auth → Providers**, dejar habilitado *Email* con contraseña. Para el MVP la
   confirmación por email está desactivada en `supabase/config.toml`.

### Edge Functions

| Función | Qué hace |
|---|---|
| `compute-score` | Calcula el Run Score y guarda valor, estado, consejo, **factores e inputs**. Nunca en el cliente. |
| `coach` | Chat del AI Coach con el contexto de los últimos 30 días. Prohíbe diagnóstico médico. |
| `detect-pr` | Detecta récords personales tras guardar una salida y publica el ítem de feed. |
| `render-share-card` | Devuelve el PNG de 1080×1350 de la tarjeta para compartir. |

### La fórmula del Run Score

Cuatro componentes normalizados a 0–100, combinados por peso (constantes en
`supabase/functions/compute-score/index.ts`, ajustables sin tocar el resto):

| Componente | Peso | Qué mide |
|---|---|---|
| Recuperación | 40% | Horas desde la última salida, ponderadas por su dureza (RPE + duración) |
| Carga | 30% | Relación aguda (7 d) / crónica (28 d). Óptimo entre 0.8 y 1.3 |
| Consistencia | 20% | Salidas de 14 días contra lo esperado según el nivel declarado |
| Tendencia | 10% | Evolución del ritmo en 28 días |

Las molestias son un **modificador multiplicativo**, no un componente: una molestia
fuerte (×0.45) manda el Score a zona de descanso sin importar lo demás.

El desglose completo se guarda en `scores.factors` y la foto de los datos en
`scores.inputs` — sin eso, el *"¿Por qué 74?"* no se puede reconstruir.

## Deploy en Netlify

Conectar el repo; `netlify.toml` ya trae build, publish y el redirect de SPA.
Cargar en **Site settings → Environment variables**: `VITE_SUPABASE_URL` y
`VITE_SUPABASE_ANON_KEY`.

## Design system

**Nocturne**: interfaz oscura y compacta, Inter en peso 500, radios de 8px, y el
acento (`#9184d9`) usado **como línea, borde y brillo — nunca como fondo saturado**.

Reglas que el código respeta y conviene no romper:

- Los botones primarios son **contorno**, no relleno.
- Nada de negro ni blanco puros: todo sale de las rampas de `tailwind.config.js`.
- La elevación en fondo oscuro es borde de 1px + oscuridad ambiental. No apilar sombras.
- Los títulos no pasan de peso 500: la jerarquía es tamaño y espacio.
- Foco de teclado con anillo de acento de 2px. Nunca el azul del navegador.
- Todos los números llevan la clase `.num` (`tabular-nums`).
- Nada de emojis: los íconos son Phosphor con trazo regular.

**Extensión propia**: los cinco colores semánticos del Score (`score.excellent` …
`score.rest`) no existen en Nocturne. Se agregaron con baja saturación y la misma
luminosidad perceptual que el acento, y solo aparecen en el número, una barra de
4px, una marca de 3px y el texto de estado.

## Estructura

```
src/
  components/    ui.jsx (botones, opciones, chips, switches, skeletons)
                 ScoreCard · TabBar · Screen · Wordmark
  lib/           supabase · score (estados y colores) · format (es-AR) · clsx
  routes/        Login · Onboarding · Home · NewWorkout · History
                 Progress · Achievements · Coach · Profile
  store/         session (Zustand)
supabase/
  migrations/    esquema, RLS, seed de logros
  functions/     compute-score · coach · detect-pr · render-share-card
```

## Estado

Implementado: acceso, onboarding de 4 pasos, Home con el Score, registro de
entrenamiento, historial, progreso, logros, coach y perfil.

Pendiente: Challenges (listado, detalle con hoja de inscripción, resultado),
Rankings alternativos, feed Social, y la UI de compartir. Las cuatro están
especificadas al detalle en el board de diseño y en el paquete de handoff.

Fuera de alcance del MVP: integraciones con Garmin / Strava / Apple Health
(la carga es manual) y panel administrativo.
