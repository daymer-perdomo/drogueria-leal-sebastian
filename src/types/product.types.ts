export interface Producto {
  id: string
  codigo?: string | null
  nombre: string
  descripcion: string
  precio: number
  stock: number
  categoria_id: string
  imagenes: string[]
  campos_extra: Record<string, unknown>
  activo: boolean
  created_at?: string
}

export interface ProductoConCategoria extends Producto {
  categoria: {
    id: string
    nombre: string
    slug: string
  }
}

export interface CrearProductoInput {
  codigo?: string | null
  nombre: string
  descripcion: string
  precio: number
  stock: number
  categoria_id: string
  imagenes?: string[]
  campos_extra?: Record<string, unknown>
  activo?: boolean
}

export interface ActualizarProductoInput extends Partial<CrearProductoInput> {
  id: string
}

export interface FiltrosProducto {
  categoriaId?: string
  soloActivos?: boolean
  busqueda?: string
  precioMin?: number
  precioMax?: number
  pagina?: number
  porPagina?: number
}
