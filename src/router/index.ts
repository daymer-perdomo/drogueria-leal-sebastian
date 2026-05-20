import { createRouter, createWebHistory } from 'vue-router'
import { requireAuth, requireAdmin, redirectIfAuthenticated } from './guards'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  },
  routes: [
    // ── Rutas públicas ──────────────────────────────────────────────
    {
      path: '/',
      name: 'home',
      component: () => import('../views/public/HomeView.vue'),
      meta: { titulo: 'Inicio' },
    },
    {
      path: '/catalogo',
      name: 'catalogo',
      component: () => import('../views/public/CatalogView.vue'),
      meta: { titulo: 'Catálogo' },
    },
    {
      path: '/producto/:id',
      name: 'producto-detalle',
      component: () => import('../views/public/ProductDetailView.vue'),
      meta: { titulo: 'Producto' },
      props: true,
    },
    {
      path: '/noticias',
      name: 'noticias',
      component: () => import('../views/public/NewsView.vue'),
      meta: { titulo: 'Noticias' },
    },
    {
      path: '/quejas',
      name: 'quejas',
      component: () => import('../views/public/QuejasView.vue'),
      meta: { titulo: 'Quejas y Solicitudes' },
    },
    // ── Autenticación ───────────────────────────────────────────────
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/public/LoginView.vue'),
      meta: { titulo: 'Iniciar Sesión' },
      beforeEnter: redirectIfAuthenticated,
    },
    {
      path: '/registro',
      name: 'registro',
      component: () => import('../views/public/RegisterView.vue'),
      meta: { titulo: 'Crear Cuenta' },
      beforeEnter: redirectIfAuthenticated,
    },
    // ── Área autenticada ─────────────────────────────────────────────
    {
      path: '/mis-pedidos',
      name: 'mis-pedidos',
      component: () => import('../views/public/MyOrdersView.vue'),
      meta: { titulo: 'Mis Pedidos' },
      beforeEnter: requireAuth,
    },
    // ── Administración ───────────────────────────────────────────────
    {
      path: '/admin',
      component: () => import('../views/admin/AdminLayout.vue'),
      beforeEnter: requireAdmin,
      children: [
        {
          path: '',
          name: 'admin-dashboard',
          component: () => import('../views/admin/DashboardView.vue'),
          meta: { titulo: 'Panel Admin' },
        },
        {
          path: 'productos',
          name: 'admin-productos',
          component: () => import('../views/admin/ProductsView.vue'),
          meta: { titulo: 'Gestión de Productos' },
        },
        {
          path: 'capturar-producto',
          name: 'admin-capturar',
          component: () => import('../views/admin/CaptureProductView.vue'),
          meta: { titulo: 'Capturar Producto' },
        },
        {
          path: 'editar-producto/:id',
          name: 'admin-editar-producto',
          component: () => import('../views/admin/EditProductView.vue'),
          meta: { titulo: 'Editar Producto' },
          props: true,
        },
        {
          path: 'ordenes',
          name: 'admin-ordenes',
          component: () => import('../views/admin/OrdersView.vue'),
          meta: { titulo: 'Gestión de Órdenes' },
        },
        {
          path: 'noticias',
          name: 'admin-noticias',
          component: () => import('../views/admin/NewsAdminView.vue'),
          meta: { titulo: 'Gestión de Noticias' },
        },
        {
          path: 'quejas',
          name: 'admin-quejas',
          component: () => import('../views/admin/QuejasAdminView.vue'),
          meta: { titulo: 'Gestión de Quejas' },
        },
        {
          path: 'clientes',
          name: 'admin-clientes',
          component: () => import('../views/admin/ClientesAdminView.vue'),
          meta: { titulo: 'Gestión de Clientes' },
        },
        {
          path: 'categorias',
          name: 'admin-categorias',
          component: () => import('../views/admin/CategoriasAdminView.vue'),
          meta: { titulo: 'Gestión de Categorías' },
        },
      ],
    },
    // ── 404 ──────────────────────────────────────────────────────────
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/public/NotFoundView.vue'),
      meta: { titulo: 'Página no encontrada' },
    },
  ],
})

router.afterEach((to) => {
  const titulo = to.meta.titulo as string | undefined
  document.title = titulo
    ? `${titulo} | Droguería Leal Sebastián`
    : 'Droguería Leal Sebastián'
})

export default router
