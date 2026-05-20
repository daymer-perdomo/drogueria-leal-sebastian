import { useUiStore } from '../stores/ui.store'

/**
 * Expone los métodos de notificación del store de UI como composable.
 */
export function useNotification() {
  const ui = useUiStore()

  return {
    exito: ui.mostrarExito,
    error: ui.mostrarError,
    advertencia: ui.mostrarAdvertencia,
    info: (msg: string) => ui.mostrarNotificacion(msg, 'info'),
  }
}
