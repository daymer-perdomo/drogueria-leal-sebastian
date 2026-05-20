export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      categorias: {
        Row: {
          id: string
          nombre: string
          slug: string
          campos_schema: Json
          created_at: string
        }
        Insert: {
          id?: string
          nombre: string
          slug: string
          campos_schema?: Json
          created_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          slug?: string
          campos_schema?: Json
          created_at?: string
        }
        Relationships: []
      }
      productos: {
        Row: {
          id: string
          nombre: string
          descripcion: string
          precio: number
          stock: number
          categoria_id: string | null
          imagenes: string[]
          campos_extra: Json
          activo: boolean
          created_at: string
        }
        Insert: {
          id?: string
          nombre: string
          descripcion: string
          precio: number
          stock: number
          categoria_id?: string | null
          imagenes?: string[]
          campos_extra?: Json
          activo?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          descripcion?: string
          precio?: number
          stock?: number
          categoria_id?: string | null
          imagenes?: string[]
          campos_extra?: Json
          activo?: boolean
          created_at?: string
        }
        Relationships: []
      }
      noticias: {
        Row: {
          id: string
          titulo: string
          contenido: string
          imagen_url: string | null
          publicado: boolean
          created_at: string
        }
        Insert: {
          id?: string
          titulo: string
          contenido: string
          imagen_url?: string | null
          publicado?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          titulo?: string
          contenido?: string
          imagen_url?: string | null
          publicado?: boolean
          created_at?: string
        }
        Relationships: []
      }
      ordenes: {
        Row: {
          id: string
          user_id: string
          items: Json
          total: number
          estado: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          items: Json
          total: number
          estado?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          items?: Json
          total?: number
          estado?: string
          created_at?: string
        }
        Relationships: []
      }
      quejas: {
        Row: {
          id: string
          user_id: string | null
          nombre: string
          email: string
          asunto: string
          mensaje: string
          estado: string
          respuesta: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          nombre: string
          email: string
          asunto: string
          mensaje: string
          estado?: string
          respuesta?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          nombre?: string
          email?: string
          asunto?: string
          mensaje?: string
          estado?: string
          respuesta?: string | null
          created_at?: string
        }
        Relationships: []
      }
      perfiles: {
        Row: {
          id: string
          nombre: string
          rol: string
          telefono: string | null
        }
        Insert: {
          id: string
          nombre: string
          rol?: string
          telefono?: string | null
        }
        Update: {
          id?: string
          nombre?: string
          rol?: string
          telefono?: string | null
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
