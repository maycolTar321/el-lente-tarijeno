# EL LENTE TARIJEÑO — Diario digital

Proyecto Next.js + Supabase preparado para desarrollo local y despliegue en Vercel.

## Funciones
- Portada adaptable a móviles con categorías, búsqueda y noticia destacada.
- Página individual para cada noticia.
- Panel protegido por autenticación Supabase: crear, editar, borrar, publicar y guardar borradores.
- Subida de imagen de portada a Supabase Storage.
- PostgreSQL con Row Level Security.
- Página de principios editoriales.

## 1. Requisitos
Instala Node.js LTS (20 o 22), y crea cuentas en Supabase, Vercel y, preferiblemente, GitHub.

## 2. Configurar Supabase
1. Crea un proyecto en https://supabase.com.
2. En SQL Editor ejecuta todo `supabase/schema.sql`.
3. En Project Settings → API copia Project URL y la clave anon/publishable.
4. En Authentication → Users crea el usuario editor con correo y contraseña. No habilites registro público si no lo necesitas.
5. En Authentication → URL Configuration agrega `http://localhost:3000` y luego tu URL final de Vercel/dominio.

## 3. Ejecutar localmente
1. Copia `.env.example` a `.env.local`.
2. Pon las credenciales reales:

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_CLAVE_ANON_PUBLICA
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

3. Abre terminal en la carpeta y ejecuta:

```bash
npm install
npm run dev
```

4. Visita http://localhost:3000 y entra al panel en http://localhost:3000/admin/login.

Sin credenciales de Supabase, el inicio de sesión y guardado no funcionarán.

## 4. Publicar en Vercel
1. Sube el proyecto a un repositorio de GitHub.
2. En Vercel elige Add New → Project e importa el repositorio.
3. En Environment Variables agrega `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `NEXT_PUBLIC_SITE_URL` con valores reales.
4. Despliega.
5. Añade la URL de producción en Supabase → Authentication → URL Configuration.
6. Para dominio propio, configura el dominio en Vercel.

## 5. Publicar noticias
Abre `/admin/login`, inicia sesión con el usuario de Supabase, completa titular, resumen, contenido, categoría y autor, selecciona imagen opcional y elige Borrador o Publicar ahora. Usa la tabla para editar, ver o eliminar.

## Seguridad y límites
- La clave `service_role` nunca debe ponerse en variables `NEXT_PUBLIC_*` ni compartirse.
- RLS limita lectura pública a noticias publicadas; usuarios autenticados pueden administrar artículos. Crea solo cuentas editoriales autorizadas. Si más adelante habrá varios perfiles, conviene añadir roles específicos.
- Las imágenes del bucket son públicas para que puedan mostrarse en la web; no subas archivos privados.
- Sustituye el correo de ejemplo antes del lanzamiento.
- No hay noticias ficticias precargadas.
- Antes de abrir al público, prueba crear/editar/publicar y revisa políticas de Supabase.
