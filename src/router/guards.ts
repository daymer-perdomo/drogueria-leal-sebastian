import type { RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'

export async function requireAuth(to: RouteLocationNormalized) {
  const authStore = useAuthStore()
  if (!authStore.inicializado) await authStore.inicializar()
  if (!authStore.estaAutenticado) return { name: 'login', query: { redirect: to.fullPath } }
  return true
}

export async function requireAdmin(to: RouteLocationNormalized) {
  const authStore = useAuthStore()
  if (!authStore.inicializado) await authStore.inicializar()
  if (!authStore.estaAutenticado) return { name: 'login', query: { redirect: to.fullPath } }
  if (!authStore.esAdmin) return { name: 'home' }
  return true
}

export async function redirectIfAuthenticated() {
  const authStore = useAuthStore()
  if (!authStore.inicializado) await authStore.inicializar()
  if (authStore.estaAutenticado) return authStore.esAdmin ? { name: 'admin-dashboard' } : { name: 'home' }
  return true
}
