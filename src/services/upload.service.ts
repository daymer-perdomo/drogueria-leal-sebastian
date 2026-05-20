import { supabase } from '../lib/supabase'

const BUCKET = 'product-images'
const TAMANO = 600
const CALIDAD = 0.85

function optimizarImagen(archivo: File): Promise<Blob> {
  return optimizarImagenConTamano(archivo, TAMANO, TAMANO)
}

function optimizarImagenConTamano(archivo: File, ancho: number, alto: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(archivo)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const canvas = document.createElement('canvas')
      canvas.width = ancho
      canvas.height = alto
      const ctx = canvas.getContext('2d')!
      const escala = Math.max(ancho / img.width, alto / img.height)
      const w = img.width * escala
      const h = img.height * escala
      ctx.drawImage(img, (ancho - w) / 2, (alto - h) / 2, w, h)
      canvas.toBlob(
        (blob) => { if (blob) resolve(blob); else reject(new Error('No se pudo optimizar')) },
        'image/jpeg', CALIDAD,
      )
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('No se pudo cargar')) }
    img.src = url
  })
}

/**
 * Sube un banner optimizado a 1200×450 JPEG.
 */
export async function subirImagenBanner(archivo: File): Promise<string> {
  const blob = await optimizarImagenConTamano(archivo, 1200, 500)
  const nombre = `banners/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`
  const { error } = await supabase.storage.from(BUCKET).upload(nombre, blob, {
    cacheControl: '3600', upsert: false, contentType: 'image/jpeg',
  })
  if (error) throw error
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(nombre)
  return data.publicUrl
}

/**
 * Optimiza la imagen a 600×600 JPEG y la sube al bucket de Supabase Storage.
 * Devuelve la URL pública del archivo.
 */
export async function subirImagenProducto(archivo: File, productoId?: string): Promise<string> {
  const blob = await optimizarImagen(archivo)
  const carpeta = productoId ?? 'temp'
  const nombre = `${carpeta}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(nombre, blob, {
      cacheControl: '3600',
      upsert: false,
      contentType: 'image/jpeg',
    })

  if (error) throw error

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(nombre)
  return data.publicUrl
}

/**
 * Elimina una imagen del bucket dado su path completo.
 */
export async function eliminarImagen(path: string): Promise<void> {
  const rutaRelativa = path.split(`/${BUCKET}/`).pop()
  if (!rutaRelativa) return

  const { error } = await supabase.storage.from(BUCKET).remove([rutaRelativa])
  if (error) throw error
}

/**
 * Extrae el path relativo desde una URL pública de Supabase Storage.
 */
export function extraerPathDeUrl(url: string): string {
  const partes = url.split(`/${BUCKET}/`)
  return partes.length > 1 ? (partes[1] as string) : url
}
