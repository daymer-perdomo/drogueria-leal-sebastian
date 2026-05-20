import { defineStore } from 'pinia'
import { ref } from 'vue'

export type TipoNotificacion = 'exito' | 'error' | 'advertencia' | 'info'

export interface Notificacion {
  id: string
  tipo: TipoNotificacion
  mensaje: string
  duracionMs: number
}

export const useUiStore = defineStore('ui', () => {
  const notificaciones = ref<Notificacion[]>([])
  const cargandoGlobal = ref(false)

  function mostrarNotificacion(
    mensaje: string,
    tipo: TipoNotificacion = 'info',
    duracionMs = 4000,
  ) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    notificaciones.value.push({ id, tipo, mensaje, duracionMs })
    setTimeout(() => cerrarNotificacion(id), duracionMs)
  }

  function cerrarNotificacion(id: string) {
    notificaciones.value = notificaciones.value.filter((n) => n.id !== id)
  }

  function mostrarExito(mensaje: string) {
    mostrarNotificacion(mensaje, 'exito')
  }

  function mostrarError(mensaje: string) {
    mostrarNotificacion(mensaje, 'error', 6000)
  }

  function mostrarAdvertencia(mensaje: string) {
    mostrarNotificacion(mensaje, 'advertencia')
  }

  function setCargandoGlobal(valor: boolean) {
    cargandoGlobal.value = valor
  }

  return {
    notificaciones,
    cargandoGlobal,
    mostrarNotificacion,
    cerrarNotificacion,
    mostrarExito,
    mostrarError,
    mostrarAdvertencia,
    setCargandoGlobal,
  }
})
