# Auditoría de marca, catálogo y experiencia web

Fecha de revisión: 26 de octubre de 2026.

## Fuentes revisadas

- Manual de uso de M&S Estudio, edición 2026.
- Catálogo compartido en Canva. Se tomaron únicamente categoría, imagen, nombre del servicio, duración y precio; no se reutilizaron sus composiciones, tipografías ni elementos de diseño.
- Aplicación Next.js en este repositorio: páginas públicas, catálogo, reservas, administración, servicios API, almacenamiento de imágenes, valores iniciales y configuración de marca.

## Lectura de la nueva identidad

| Elemento | Lectura del manual | Aplicación en la web |
| --- | --- | --- |
| Nombre | M&S Estudio, con el lema «El arte de transformar». | Se actualizan encabezados, panel, pie, metadata y avisos de la app. «M&S Trenzas» se conserva como término de búsqueda y como alias de compatibilidad con contenido antiguo. |
| Símbolo | El monograma M&S se combina con la silueta de una mujer y una trenza; el símbolo independiente permite usos compactos. | Logo principal en el sitio, versión clara sobre fondos oscuros y símbolo independiente en navegación del panel e icono de la PWA. |
| Morado oscuro | `#310032`, color dominante de marca. Aporta profundidad y reconocimiento. | Navegación, botones y acentos principales. |
| Ciruela | `#330428`, tono de apoyo. | Superficies y acentos secundarios; mantiene contraste con el morado dominante. |
| Fondos claros | El manual permite fondos luminosos para dar contraste y balance a la identidad. | `#FFF8FC` y superficies blancas, con texto oscuro y controles legibles. No se conserva el rosa/dorado de la identidad anterior. |
| TAN Pearl | Tipografía de exhibición para títulos breves y frases de impacto. Su personalidad es ornamental y de alto contraste. | La familia no está incluida en el repositorio. Se usa Cormorant Garamond como sustituto editorial temporal para títulos. |
| Frunchy Sage | Recurso expresivo para frases cortas o detalles; el manual desaconseja usarla en párrafos, precios, instrucciones y horarios. | La familia no está incluida en el repositorio. El cuerpo usa DM Sans para conservar lectura clara en móvil, formularios y precios. |
| Fotografía | El catálogo debe ayudar a identificar el servicio y orientar la elección. | Se usan las fotos extraídas del catálogo como imágenes de servicio. No se imita la diagramación de Canva. |

Los PNG de marca se extrajeron de las páginas de identidad del manual, conservando las formas oficiales y preparando versiones para fondos claros, oscuros y el icono de aplicación. Los colores se aplicaron a tokens de Tailwind, CSS, tema configurable, encabezado, pie, panel y PWA. El cambio del tema se hace al leer configuraciones antiguas; no modifica registros de configuración guardados en la base de datos.

### Tipografía y contraste

Cormorant Garamond mantiene una voz editorial en títulos; DM Sans da prioridad a la lectura de controles y texto cotidiano. Son sustitutos, no las tipografías corporativas exactas. Si M&S proporciona los archivos autorizados de TAN Pearl y Frunchy Sage, pueden integrarse para reproducir la especificación tipográfica con fidelidad. Frunchy Sage debe reservarse para detalles breves, nunca para información que el cliente necesite leer con rapidez.

## Catálogo Canva aplicado

El catálogo estructurado está en `src/data/catalogo-2026.json`. Contiene 46 servicios y cada foto referenciada existe en `public/services/catalogo-2026/`.

| Categoría | Servicios |
| --- | ---: |
| Trenzas sueltas | 12 |
| Peinados especiales | 9 |
| Trenzas pegadas para caballero | 8 |
| Trenzas sueltas para caballero | 6 |
| Butterfly Locs | 6 |
| Flat y Barrel Twist para caballero | 5 |
| **Total** | **46** |

Las fichas muestran imagen, nombre, categoría, duración y precio, y permiten iniciar una reserva. Se preservan nombres que aparecen más de una vez cuando la foto, precio o duración identifican una variante distinta; no son duplicados que deban borrarse. El formato de duración visible se mantiene además de los minutos que usa el motor de agenda, para no reducir rangos como «4–5 horas» a una duración visual imprecisa.

## Hallazgos y correcciones de la auditoría

| Hallazgo | Corrección aplicada |
| --- | --- |
| La interfaz, los valores iniciales y el PWA mezclaban la identidad anterior con el manual nuevo. | Se actualizan marca, colores, recursos, metadata, navegación del panel y avisos. Las configuraciones guardadas con valores antiguos se adaptan al mostrarse. |
| El catálogo importado aparecía con «Cotizar» y perdía las etiquetas de precio y duración al combinarse con la base de datos. | La combinación conserva las etiquetas del catálogo cuando todavía no existe una personalización del negocio. |
| Los servicios permitían reservar, pero no se ofrecían a la única integrante activa del equipo cuando no tenían asignaciones individuales. | «Cualquier colaboradora activa» incluye al equipo activo sin insertar personal ficticio ni crear escrituras sintéticas en la base de datos. El formulario explica la opción y permite asignación individual cuando se desactiva. |
| La carga inicial de opciones de agenda volvía a escribir valores por defecto y podía reemplazar ediciones del panel. | Los valores iniciales solo se insertan cuando la tabla está vacía. |
| Había colaboradores, clientes de ejemplo, elementos de galería/productos y excepciones de disponibilidad ficticios en los valores locales. | Se eliminan los datos ficticios del arranque. Las horas iniciales quedan inactivas hasta configurar el horario real. No se eliminan datos guardados del negocio. |
| El teléfono de WhatsApp tenía un valor fijo en el código, lo que podía abrir un contacto incorrecto. | Se elimina el número predeterminado; las acciones de WhatsApp se muestran solo cuando se configuró un número real. La cita sigue mostrando confirmación aunque WhatsApp no esté configurado. |
| Una solicitud de cita con JSON inválido podía fallar como error interno y los conflictos de horario no tenían respuesta clara. | Se valida el cuerpo antes de crear la cita y se devuelven códigos 400/409 para solicitud inválida o conflicto de disponibilidad. |
| Rutas antiguas de servicios, colaboradores y tablas duplicadas complicaban encontrar el flujo vigente. | Las rutas de compatibilidad redirigen al catálogo o a las pantallas canónicas del equipo; se retiran dos componentes de tabla sin referencias. |
| El service worker y la prueba de notificaciones seguían usando el icono o nombre anterior. | Se cambian a los recursos de M&S Estudio y se versiona la caché estática para actualizar los dispositivos instalados. |

## Administración y operación

La administración de servicios está en `/admin/servicios-agenda`. Desde ahí se pueden crear y editar servicios, subir una foto desde el dispositivo, definir categoría, descripción, precio, duración, visibilidad, reglas de reserva, asignación del equipo y requisitos opcionales. La página muestra una vista previa antes de guardar. Los datos se guardan mediante las API existentes y Supabase; no dependen de una edición de código para añadir servicios.

Antes de aceptar citas, la persona administradora debe confirmar desde el panel los días y horas reales de atención, mantener activo al personal que puede recibir citas y configurar el WhatsApp de negocio si quiere ofrecer contacto por ese medio. Los datos reales ya guardados en el servidor se conservan. Esta rama no modifica la base de datos ni publica automáticamente los cambios.

## Archivos principales

- Marca y contenido inicial: `src/lib/super-panel-defaults.ts`.
- Compatibilidad con configuración antigua: `src/lib/super-panel.ts`.
- Catálogo extraído: `src/data/catalogo-2026.json` y `public/services/catalogo-2026/`.
- Panel de servicios: `src/app/admin/servicios-agenda/` y `src/components/admin/ServiceAgendaForm.tsx`.
- Citas: `src/app/api/appointments/route.ts`, `src/lib/appointments.ts` y `src/lib/local-db.ts`.
- PWA: `public/manifest.json` y `public/sw.js`.
