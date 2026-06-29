# M&S Trenzas

Web app profesional para M&S Trenzas: servicios, catálogo, galería, extensiones 100% Human Hair, agenda de citas, panel administrativo, Supabase y PWA básica.

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS, componentes estilo shadcn/ui
- **Supabase**: base de datos Postgres, Auth, Storage
- Acceso a datos vía conexión Postgres directa (`pg`) usando el connection pooler de Supabase
- React Hook Form + Zod, Lucide React, PWA básica

> **Arquitectura de datos:** toda la lógica de datos vive en `src/lib/local-db.ts` y consulta Postgres (Supabase) a través de `src/lib/db/pg.ts`. Las imágenes (servicios y fotos de colaboradores) se guardan en Supabase Storage. No se usa base de datos en disco, por lo que la app funciona en entornos serverless.

## Requisitos

- Node.js >= 22.5.0
- pnpm >= 11
- Una cuenta gratuita de Supabase
- Una cuenta gratuita de Cloudflare

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
pnpm install
pnpm dev
```

Abre `http://localhost:3000`. El panel está en `http://localhost:3000/admin/login`.

> En Windows, si la ruta del proyecto contiene `&` o espacios y `npm run dev`/`npm run build` falla con un error de parseo, ejecuta Next directamente:
> ```bash
> node node_modules/next/dist/bin/next dev
> node node_modules/next/dist/bin/next build
> ```

## 4. Deploy en Cloudflare Workers Free

La app se despliega con OpenNext para Cloudflare Workers. No usa `output: "export"` y conserva SSR, route handlers, middleware y el panel administrativo.

### 4.1 Instalar dependencias

```bash
pnpm install
```

El proyecto usa `@opennextjs/cloudflare` y `wrangler`. Wrangler debe ser `3.99.0` o superior; este proyecto usa `^4.105.0`.

### 4.2 Crear cuenta e iniciar sesion

1. Crea una cuenta gratis en [Cloudflare](https://dash.cloudflare.com/).
2. Inicia sesion con Wrangler:

```bash
pnpm wrangler login
```

Verifica la sesion:

```bash
pnpm wrangler whoami
```

### 4.3 Configurar variables y secrets

Configura los secrets del Worker:

```bash
pnpm wrangler secret put NEXT_PUBLIC_SUPABASE_URL
pnpm wrangler secret put NEXT_PUBLIC_SUPABASE_ANON_KEY
pnpm wrangler secret put SUPABASE_SERVICE_ROLE_KEY
pnpm wrangler secret put SUPABASE_DB_URL
pnpm wrangler secret put ADMIN_USERNAME
pnpm wrangler secret put ADMIN_EMAIL
pnpm wrangler secret put ADMIN_PASSWORD
pnpm wrangler secret put ADMIN_SESSION_SECRET
pnpm wrangler secret put NEXT_PUBLIC_SITE_URL
```

Tambien puedes configurarlas en Cloudflare Dashboard: `Workers & Pages` -> `ms-trenzas-demo` -> `Settings` -> `Variables and Secrets`.

Aunque `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` son publicas para el navegador, el Worker tambien las necesita disponibles en runtime/build. `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL`, `ADMIN_PASSWORD` y `ADMIN_SESSION_SECRET` son secretos de servidor y nunca deben usarse en componentes cliente.

### 4.4 Probar localmente

```bash
pnpm build
pnpm build:cf
pnpm preview:cf
```

En Windows, OpenNext puede fallar al crear symlinks durante el build standalone con un error `EPERM: operation not permitted, symlink`. Si ocurre, ejecuta los comandos de Cloudflare desde WSL/Linux o habilita Developer Mode en Windows y vuelve a instalar dependencias con `pnpm install`.

Si no tienes permisos de administrador en Windows, usa el workflow de GitHub Actions incluido en `.github/workflows/deploy-cloudflare.yml`. El build corre en Ubuntu y evita el problema de symlinks.

Checklist de prueba:

- La app carga.
- `/admin` no abre sin sesion.
- Login funciona con super admin.
- `/admin/dashboard` funciona.
- `/admin/equipo` respeta permisos.
- `/admin/servicios-agenda` funciona.
- Citas y calendario funcionan.
- Supabase conecta correctamente.
- Imagenes de Supabase Storage cargan y se pueden subir desde el admin.
- No hay errores de TypeScript.
- No hay errores de hidratacion en consola.

### 4.5 Deploy

Antes del deploy confirma que Wrangler esta autenticado:

```bash
pnpm wrangler whoami
```

Luego despliega:

```bash
pnpm deploy:cf
```

El Worker se llama `ms-trenzas-demo` en `wrangler.jsonc`. Si el nombre ya existe en tu cuenta, cambia `name` por algo como `ms-trenzas-demo-joela` y vuelve a desplegar. Al finalizar, Cloudflare mostrara la URL publica `workers.dev`.

Despues del primer deploy, actualiza `NEXT_PUBLIC_SITE_URL` con la URL real generada por Cloudflare y vuelve a ejecutar `pnpm deploy:cf`.

### 4.6 Deploy sin permisos de administrador usando GitHub Actions

1. Sube este repositorio a GitHub.
2. En GitHub, abre `Settings` -> `Secrets and variables` -> `Actions` -> `New repository secret`.
3. Crea estos secrets:

```bash
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_DB_URL
NEXT_PUBLIC_SITE_URL
ADMIN_USERNAME
ADMIN_EMAIL
ADMIN_PASSWORD
ADMIN_SESSION_SECRET
```

4. El token de Cloudflare debe permitir desplegar Workers. Crealo en Cloudflare Dashboard -> `My Profile` -> `API Tokens` -> `Create Token`.
5. Al hacer push a `main`, GitHub Actions ejecuta:

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm deploy:cf
```

Tambien puedes lanzarlo manualmente desde GitHub -> `Actions` -> `Deploy to Cloudflare Workers` -> `Run workflow`.

Los secrets del Worker ya se pueden cargar con `pnpm wrangler secret put ...`, pero GitHub Actions tambien necesita las variables de la app durante el build de Next.js.

### 4.7 Notas del plan Free

- Workers Free sirve bien para una demo, pero tiene limites de CPU, requests y tamaÃ±o de bundle.
- El proyecto usa Supabase como base de datos y Storage, por lo que Cloudflare no almacena datos de negocio.
- Esta configuracion usa OpenNext sin cache persistente R2/KV para mantener la demo simple. Si luego necesitas ISR/cache persistente avanzada, agrega R2 o KV segun la documentacion de OpenNext.

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
