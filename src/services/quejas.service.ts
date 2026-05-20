import { supabase } from '../lib/supabase'
import type { Queja, CrearQuejaInput, EstadoQueja } from '../types/queja.types'

export async function enviarQueja(input: CrearQuejaInput): Promise<Queja> {
  const { data: { session } } = await supabase.auth.getSession()

  const { data, error } = await supabase
    .from('quejas')
    .insert({
      ...input,
      user_id: session?.user?.id ?? null,
    })
    .select()
    .single()

  if (error) throw error
  return data as Queja
}

export async function listarMisQuejas(): Promise<Queja[]> {
  const { data, error } = await supabase
    .from('quejas')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Queja[]
}

export async function listarTodasLasQuejas(): Promise<Queja[]> {
  const { data, error } = await supabase
    .from('quejas')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Queja[]
}

export async function actualizarQueja(
  id: string,
  campos: { estado?: EstadoQueja; respuesta?: string },
): Promise<Queja> {
  const { data, error } = await supabase
    .from('quejas')
    .update(campos)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Queja
}
