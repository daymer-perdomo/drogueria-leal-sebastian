export interface CampoCategoria {
  nombre: string
  label: string
  tipo: 'text' | 'number' | 'boolean' | 'select'
  requerido: boolean
  opciones?: string[]
}

export interface Categoria {
  id: string
  nombre: string
  slug: string
  campos_schema: CampoCategoria[]
  created_at?: string
}
