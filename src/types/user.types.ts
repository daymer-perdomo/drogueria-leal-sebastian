export type UserRole = 'admin' | 'cliente'

export interface Perfil {
  id: string
  nombre: string
  rol: UserRole
  telefono: string | null
  created_at?: string
}

export interface AuthUser {
  id: string
  email: string
  perfil: Perfil | null
}
