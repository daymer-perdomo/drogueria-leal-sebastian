export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      banners: {
        Row: {
          activo: boolean
          created_at: string
          enlace: string | null
          id: string
          imagen_url: string
          orden: number
          subtitulo: string | null
          titulo: string | null
        }
        Insert: {
          activo?: boolean
          created_at?: string
          enlace?: string | null
          id?: string
          imagen_url: string
          orden?: number
          subtitulo?: string | null
          titulo?: string | null
        }
        Update: {
          activo?: boolean
          created_at?: string
          enlace?: string | null
          id?: string
          imagen_url?: string
          orden?: number
          subtitulo?: string | null
          titulo?: string | null
        }
        Relationships: []
      }
      categorias: {
        Row: {
          campos_schema: Json
          created_at: string
          id: string
          nombre: string
          slug: string
        }
        Insert: {
          campos_schema?: Json
          created_at?: string
          id?: string
          nombre: string
          slug: string
        }
        Update: {
          campos_schema?: Json
          created_at?: string
          id?: string
          nombre?: string
          slug?: string
        }
        Relationships: []
      }
      clientes: {
        Row: {
          activo: boolean
          created_at: string
          email: string
          id: string
          notas: string | null
        }
        Insert: {
          activo?: boolean
          created_at?: string
          email: string
          id: string
          notas?: string | null
        }
        Update: {
          activo?: boolean
          created_at?: string
          email?: string
          id?: string
          notas?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clientes_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "perfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracion: {
        Row: {
          descripcion: string | null
          id: string
          updated_at: string | null
          valor: string
        }
        Insert: {
          descripcion?: string | null
          id: string
          updated_at?: string | null
          valor: string
        }
        Update: {
          descripcion?: string | null
          id?: string
          updated_at?: string | null
          valor?: string
        }
        Relationships: []
      }
      noticias: {
        Row: {
          contenido: string
          created_at: string
          id: string
          imagen_url: string | null
          publicado: boolean
          titulo: string
        }
        Insert: {
          contenido: string
          created_at?: string
          id?: string
          imagen_url?: string | null
          publicado?: boolean
          titulo: string
        }
        Update: {
          contenido?: string
          created_at?: string
          id?: string
          imagen_url?: string | null
          publicado?: boolean
          titulo?: string
        }
        Relationships: []
      }
      ordenes: {
        Row: {
          created_at: string
          estado: string
          id: string
          items: Json
          total: number
          user_id: string
        }
        Insert: {
          created_at?: string
          estado?: string
          id?: string
          items: Json
          total: number
          user_id: string
        }
        Update: {
          created_at?: string
          estado?: string
          id?: string
          items?: Json
          total?: number
          user_id?: string
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
      productos: {
        Row: {
          activo: boolean
          campos_extra: Json
          categoria_id: string | null
          created_at: string
          descripcion: string
          id: string
          imagenes: string[]
          nombre: string
          precio: number
          stock: number
        }
        Insert: {
          activo?: boolean
          campos_extra?: Json
          categoria_id?: string | null
          created_at?: string
          descripcion?: string
          id?: string
          imagenes?: string[]
          nombre: string
          precio: number
          stock?: number
        }
        Update: {
          activo?: boolean
          campos_extra?: Json
          categoria_id?: string | null
          created_at?: string
          descripcion?: string
          id?: string
          imagenes?: string[]
          nombre?: string
          precio?: number
          stock?: number
        }
        Relationships: [
          {
            foreignKeyName: "productos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
        ]
      }
      quejas: {
        Row: {
          asunto: string
          created_at: string
          email: string
          estado: string
          id: string
          mensaje: string
          nombre: string
          respuesta: string | null
          user_id: string | null
        }
        Insert: {
          asunto: string
          created_at?: string
          email: string
          estado?: string
          id?: string
          mensaje: string
          nombre: string
          respuesta?: string | null
          user_id?: string | null
        }
        Update: {
          asunto?: string
          created_at?: string
          email?: string
          estado?: string
          id?: string
          mensaje?: string
          nombre?: string
          respuesta?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      es_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
