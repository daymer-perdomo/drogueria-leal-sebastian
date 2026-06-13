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
      cajas: {
        Row: {
          activo: boolean
          created_at: string
          id: string
          nombre: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          id?: string
          nombre: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          id?: string
          nombre?: string
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
      mesas: {
        Row: {
          activo: boolean
          created_at: string
          id: string
          nombre: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          id?: string
          nombre: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          id?: string
          nombre?: string
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
          caja_id: string | null
          created_at: string
          estado: string
          id: string
          items: Json
          mesa_id: string | null
          total: number
          user_id: string
        }
        Insert: {
          caja_id?: string | null
          created_at?: string
          estado?: string
          id?: string
          items: Json
          mesa_id?: string | null
          total: number
          user_id: string
        }
        Update: {
          caja_id?: string | null
          created_at?: string
          estado?: string
          id?: string
          items?: Json
          mesa_id?: string | null
          total?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ordenes_caja_id_fkey"
            columns: ["caja_id"]
            isOneToOne: false
            referencedRelation: "cajas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordenes_mesa_id_fkey"
            columns: ["mesa_id"]
            isOneToOne: false
            referencedRelation: "mesas"
            referencedColumns: ["id"]
          },
        ]
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
          codigo: string | null
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
          codigo?: string | null
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
          codigo?: string | null
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
      admin_actualizar_usuario: {
        Args: {
          nuevo_nombre: string
          nuevo_rol: string
          nuevo_telefono: string
          target_user_id: string
        }
        Returns: boolean
      }
      admin_cambiar_password: {
        Args: { nueva_password: string; target_user_id: string }
        Returns: boolean
      }
      admin_eliminar_usuario: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      admin_listar_usuarios: {
        Args: never
        Returns: {
          created_at: string
          email: string
          id: string
          last_sign_in_at: string
          nombre: string
          rol: string
          telefono: string
        }[]
      }
      buscar_sugerencias: {
        Args: { lim?: number; q: string }
        Returns: {
          codigo: string
          id: string
          imagenes: string[]
          nombre: string
          precio: number
        }[]
      }
      es_admin: { Args: never; Returns: boolean }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      unaccent: { Args: { "": string }; Returns: string }
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
