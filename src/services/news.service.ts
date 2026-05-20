import { supabase } from '../lib/supabase'

export interface Noticia {
  id: string
  titulo: string
  contenido: string
  imagen_url: string | null
  publicado: boolean
  created_at: string
}

/**
 * Lista las noticias publicadas para el público general.
 */
export async function listarNoticias(soloPublicadas = true): Promise<Noticia[]> {
  let query = supabase.from('noticias').select('*').order('created_at', { ascending: false })

  if (soloPublicadas) {
    query = query.eq('publicado', true)
  }

  const { data, error } = await query
  if (error) throw error
  return data as Noticia[]
}

/**
 * Obtiene una noticia por su ID.
 */
export async function obtenerNoticia(id: string): Promise<Noticia> {
  const { data, error } = await supabase
    .from('noticias')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Noticia
}

/**
 * Crea una nueva noticia (requiere rol admin).
 */
export async function crearNoticia(
  titulo: string,
  contenido: string,
  imagenUrl?: string,
): Promise<Noticia> {
  const { data, error } = await supabase
    .from('noticias')
    .insert({ titulo, contenido, imagen_url: imagenUrl ?? null, publicado: false })
    .select()
    .single()

  if (error) throw error
  return data as Noticia
}

/**
 * Actualiza una noticia existente (requiere rol admin).
 */
export async function actualizarNoticia(
  id: string,
  campos: Partial<Pick<Noticia, 'titulo' | 'contenido' | 'imagen_url' | 'publicado'>>,
): Promise<Noticia> {
  const { data, error } = await supabase
    .from('noticias')
    .update(campos)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Noticia
}

/**
 * Elimina una noticia (requiere rol admin).
 */
export async function eliminarNoticia(id: string): Promise<void> {
  const { error } = await supabase.from('noticias').delete().eq('id', id)
  if (error) throw error
}
