import { supabase } from '../lib/supabase'
import type { Mesa } from '../types/order.types'

export async function listarMesas(): Promise<Mesa[]> {
  const { data, error } = await supabase
    .from('mesas')
    .select('*')
    .order('nombre')
  if (error) throw error
  return data as Mesa[]
}

export async function crearMesa(nombre: string): Promise<Mesa> {
  const { data, error } = await supabase
    .from('mesas')
    .insert({ nombre: nombre.trim() })
    .select()
    .single()
  if (error) throw error
  return data as Mesa
}

export async function toggleMesa(id: string, activo: boolean): Promise<Mesa> {
  const { data, error } = await supabase
    .from('mesas')
    .update({ activo })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Mesa
}

export async function eliminarMesa(id: string): Promise<void> {
  const { error } = await supabase.from('mesas').delete().eq('id', id)
  if (error) throw error
}
