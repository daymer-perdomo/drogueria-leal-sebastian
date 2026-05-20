import { supabase } from '../lib/supabase'
import type { Categoria, CampoCategoria } from '../types/category.types'
import type { Json } from '../types/database.types'

/**
 * Lista todas las categorías disponibles.
 */
export async function listarCategorias(): Promise<Categoria[]> {
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .order('nombre')

  if (error) throw error
  return (data as unknown) as Categoria[]
}

/**
 * Obtiene una categoría por su slug.
 */
export async function obtenerCategoriaPorSlug(slug: string): Promise<Categoria> {
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) throw error
  return (data as unknown) as Categoria
}

/**
 * Obtiene una categoría por su ID.
 */
export async function obtenerCategoria(id: string): Promise<Categoria> {
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return (data as unknown) as Categoria
}

/**
 * Crea una nueva categoría (requiere rol admin).
 */
export async function crearCategoria(
  nombre: string,
  slug: string,
  camposSchema: CampoCategoria[],
): Promise<Categoria> {
  const { data, error } = await supabase
    .from('categorias')
    .insert({ nombre, slug, campos_schema: camposSchema as unknown as Json })
    .select()
    .single()

  if (error) throw error
  return (data as unknown) as Categoria
}
