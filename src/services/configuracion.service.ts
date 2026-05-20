import { supabase } from '../lib/supabase'

export async function getConfig(clave: string): Promise<string | null> {
  const { data } = await supabase
    .from('configuracion')
    .select('valor')
    .eq('id', clave)
    .single()
  return data?.valor ?? null
}

export async function setConfig(clave: string, valor: string): Promise<void> {
  const { error } = await supabase
    .from('configuracion')
    .upsert({ id: clave, valor, updated_at: new Date().toISOString() })
  if (error) throw error
}
