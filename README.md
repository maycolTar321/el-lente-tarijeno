# EL LENTE TARIJEÑO — Periódico Digital

Periódico digital moderno y de alto rendimiento para el departamento de Tarija y sus provincias. Desarrollado con Next.js (App Router), TypeScript, Supabase (PostgreSQL, Autenticación y Storage) y un diseño editorial optimizado y responsive.

---

## 📌 Tabla de Contenidos

1. [Descripción del Proyecto](#descripción-del-proyecto)
2. [Tecnologías Utilizadas](#tecnologías-utilizadas)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Solución del error next/headers y Supabase](#solución-del-error-nextheaders-y-supabase)
5. [Requisitos Previos](#requisitos-previos)
6. [Instalación y Configuración Local](#instalación-y-configuración-local)
7. [Configuración de Supabase](#configuración-de-supabase)
8. [Comandos Disponibles](#comandos-disponibles)
9. [Publicación en GitHub y Despliegue en Vercel](#publicación-en-github-y-despliegue-en-vercel)
10. [Seguridad y Políticas RLS](#seguridad-y-políticas-rls)
11. [Solución de Problemas Frecuentes](#solución-de-problemas-frecuentes)

---

## 📖 Descripción del Proyecto

**EL LENTE TARIJEÑO** es un portal de periodismo digital centrado en la actualidad de Tarija, el Gran Chaco y las provincias de Bolivia.

### Funcionalidades principales:
- **Portada periodística:** Noticia principal destacada, filtro dinámico por secciones (*Tarija, Política, Gran Chaco, Provincias, Economía, Sociedad, Cultura, Deportes, Investigación*) y buscador integrado.
- **Páginas de noticias (`/noticia/[slug]`):** Formato editorial con titular, sumario, imagen de portada, cuerpo de texto formateado y metadatos dinámicos OpenGraph.
- **Panel Administrativo (`/admin`):** Gestión integral de artículos (crear, editar, eliminar, publicar o guardar borradores) con contador de estados.
- **Carga de imágenes:** Soporte directo con Supabase Storage (bucket `article-images`) con previsualización y eliminación.
- **Seguridad en capas:** Middleware de Next.js protegiendo rutas `/admin`, autenticación por sesión segura y Row Level Security (RLS) en PostgreSQL.
- **Página de Principios Editoriales (`/principios`):** Compromiso ético y transparencia periodística.

---

## 🛠 Tecnologías Utilizadas

- **Framework Web:** [Next.js 14](https://nextjs.org/) (App Router).
- **Lenguaje:** [TypeScript 5](https://www.typescriptlang.org/).
- **Biblioteca de Interfaz:** [React 18](https://react.dev/).
- **Base de Datos y Autenticación:** [Supabase](https://supabase.com/) (`@supabase/ssr` y `@supabase/supabase-js`).
- **Estilos:** CSS3 modular con tipografías *Playfair Display* y *DM Sans*, diseño editorial adaptativo (Mobile-First).
- **Linter & Calidad de Código:** ESLint (`next/core-web-vitals`).
- **Plataforma de Despliegue:** [Vercel](https://vercel.com/).

---

## 📁 Estructura del Proyecto

```text
el-lente-tarijeno/
├── app/
│   ├── admin/
│   │   ├── login/
│   │   │   └── page.tsx           # Pantalla de acceso editorial (Client Component)
│   │   ├── ui/
│   │   │   └── Dashboard.tsx      # Panel interactivo editorial (Client Component)
│   │   └── page.tsx               # Ruta protegida /admin (Server Component)
│   ├── noticia/
│   │   └── [slug]/
│   │       └── page.tsx           # Vista individual de noticia y SEO dinámico
│   ├── principios/
│   │   └── page.tsx               # Manifiesto de principios editoriales
│   ├── globals.css                # Estilos globales y paleta editorial
│   ├── layout.tsx                 # Layout raíz con metadatos generales
│   └── page.tsx                   # Portada principal (Server Component dinámico)
├── components/
│   └── Shell.tsx                  # Encabezado (Header) y Pie de página (Footer)
├── lib/
│   ├── supabase-browser.ts        # Cliente de Supabase exclusivo para el navegador
│   ├── supabase-server.ts         # Cliente de Supabase exclusivo para el servidor
│   └── utils.ts                   # Utilidades de slugs (slugify) y formateo de fechas
├── supabase/
│   ├── migrations/
│   │   └── 20261014000000_create_articles_and_storage.sql # Migración SQL completa
│   └── schema.sql                 # Esquema original de referencia
├── middleware.ts                  # Middleware de autenticación y refresco de cookies
├── next.config.mjs                # Configuración de Next.js y patrones de imágenes
├── package.json                   # Dependencias y scripts
├── tsconfig.json                  # Configuración estricta de TypeScript
├── .eslintrc.json                 # Reglas de linting
├── .env.example                   # Plantilla de variables de entorno
└── .gitignore                     # Exclusiones de Git
```

---

## 🔍 Solución del error next/headers y Supabase

### Causa del error:
Anteriormente existía un archivo único `lib/supabase.ts` que exportaba tanto `browserSupabase()` como `serverSupabase()`. Dicho archivo importaba `cookies` desde `next/headers`:
```typescript
import { createBrowserClient, createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers"; // ❌ Causante del fallo
```
Cuando un componente de cliente con `"use client"` (como `app/admin/login/page.tsx` o `app/admin/ui/Dashboard.tsx`) importaba `browserSupabase`, Webpack empaquetaba el módulo completo, intentando resolver `next/headers` en el navegador. Esto producía el error crítico en tiempo de compilación y en Vercel:

```text
Error:
You're importing a component that needs next/headers.
That only works in a Server Component which is not supported in the pages/ directory.
Import trace:
./lib/supabase.ts
./app/admin/login/page.tsx
```

### Solución aplicada:
1. **Separación estricta de responsabilidades:**
   - **`lib/supabase-browser.ts`**: Utiliza **únicamente** `createBrowserClient` de `@supabase/ssr`. No contiene ninguna referencia a `next/headers` ni a APIs de servidor. Es completamente seguro para Client Components.
   - **`lib/supabase-server.ts`**: Utiliza `createServerClient` y `cookies()` de `next/headers`. Respeta la API síncrona de Next.js 14 (`const cookieStore = cookies()`) y gestiona las cookies con bloque seguro `try/catch`. Solo se utiliza en Server Components, Route Handlers o Server Actions.
2. **Eliminación del archivo monolítico:** Se eliminó `lib/supabase.ts` y el archivo duplicado `lib/upabase-server.ts` para prevenir importaciones accidentales.
3. **Actualización de todas las importaciones:**
   - En `app/admin/login/page.tsx` y `app/admin/ui/Dashboard.tsx`:
     ```typescript
     import { browserSupabase } from "@/lib/supabase-browser";
     ```
   - En `app/admin/page.tsx`, `app/page.tsx` y `app/noticia/[slug]/page.tsx`:
     ```typescript
     import { serverSupabase } from "@/lib/supabase-server";
     ```

---

## ⚙️ Requisitos Previos

- [Node.js](https://nodejs.org/) v18.18.0 o v20+ (recomendado Node 20 o 22 LTS).
- Cuenta activa en [Supabase](https://supabase.com).
- Cuenta en [GitHub](https://github.com) y [Vercel](https://vercel.com) (para despliegue).

---

## 🚀 Instalación y Configuración Local

1. **Clonar o abrir el repositorio en tu equipo.**

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   Copia el archivo `.env.example` creando un nuevo archivo `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Rellena con tus credenciales de Supabase:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anon_o_publishable
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

4. **Iniciar servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 🗄️ Configuración de Supabase

1. **Crear proyecto:** Entra a tu consola de [Supabase](https://supabase.com/dashboard) y crea un proyecto.
2. **Ejecutar migración SQL:**
   - Ve a la sección **SQL Editor**.
   - Abre o copia el contenido de `supabase/migrations/20261014000000_create_articles_and_storage.sql`.
   - Haz clic en **Run**. Esto creará la tabla `articles`, índices, políticas de seguridad RLS y el bucket de Storage `article-images`.
3. **Crear usuario editor:**
   - Ve a **Authentication** → **Users**.
   - Haz clic en **Add user** → **Create user**.
   - Ingresa el correo y la contraseña que usarás para administrar el periódico.
4. **Configurar URLs de redirección:**
   - En **Authentication** → **URL Configuration**:
     - *Site URL*: `http://localhost:3000` (o la URL de tu dominio en Vercel).
     - *Redirect URLs*: Añade `http://localhost:3000/**` y tu dominio de producción.

---

## 💻 Comandos Disponibles

- `npm run dev`: Inicia el servidor de desarrollo en `http://localhost:3000`.
- `npm run type-check`: Ejecuta la verificación de tipos de TypeScript sin emitir archivos (`tsc --noEmit`).
- `npm run lint`: Ejecuta el análisis de código con ESLint.
- `npm run build`: Compila la aplicación para producción.
- `npm run start`: Inicia la aplicación en modo producción tras compilar.

---

## 🚢 Publicación en GitHub y Despliegue en Vercel

### Paso 1: Subir a GitHub
```bash
git init
git add .
git commit -m "feat: auditoría y reparación integral de El Lente Tarijeño"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/el-lente-tarijeno.git
git push -u origin main
```

### Paso 2: Importar en Vercel
1. Ingresa a [Vercel](https://vercel.com) e inicia sesión.
2. Haz clic en **Add New...** → **Project**.
3. Selecciona tu repositorio de GitHub `el-lente-tarijeno`.
4. En **Framework Preset**, Vercel detectará automáticamente **Next.js**.

### Paso 3: Configurar Variables de Entorno en Vercel
En la sección **Environment Variables**, añade:
- `NEXT_PUBLIC_SUPABASE_URL`: Tu URL del proyecto Supabase (ej: `https://tu-proyecto.supabase.co`).
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Tu clave pública o publishable de Supabase.
- `NEXT_PUBLIC_SITE_URL`: La URL que Vercel asigne al proyecto (ej: `https://el-lente-tarijeno.vercel.app`).

### Paso 4: Desplegar
Haz clic en **Deploy**. El proceso completará la compilación sin errores gracias a la separación de módulos SSR y la configuración estricta de rutas.

---

## 🔒 Seguridad y Políticas RLS

- **Lectura Pública:** El público general y los lectores anónimos solo pueden ver artículos con `status = 'published'` y cuya fecha `published_at` sea menor o igual al momento actual.
- **Operaciones de Escritura:** Crear, editar o eliminar noticias requiere una sesión autenticada válida (`auth.uid() IS NOT NULL`).
- **Almacenamiento de Imágenes:** Las imágenes se guardan en el bucket público `article-images`. Solo usuarios autenticados pueden subir, modificar o eliminar archivos.
- **Protección de Rutas:** El archivo `middleware.ts` intercepta cualquier intento de ingresar a `/admin/*` sin sesión activa y redirige a `/admin/login`. Si un usuario ya logueado intenta ir a `/admin/login`, se redirige automáticamente al panel `/admin`.

---

## ❓ Solución de Problemas Frecuentes

1. **¿Qué hacer si el login dice "No se pudo iniciar sesión"?**
   - Asegúrate de haber creado el usuario en **Supabase** → **Authentication** → **Users**.
   - Verifica que `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` coincidan exactamente con tu proyecto.
2. **¿Por qué la portada aparece vacía?**
   - Si no has creado noticias, verás el mensaje *"La noticia comienza aquí"*.
   - Inicia sesión en `/admin/login`, crea un artículo y asegúrate de elegir el estado **Publicar ahora**.
3. **¿Cómo cambiar el correo de contacto en el pie de página?**
   - Edita el archivo `components/Shell.tsx` en el componente `Footer` para colocar el correo oficial del periódico.
