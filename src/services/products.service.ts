import { supabase } from '../lib/supabase'
import type { Producto, ProductoConCategoria, CrearProductoInput, ActualizarProductoInput, FiltrosProducto } from '../types/product.types'
import type { Json, Database } from '../types/database.types'

/**
 * Obtiene la lista de productos con filtros opcionales.
 */
export async function listarProductos(filtros: FiltrosProducto = {}): Promise<ProductoConCategoria[]> {
  let query = supabase
    .from('productos')
    .select('*, categoria:categorias(id, nombre, slug)')
    .order('created_at', { ascending: false })

  if (filtros.soloActivos !== false) {
    query = query.eq('activo', true)
  }
  if (filtros.categoriaId) {
    query = query.eq('categoria_id', filtros.categoriaId)
  }
  if (filtros.busqueda) {
    query = query.ilike('nombre', `%${filtros.busqueda}%`)
  }
  if (filtros.precioMin !== undefined) {
    query = query.gte('precio', filtros.precioMin)
  }
  if (filtros.precioMax !== undefined) {
    query = query.lte('precio', filtros.precioMax)
  }

  const pagina = filtros.pagina ?? 1
  const porPagina = filtros.porPagina ?? 20
  const desde = (pagina - 1) * porPagina
  query = query.range(desde, desde + porPagina - 1)

  const { data, error } = await query
  if (error) throw error
  return data as unknown as ProductoConCategoria[]
}

/**
 * Obtiene un producto por su ID.
 */
export async function obtenerProducto(id: string): Promise<ProductoConCategoria> {
  const { data, error } = await supabase
    .from('productos')
    .select('*, categoria:categorias(id, nombre, slug)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as unknown as ProductoConCategoria
}

/**
 * Crea un nuevo producto (requiere rol admin).
 */
export async function crearProducto(input: CrearProductoInput): Promise<Producto> {
  const { data, error } = await supabase
    .from('productos')
    .insert({
      nombre: input.nombre,
      descripcion: input.descripcion,
      precio: input.precio,
      stock: input.stock,
      categoria_id: input.categoria_id,
      imagenes: input.imagenes ?? [],
      campos_extra: (input.campos_extra ?? {}) as Json,
      activo: input.activo ?? true,
    })
    .select()
    .single()

  if (error) throw error
  return data as Producto
}

/**
 * Actualiza un producto existente (requiere rol admin).
 */
export async function actualizarProducto(input: ActualizarProductoInput): Promise<Producto> {
  const { id, campos_extra, ...restoInputs } = input
  type Update = Database['public']['Tables']['productos']['Update']
  const payload: Update = {
    ...restoInputs,
    ...(campos_extra !== undefined && { campos_extra: campos_extra as Json }),
  }
  const { data, error } = await supabase
    .from('productos')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Producto
}

/**
 * Elimina (desactiva) un producto (requiere rol admin).
 */
export async function eliminarProducto(id: string): Promise<void> {
  const { error } = await supabase
    .from('productos')
    .update({ activo: false })
    .eq('id', id)

  if (error) throw error
}

/**
 * Cuenta el total de productos según filtros.
 */
export async function contarProductos(filtros: Pick<FiltrosProducto, 'categoriaId' | 'soloActivos' | 'busqueda'> = {}): Promise<number> {
  let query = supabase.from('productos').select('id', { count: 'exact', head: true })

  if (filtros.soloActivos !== false) query = query.eq('activo', true)
  if (filtros.categoriaId) query = query.eq('categoria_id', filtros.categoriaId)
  if (filtros.busqueda) query = query.ilike('nombre', `%${filtros.busqueda}%`)

  const { count, error } = await query
  if (error) throw error
  return count ?? 0
}
