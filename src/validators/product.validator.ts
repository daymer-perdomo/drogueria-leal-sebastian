import { z } from 'zod'

const camposBaseProducto = {
  nombre: z
    .string()
    .min(1, 'El nombre es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(200, 'El nombre no puede superar los 200 caracteres'),
  descripcion: z
    .string()
    .min(1, 'La descripción es requerida')
    .max(2000, 'La descripción no puede superar los 2000 caracteres'),
  precio: z
    .number({ error: 'El precio debe ser un número' })
    .positive('El precio debe ser mayor a 0')
    .max(9999999, 'El precio no puede superar 9.999.999'),
  stock: z
    .number({ error: 'El stock debe ser un número' })
    .int('El stock debe ser un número entero')
    .min(0, 'El stock no puede ser negativo'),
  categoria_id: z.string().min(1, 'Selecciona una categoría'),
  activo: z.boolean().default(true),
}

export const productoBaseSchema = z.object(camposBaseProducto)

export const crearProductoSchema = z.object({
  ...camposBaseProducto,
  imagenes: z.array(z.string().url('URL de imagen inválida')).default([]),
  campos_extra: z.record(z.string(), z.unknown()).default({}),
})

export const actualizarProductoSchema = crearProductoSchema.partial().extend({
  id: z.string().uuid('ID de producto inválido'),
})

export const schemasMedicamento = z.object({
  principioActivo: z.string().min(1, 'El principio activo es requerido'),
  presentacion: z.string().min(1, 'La presentación es requerida'),
  concentracion: z.string().optional(),
  laboratorio: z.string().min(1, 'El laboratorio es requerido'),
  requiereFormula: z.boolean().optional().default(false),
  viaAdministracion: z.string().optional(),
  cantidadUnidades: z.number().positive().optional(),
})

export const schemaCuidadoPersonal = z.object({
  marca: z.string().min(1, 'La marca es requerida'),
  tipoProducto: z.string().min(1, 'El tipo de producto es requerido'),
  volumenMl: z.number().positive().optional(),
  tiposPiel: z.string().optional(),
})

export const schemasSuplemento = z.object({
  componentes: z.string().min(1, 'Los componentes son requeridos'),
  marca: z.string().min(1, 'La marca es requerida'),
  forma: z.string().min(1, 'La forma farmacéutica es requerida'),
  cantidadUnidades: z.number().positive().int().optional(),
  dosisRecomendada: z.string().optional(),
})

export const schemaDispositivoMedico = z.object({
  marca: z.string().min(1, 'La marca es requerida'),
  modelo: z.string().optional(),
  tipoDispositivo: z.string().min(1, 'El tipo de dispositivo es requerido'),
  garantiaMeses: z.number().positive().int().optional(),
})

export const schemaBebe = z.object({
  marca: z.string().min(1, 'La marca es requerida'),
  edadRecomendada: z.string().min(1, 'La edad recomendada es requerida'),
  tipoProducto: z.string().min(1, 'El tipo de producto es requerido'),
})

export const SCHEMAS_POR_CATEGORIA: Record<string, z.ZodObject<z.ZodRawShape>> = {
  medicamento: schemasMedicamento,
  cuidado_personal: schemaCuidadoPersonal,
  suplemento: schemasSuplemento,
  dispositivo_medico: schemaDispositivoMedico,
  bebe: schemaBebe,
}

export function getSchemaCategoria(categoriaId: string): z.ZodObject<z.ZodRawShape> | undefined {
  return SCHEMAS_POR_CATEGORIA[categoriaId]
}

export type CrearProductoInput = z.infer<typeof crearProductoSchema>
export type ActualizarProductoInput = z.infer<typeof actualizarProductoSchema>
