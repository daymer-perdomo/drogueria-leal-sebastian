# Droguería Leal Sebastián — Plataforma E-commerce

Plataforma de comercio electrónico para farmacia, construida con Vue 3, Vite, Tailwind CSS 3 y Supabase.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Vue 3 (Composition API + `<script setup>`), Vite 8 |
| Estilos | Tailwind CSS 3, CSS Variables (design tokens) |
| Estado | Pinia |
| Routing | Vue Router 5 |
| Validación | VeeValidate 4 + Zod |
| Backend | Supabase (Auth, PostgreSQL, Storage, Edge Functions) |
| Email | Resend (vía Edge Function) |

## Requisitos previos

- Node.js 20+
- pnpm 8+ (`npm i -g pnpm`)
- Proyecto en [Supabase](https://supabase.com)

## Instalación

```bash
# 1. Instalar dependencias
pnpm install

# 2. Configurar variables de entorno
cp .env.example .env.local
# Edita .env.local con tus credenciales de Supabase

# 3. Aplicar migraciones en Supabase
# Copia el contenido de supabase/migrations/001_initial_schema.sql
# y ejecútalo en el SQL Editor de Supabase Dashboard

# 4. Iniciar servidor de desarrollo
pnpm dev
```

## Variables de entorno requeridas

| Variable | Descripción |
|----------|-------------|
| `VITE_SUPABASE_URL` | URL de tu proyecto Supabase (Settings > API) |
| `VITE_SUPABASE_ANON_KEY` | Clave pública anon de Supabase |

Las variables `RESEND_API_KEY` y `FROM_EMAIL` van como **secrets de la Edge Function**, nunca en el frontend.

## Crear usuario administrador

1. Registra un usuario desde `/registro`
2. En el SQL Editor de Supabase ejecuta:
   ```sql
   update public.perfiles set rol = 'admin' where id = '<uuid-del-usuario>';
   ```
3. Accede a `/admin`

## Estructura del proyecto

```
src/
├── assets/styles/        ← design-tokens.css + main.css
├── components/
│   ├── ui/               ← AppButton, AppInput, AppCard, AppBadge, AppModal, ToastContainer
│   ├── layout/           ← AppNavbar, AppFooter
│   ├── product/          ← ProductCard, ProductGrid
│   └── cart/             ← CartDrawer
├── composables/          ← useAuth, useCart, useProducts, useCamera, useNotification, useValidation
├── services/             ← auth, products, categories, orders, news, upload, email
├── validators/           ← Schemas Zod: auth, product, order
├── stores/               ← auth.store, cart.store, ui.store
├── views/
│   ├── public/           ← Home, Catalog, ProductDetail, News, Login, Register, MyOrders, NotFound
│   └── admin/            ← AdminLayout, Dashboard, Products, CaptureProduct, Orders, NewsAdmin
├── router/               ← index.ts + guards.ts
├── lib/                  ← supabase.ts (singleton)
├── constants/            ← categories.ts (categorías con campos dinámicos)
└── types/                ← product, category, user, order, database
supabase/
├── migrations/           ← 001_initial_schema.sql
└── functions/
    └── send-email/       ← Edge Function con Resend
```

## Funcionalidades

### Tienda pública
- Catálogo con filtros por categoría y búsqueda en tiempo real
- Detalle de producto con galería de imágenes y campos extra
- Carrito persistente en `localStorage` con drawer lateral
- Checkout para usuarios autenticados
- Noticias de salud

### Panel de administración (`/admin`)
- Dashboard con métricas básicas
- Gestión de productos (activar/desactivar)
- **Captura rápida con cámara** (`/admin/capturar-producto`)
  - Foto con cámara trasera del móvil via `<input capture="environment">`
  - Formulario dinámico según la categoría seleccionada
- Gestión de órdenes con cambio de estado
- Gestión de noticias (crear, publicar, eliminar)

## Despliegue en producción

```bash
pnpm build
# Los archivos estáticos quedan en dist/
```

Deploy recomendado: **Vercel** o **Netlify** (configurar variables de entorno en el panel).

Para la Edge Function:
```bash
supabase functions deploy send-email --project-ref <tu-ref>
supabase secrets set RESEND_API_KEY=re_xxx FROM_EMAIL=noreply@tudominio.com
```
# drogueria-leal-sebastian
