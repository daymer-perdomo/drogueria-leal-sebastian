export type EstadoOrden = 'pendiente' | 'confirmado' | 'enviado' | 'entregado' | 'cancelado'

export interface ItemOrden {
  producto_id: string
  nombre: string
  precio: number
  cantidad: number
  imagen?: string
}

export interface Orden {
  id: string
  user_id: string
  items: ItemOrden[]
  total: number
  estado: EstadoOrden
  created_at?: string
}

export interface CrearOrdenInput {
  items: ItemOrden[]
  total: number
}

export interface ItemCarrito {
  producto_id: string
  nombre: string
  precio: number
  cantidad: number
  imagen?: string
  stock: number
}
