import { z } from 'zod'

export const itemOrdenSchema = z.object({
  producto_id: z.string().uuid('ID de producto inválido'),
  nombre: z.string().min(1, 'El nombre del producto es requerido'),
  precio: z.number().positive('El precio debe ser mayor a 0'),
  cantidad: z.number().int().positive('La cantidad debe ser al menos 1'),
  imagen: z.string().url().optional(),
})

export const crearOrdenSchema = z.object({
  items: z
    .array(itemOrdenSchema)
    .min(1, 'El carrito debe tener al menos un producto'),
  total: z.number().positive('El total debe ser mayor a 0'),
})

export const actualizarEstadoOrdenSchema = z.object({
  id: z.string().uuid('ID de orden inválido'),
  estado: z.enum(['pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado'], {
    error: 'Estado de orden inválido',
  }),
})

export type CrearOrdenInput = z.infer<typeof crearOrdenSchema>
export type ActualizarEstadoOrdenInput = z.infer<typeof actualizarEstadoOrdenSchema>
