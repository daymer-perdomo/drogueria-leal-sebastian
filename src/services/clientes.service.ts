import { supabase } from '../lib/supabase'
import type { Cliente } from '../types/cliente.types'

export async function listarClientes(): Promise<Cliente[]> {
  const { data, error } = await supabase
    .from('clientes')
    .select('*, perfiles(nombre, telefono)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map((c: any) => ({
    id: c.id,
    email: c.email,
    activo: c.activo,
    notas: c.notas,
    created_at: c.created_at,
    nombre: c.perfiles?.nombre ?? '',
    telefono: c.perfiles?.telefono ?? null,
  }))
}

export async function toggleActivo(id: string, activo: boolean): Promise<void> {
  const { error } = await supabase.from('clientes').update({ activo }).eq('id', id)
  if (error) throw error
}

export async function actualizarNotas(id: string, notas: string): Promise<void> {
  const { error } = await supabase.from('clientes').update({ notas }).eq('id', id)
  if (error) throw error
}
