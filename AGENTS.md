# AGENTS.md - M&S Trenzas

## Objetivo del proyecto

Crear una web app profesional, moderna, administrable y responsive para M&S Trenzas, negocio especializado en trenzas africanas, postura de extensiones y extensiones 100% Human Hair.

## Principios

- No copiar literalmente webs de referencia.
- Mantener una identidad visual propia.
- Priorizar experiencia movil.
- Mantener el codigo limpio, modular y reutilizable.
- Toda informacion editable debe venir de Supabase cuando sea posible.
- El panel administrativo debe ser simple y usable desde celular.
- La web debe transmitir confianza, belleza, profesionalismo y cercania.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase
- PWA
- Vercel

## Estilo visual

- Elegante
- Femenino
- Moderno
- Limpio
- Calido
- Profesional

Paleta real del logo:

- `#65004D`
- `#C184A8`
- `#B97CA2`
- `#FFF8FC`
- `#F7EAF3`
- `#C8A45D`
- `#171217`
- `#5F5360`

## Reglas de codigo

- Usar TypeScript.
- Crear componentes reutilizables.
- Evitar repetir codigo.
- Validar formularios con Zod.
- Usar React Hook Form.
- Proteger rutas admin.
- No exponer claves privadas.
- No usar datos hardcodeados para contenido administrable.
- Mantener nombres claros.
- Crear funciones separadas para Supabase.
- Mantener diseno responsive.

## Rutas publicas

- `/`
- `/servicios`
- `/catalogo`
- `/catalogo/[slug]`
- `/agendar/servicio/[slug]`
- `/agendar/confirmacion`
- `/agendar/dama`
- `/agendar/caballero`
- `/agendar/catalogo-trenzas`
- `/agendar/extensiones-humanas`
- `/agendar/informacion-antes-de-agendar`
- `/extensiones-humanas`
- `/antes-de-agendar`
- `/galeria`
- `/contacto`

## Rutas privadas

- `/admin`
- `/admin/dashboard`
- `/admin/servicios`
- `/admin/disponibilidad`
- `/admin/calendario`
- `/admin/galeria`
- `/admin/citas`
- `/admin/citas/[id]`
- `/admin/productos`
- `/admin/configuracion`

## Prioridad de construccion

1. Estructura base
2. Layout publico
3. Home
4. Servicios
5. Catalogo
6. Formulario de citas
7. Supabase
8. Panel administrativo
9. PWA
10. README y deploy

## Tono de textos

El tono debe ser humano, femenino, elegante y confiable. Evitar textos frios o genericos.

Ejemplos:

> Agenda tu proxima transformacion

> Estilos protectores creados con detalle, tecnica y amor por el arte del cabello.

> Cada trenza es trabajada con dedicacion para que luzcas segura, hermosa y autentica.

## WhatsApp

Debe existir un boton flotante de WhatsApp visible en toda la web.

El mensaje debe poder configurarse desde el panel administrativo.

## Panel administrativo

Debe permitir administrar:

- Servicios
- Galeria
- Citas
- Disponibilidad
- Calendario
- Productos
- Configuracion general

## Importante

Si falta algun dato real como precios, direccion o WhatsApp, usar campos vacios o textos temporales como "Cotizar" en lugar de inventar informacion.
