import { supabase } from '../lib/supabase'
import type { Caja } from '../types/order.types'

export async function listarCajas(): Promise<Caja[]> {
  const { data, error } = await supabase
    .from('cajas')
    .select('*')
    .order('nombre')
  if (error) throw error
  return data as Caja[]
}

export async function crearCaja(nombre: string): Promise<Caja> {
  const { data, error } = await supabase
    .from('cajas')
    .insert({ nombre: nombre.trim() })
    .select()
    .single()
  if (error) throw error
  return data as Caja
}

export async function toggleCaja(id: string, activo: boolean): Promise<Caja> {
  const { data, error } = await supabase
    .from('cajas')
    .update({ activo })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Caja
}

export async function eliminarCaja(id: string): Promise<void> {
  const { error } = await supabase.from('cajas').delete().eq('id', id)
  if (error) throw error
}
