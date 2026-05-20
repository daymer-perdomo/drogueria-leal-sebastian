import { ref } from 'vue'
import { subirImagenProducto } from '../services/upload.service'

/**
 * Composable para captura de foto con cámara y subida a Supabase Storage.
 */
export function useCamera() {
  const fotoPreview = ref<string | null>(null)
  const archivoSeleccionado = ref<File | null>(null)
  const subiendo = ref(false)
  const errorCaptura = ref<string | null>(null)

  /**
   * Maneja la selección/captura de imagen desde el input de archivo.
   */
  function manejarSeleccion(event: Event) {
    const input = event.target as HTMLInputElement
    const archivo = input.files?.[0]
    errorCaptura.value = null

    if (!archivo) {
      fotoPreview.value = null
      archivoSeleccionado.value = null
      return
    }

    if (!archivo.type.startsWith('image/')) {
      errorCaptura.value = 'Solo se permiten archivos de imagen'
      return
    }

    if (archivo.size > 10 * 1024 * 1024) {
      errorCaptura.value = 'La imagen no puede superar los 10 MB'
      return
    }

    archivoSeleccionado.value = archivo
    fotoPreview.value = URL.createObjectURL(archivo)
  }

  /**
   * Sube la imagen seleccionada a Supabase Storage.
   * @returns URL pública de la imagen o null en caso de error.
   */
  async function subirFoto(productoId?: string): Promise<string | null> {
    if (!archivoSeleccionado.value) {
      errorCaptura.value = 'No hay imagen seleccionada'
      return null
    }

    subiendo.value = true
    errorCaptura.value = null
    try {
      const url = await subirImagenProducto(archivoSeleccionado.value, productoId)
      return url
    } catch (err) {
      errorCaptura.value = err instanceof Error ? err.message : 'Error al subir la imagen'
      return null
    } finally {
      subiendo.value = false
    }
  }

  function limpiar() {
    if (fotoPreview.value) {
      URL.revokeObjectURL(fotoPreview.value)
    }
    fotoPreview.value = null
    archivoSeleccionado.value = null
    errorCaptura.value = null
  }

  return {
    fotoPreview,
    archivoSeleccionado,
    subiendo,
    errorCaptura,
    manejarSeleccion,
    subirFoto,
    limpiar,
  }
}
