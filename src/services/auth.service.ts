import { supabase } from '../lib/supabase'
import type { Perfil } from '../types/user.types'

/**
 * Inicia sesión con email y contraseña.
 */
export async function iniciarSesion(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

/**
 * Registra un nuevo usuario y crea su perfil.
 */
export async function registrarUsuario(
  email: string,
  password: string,
  nombre: string,
  telefono?: string,
) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
  if (!data.user) throw new Error('No se pudo crear el usuario')

  const { error: perfilError } = await supabase.from('perfiles').insert({
    id: data.user.id,
    nombre,
    rol: 'cliente',
    telefono: telefono ?? null,
  })
  if (perfilError) throw perfilError

  return data
}

/**
 * Cierra la sesión del usuario actual.
 */
export async function cerrarSesion() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

/**
 * Envía email de recuperación de contraseña.
 */
export async function recuperarPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/nueva-password`,
  })
  if (error) throw error
}

/**
 * Obtiene el perfil del usuario autenticado.
 */
export async function obtenerPerfil(userId: string): Promise<Perfil> {
  const { data, error } = await supabase
    .from('perfiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data as Perfil
}

/**
 * Actualiza el perfil del usuario.
 */
export async function actualizarPerfil(
  userId: string,
  datos: Partial<Pick<Perfil, 'nombre' | 'telefono'>>,
) {
  const { data, error } = await supabase
    .from('perfiles')
    .update(datos)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data as Perfil
}

/**
 * Retorna la sesión activa o null.
 */
export async function obtenerSesion() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}
