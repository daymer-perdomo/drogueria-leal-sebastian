import { supabase } from '../lib/supabase'

export interface Banner {
  id: string
  imagen_url: string
  titulo: string | null
  subtitulo: string | null
  enlace: string | null
  orden: number
  activo: boolean
  created_at?: string
}

export interface CrearBannerInput {
  imagen_url: string
  titulo?: string
  subtitulo?: string
  enlace?: string
  orden?: number
}

export async function listarBanners(soloActivos = true): Promise<Banner[]> {
  let query = supabase.from('banners').select('*').order('orden')
  if (soloActivos) query = query.eq('activo', true)
  const { data, error } = await query
  if (error) throw error
  return data as Banner[]
}

export async function crearBanner(input: CrearBannerInput): Promise<Banner> {
  const { data, error } = await supabase
    .from('banners')
    .insert({ ...input, activo: true })
    .select()
    .single()
  if (error) throw error
  return data as Banner
}

export async function actualizarBanner(id: string, input: Partial<CrearBannerInput & { activo: boolean }>): Promise<void> {
  const { error } = await supabase.from('banners').update(input).eq('id', id)
  if (error) throw error
}

export async function borrarBanner(id: string): Promise<void> {
  const { error } = await supabase.from('banners').delete().eq('id', id)
  if (error) throw error
}
