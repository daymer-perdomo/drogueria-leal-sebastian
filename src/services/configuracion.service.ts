import { supabase } from '../lib/supabase'

export async function getConfig(clave: string): Promise<string | null> {
  const { data } = await supabase
    .from('configuracion')
    .select('valor')
    .eq('id', clave)
    .single()
  return data?.valor ?? null
}

export async function getConfigs(claves: string[]): Promise<Record<string, string>> {
  const { data } = await supabase
    .from('configuracion')
    .select('id, valor')
    .in('id', claves)
  const result: Record<string, string> = {}
  for (const row of data ?? []) result[row.id] = row.valor
  return result
}

export async function setConfig(clave: string, valor: string): Promise<void> {
  const { error } = await supabase
    .from('configuracion')
    .upsert({ id: clave, valor, updated_at: new Date().toISOString() })
  if (error) throw error
}

export async function setConfigs(entradas: Record<string, string>): Promise<void> {
  const rows = Object.entries(entradas).map(([id, valor]) => ({
    id, valor, updated_at: new Date().toISOString(),
  }))
  const { error } = await supabase.from('configuracion').upsert(rows)
  if (error) throw error
}
