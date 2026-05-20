import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'

/**
 * Guard que protege rutas que requieren autenticación.
 */
export async function requireAuth(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext,
) {
  const authStore = useAuthStore()

  if (!authStore.inicializado) {
    await authStore.inicializar()
  }

  if (!authStore.estaAutenticado) {
    return next({ name: 'login', query: { redirect: to.fullPath } })
  }

  next()
}

/**
 * Guard que protege rutas exclusivas para administradores.
 */
export async function requireAdmin(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext,
) {
  const authStore = useAuthStore()

  if (!authStore.inicializado) {
    await authStore.inicializar()
  }

  if (!authStore.estaAutenticado) {
    return next({ name: 'login', query: { redirect: to.fullPath } })
  }

  if (!authStore.esAdmin) {
    return next({ name: 'home' })
  }

  next()
}

/**
 * Guard que redirige a home si el usuario ya está autenticado (para login/registro).
 */
export async function redirectIfAuthenticated(
  _to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext,
) {
  const authStore = useAuthStore()

  if (!authStore.inicializado) {
    await authStore.inicializar()
  }

  if (authStore.estaAutenticado) {
    return next({ name: 'home' })
  }

  next()
}
