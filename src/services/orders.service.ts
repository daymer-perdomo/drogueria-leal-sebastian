import { supabase } from '../lib/supabase'
import type { Orden, CrearOrdenInput, EstadoOrden } from '../types/order.types'

/**
 * Crea una nueva orden para el usuario autenticado.
 */
export async function crearOrden(input: CrearOrdenInput): Promise<Orden> {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) throw sessionError
  if (!session?.user) throw new Error('Debes iniciar sesión para realizar un pedido')

  const { data, error } = await supabase
    .from('ordenes')
    .insert({
      user_id: session.user.id,
      items: input.items as unknown as import('../types/database.types').Json,
      total: input.total,
      estado: 'pendiente',
    })
    .select()
    .single()

  if (error) throw error
  return data as unknown as Orden
}

/**
 * Lista las órdenes del usuario autenticado.
 */
export async function listarMisOrdenes(): Promise<Orden[]> {
  const { data, error } = await supabase
    .from('ordenes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as unknown as Orden[]
}

/**
 * Lista todas las órdenes (requiere rol admin).
 */
export async function listarTodasLasOrdenes(pagina = 1, porPagina = 20): Promise<Orden[]> {
  const desde = (pagina - 1) * porPagina
  const { data, error } = await supabase
    .from('ordenes')
    .select('*')
    .order('created_at', { ascending: false })
    .range(desde, desde + porPagina - 1)

  if (error) throw error
  return data as unknown as Orden[]
}

/**
 * Obtiene una orden por su ID.
 */
export async function obtenerOrden(id: string): Promise<Orden> {
  const { data, error } = await supabase
    .from('ordenes')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as unknown as Orden
}

/**
 * Actualiza el estado de una orden (requiere rol admin).
 */
export async function actualizarEstadoOrden(id: string, estado: EstadoOrden): Promise<Orden> {
  const { data, error } = await supabase
    .from('ordenes')
    .update({ estado })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as unknown as Orden
}
