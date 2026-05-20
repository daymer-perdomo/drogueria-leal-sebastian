export type EstadoQueja = 'nueva' | 'en_proceso' | 'resuelta'

export interface Queja {
  id: string
  user_id: string | null
  nombre: string
  email: string
  asunto: string
  mensaje: string
  estado: EstadoQueja
  respuesta: string | null
  created_at: string
}

export interface CrearQuejaInput {
  nombre: string
  email: string
  asunto: string
  mensaje: string
}
