# M&S Trenzas

Web app profesional para M&S Trenzas: servicios, catálogo, galería, extensiones 100% Human Hair, agenda de citas, panel administrativo, Supabase y PWA básica.

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS, componentes estilo shadcn/ui
- **Supabase**: base de datos Postgres, Auth, Storage
- Acceso a datos vía conexión Postgres directa (`pg`) usando el connection pooler de Supabase
- React Hook Form + Zod, Lucide React, PWA básica

> **Arquitectura de datos:** toda la lógica de datos vive en `src/lib/local-db.ts` y consulta Postgres (Supabase) a través de `src/lib/db/pg.ts`. Las imágenes (servicios y fotos de colaboradores) se guardan en Supabase Storage. No se usa base de datos en disco, por lo que la app funciona en entornos serverless como Vercel.

## Requisitos

- Node.js >= 22.5.0
- Una cuenta gratuita de Supabase
- Una cuenta gratuita de Vercel

## 1. Configurar Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. **SQL Editor** → pega el contenido de [`supabase/schema.sql`](supabase/schema.sql) → **Run**.
   - Crea todas las tablas y los buckets de Storage públicos (`services`, `gallery`, `products`, `booking-references`, `staff-avatars`).
   - Es seguro re-ejecutarlo (usa `create ... if not exists`).
3. Toma nota de las credenciales:
   - **Project Settings → API**: `Project URL`, `anon public key`, `service_role key`.
   - **Project Settings → Database → Connection string → "Transaction pooler"** (puerto **6543**): es la cadena para `SUPABASE_DB_URL`. Reemplaza `[PASSWORD]` por la contraseña de la base de datos.

> Los datos por defecto (colaboradoras de ejemplo, horarios, productos, menús y páginas de agenda) se siembran automáticamente la primera vez que la app consulta la base de datos vacía.

## 2. Variables de entorno

Copia `.env.example` a `.env.local` y complétalas:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_DB_URL=postgresql://postgres.xxxx:[PASSWORD]@aws-0-...pooler.supabase.com:6543/postgres
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ADMIN_USERNAME=argenis
ADMIN_EMAIL=argenis@ms-trenzas.local
ADMIN_PASSWORD=tu-contraseña
ADMIN_SESSION_SECRET=una-cadena-larga-y-aleatoria
```

- `SUPABASE_SERVICE_ROLE_KEY` y `SUPABASE_DB_URL` son **secretos**: solo en el servidor, nunca en componentes cliente.
- `ADMIN_SESSION_SECRET` firma la cookie de sesión del panel y es **obligatorio en producción**.
- El super admin entra en `/admin/login` con `ADMIN_USERNAME` / `ADMIN_PASSWORD`.

## 3. Desarrollo local

```bash
cd ms-trenzas
npm install
npm run dev
```

Abre `http://localhost:3000`. El panel está en `http://localhost:3000/admin/login`.

> En Windows, si la ruta del proyecto contiene `&` o espacios y `npm run dev`/`npm run build` falla con un error de parseo, ejecuta Next directamente:
> ```bash
> node node_modules/next/dist/bin/next dev
> node node_modules/next/dist/bin/next build
> ```

## 4. Deploy en Vercel

1. Sube el proyecto a GitHub (la raíz del repo puede contener la carpeta `ms-trenzas/`).
2. En Vercel → **Add New → Project** → importa el repositorio.
3. **Root Directory:** selecciona `ms-trenzas` (donde está el `package.json` de Next).
4. Framework: **Next.js** (autodetectado). No necesitas comandos personalizados.
5. **Environment Variables:** agrega TODAS las del paso 2:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_DB_URL` (cadena del **Transaction pooler**, puerto 6543)
   - `NEXT_PUBLIC_SITE_URL` (la URL final de Vercel, p. ej. `https://ms-trenzas.vercel.app`)
   - `ADMIN_USERNAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`
6. **Deploy.**
7. Tras el primer deploy, actualiza `NEXT_PUBLIC_SITE_URL` con la URL real y vuelve a desplegar.
8. (Opcional) Conecta un dominio personalizado.

> Importante: usa el **Transaction pooler** (no la conexión directa) para que las funciones serverless de Vercel no agoten las conexiones de Postgres.

## Estructura de datos (Supabase)

Tablas principales: `profiles`, `staff_members`, `staff_services`, `staff_business_hours`,
`staff_availability_exceptions`, `business_hours`, `availability_exceptions`,
`appointment_bookings`, `site_settings`, `booking_menu_items`, `agenda_pages`,
`service_overrides`, `custom_services`, `products`.

Los servicios "base" se definen en `src/lib/data.ts` y se pueden personalizar desde el panel (se guardan como `service_overrides`). Los servicios creados desde el panel se guardan en `custom_services`.

## Rutas

Públicas: `/`, `/servicios`, `/catalogo`, `/catalogo/[slug]`, `/agendar/servicio/[slug]`,
`/agendar/dama`, `/agendar/caballero`, `/agendar/extensiones-humanas`,
`/agendar/informacion-antes-de-agendar`, `/extensiones-humanas`, `/antes-de-agendar`,
`/galeria`, `/contacto`, `/productos`.

Privadas (`/admin/*`): login, dashboard, servicios, servicios-agenda, disponibilidad,
calendario, mi-calendario, galería, citas, productos, equipo/colaboradores, configuración.
Protegidas por `middleware.ts` (cookie de sesión) + verificación de sesión en cada API.

## PWA

`public/manifest.json`, `public/icons/icon.svg`, `public/sw.js`, registro de service worker en producción y metadata en `src/app/layout.tsx`.
