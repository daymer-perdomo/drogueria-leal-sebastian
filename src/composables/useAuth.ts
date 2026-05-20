import { storeToRefs } from 'pinia'
import { useAuthStore } from '../stores/auth.store'
import { useNotification } from './useNotification'

/**
 * Composable de autenticación. Orquesta el store + notificaciones.
 */
export function useAuth() {
  const store = useAuthStore()
  const { user, cargando, estaAutenticado, esAdmin, esCliente } = storeToRefs(store)
  const notif = useNotification()

  async function login(email: string, password: string): Promise<boolean> {
    try {
      await store.login(email, password)
      notif.exito('¡Bienvenido de vuelta!')
      return true
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al iniciar sesión'
      notif.error(mensaje)
      return false
    }
  }

  async function registro(
    email: string,
    password: string,
    nombre: string,
    telefono?: string,
  ): Promise<boolean> {
    try {
      await store.registro(email, password, nombre, telefono)
      notif.exito('¡Cuenta creada exitosamente!')
      return true
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al registrar usuario'
      notif.error(mensaje)
      return false
    }
  }

  async function logout(): Promise<void> {
    await store.logout()
    notif.info('Sesión cerrada')
  }

  return {
    user,
    cargando,
    estaAutenticado,
    esAdmin,
    esCliente,
    login,
    registro,
    logout,
    inicializar: store.inicializar,
  }
}
