import { supabase } from '../lib/supabase'

export interface UsuarioAdmin {
  id: string
  email: string
  nombre: string
  rol: string
  telefono: string | null
  created_at: string
  last_sign_in_at: string | null
}

const EDGE_FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-usuarios`

async function callAdminFn(body: Record<string, unknown>): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token
  if (!token) throw new Error('Sin sesión activa')

  const res = await fetch(EDGE_FN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data?.error ?? `Error ${res.status}`)
  }
}

export async function listarUsuarios(): Promise<UsuarioAdmin[]> {
  const { data, error } = await (supabase as any).rpc('admin_listar_usuarios')
  if (error) throw error
  return data as UsuarioAdmin[]
}

export async function actualizarUsuario(
  id: string,
  nombre: string,
  telefono: string,
  rol: string,
): Promise<void> {
  await callAdminFn({ action: 'actualizar_perfil', userId: id, nombre, telefono, rol })
}

export async function cambiarPassword(id: string, password: string): Promise<void> {
  await callAdminFn({ action: 'cambiar_password', userId: id, password })
}

export async function eliminarUsuario(id: string): Promise<void> {
  await callAdminFn({ action: 'eliminar', userId: id })
}

export async function crearUsuario(
  email: string,
  password: string,
  nombre: string,
  telefono: string,
  rol: string,
): Promise<void> {
  await callAdminFn({ action: 'crear', email, password, nombre, telefono, rol })
}
