import { supabase } from '../lib/supabase'

const BUCKET = 'product-images'

/**
 * Sube un archivo de imagen al bucket de Supabase Storage.
 * Devuelve la URL pública del archivo.
 */
export async function subirImagenProducto(archivo: File, productoId?: string): Promise<string> {
  const extension = archivo.name.split('.').pop() ?? 'jpg'
  const carpeta = productoId ?? 'temp'
  const nombre = `${carpeta}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(nombre, archivo, {
      cacheControl: '3600',
      upsert: false,
      contentType: archivo.type,
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
