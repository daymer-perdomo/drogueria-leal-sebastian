import type { CampoCategoria } from '../types/category.types'

export interface DefinicionCategoria {
  id: string
  label: string
  slug: string
  campos: CampoCategoria[]
}

export const CATEGORIAS: DefinicionCategoria[] = [
  {
    id: 'medicamento',
    label: 'Medicamento',
    slug: 'medicamentos',
    campos: [
      { nombre: 'principioActivo', label: 'Principio Activo', tipo: 'text', requerido: true },
      {
        nombre: 'presentacion',
        label: 'Presentación',
        tipo: 'select',
        requerido: true,
        opciones: ['Tabletas', 'Cápsulas', 'Jarabe', 'Suspensión', 'Inyectable', 'Crema', 'Gel', 'Gotas', 'Supositorio', 'Parche'],
      },
      { nombre: 'concentracion', label: 'Concentración', tipo: 'text', requerido: false },
      { nombre: 'laboratorio', label: 'Laboratorio', tipo: 'text', requerido: true },
      { nombre: 'requiereFormula', label: 'Requiere Fórmula Médica', tipo: 'boolean', requerido: false },
      { nombre: 'viaAdministracion', label: 'Vía de Administración', tipo: 'select', requerido: false, opciones: ['Oral', 'Tópica', 'Intravenosa', 'Intramuscular', 'Subcutánea', 'Rectal', 'Oftálmica', 'Ótica', 'Nasal', 'Inhalada'] },
      { nombre: 'cantidadUnidades', label: 'Cantidad por Empaque', tipo: 'number', requerido: false },
    ],
  },
  {
    id: 'cuidado_personal',
    label: 'Cuidado Personal',
    slug: 'cuidado-personal',
    campos: [
      { nombre: 'marca', label: 'Marca', tipo: 'text', requerido: true },
      {
        nombre: 'tipoProducto',
        label: 'Tipo de Producto',
        tipo: 'select',
        requerido: true,
        opciones: ['Shampoo', 'Acondicionador', 'Jabón', 'Crema Corporal', 'Protector Solar', 'Desodorante', 'Pasta Dental', 'Enjuague Bucal'],
      },
      { nombre: 'volumenMl', label: 'Volumen (ml)', tipo: 'number', requerido: false },
      { nombre: 'tiposPiel', label: 'Tipo de Piel', tipo: 'select', requerido: false, opciones: ['Normal', 'Seca', 'Grasa', 'Mixta', 'Sensible', 'Todo tipo'] },
    ],
  },
  {
    id: 'suplemento',
    label: 'Suplemento / Vitamina',
    slug: 'suplementos',
    campos: [
      { nombre: 'componentes', label: 'Componentes Principales', tipo: 'text', requerido: true },
      { nombre: 'marca', label: 'Marca', tipo: 'text', requerido: true },
      {
        nombre: 'forma',
        label: 'Forma Farmacéutica',
        tipo: 'select',
        requerido: true,
        opciones: ['Tabletas', 'Cápsulas', 'Polvo', 'Líquido', 'Gummies'],
      },
      { nombre: 'cantidadUnidades', label: 'Cantidad de Unidades', tipo: 'number', requerido: false },
      { nombre: 'dosisRecomendada', label: 'Dosis Recomendada', tipo: 'text', requerido: false },
    ],
  },
  {
    id: 'dispositivo_medico',
    label: 'Dispositivo Médico',
    slug: 'dispositivos-medicos',
    campos: [
      { nombre: 'marca', label: 'Marca', tipo: 'text', requerido: true },
      { nombre: 'modelo', label: 'Modelo', tipo: 'text', requerido: false },
      {
        nombre: 'tipoDispositivo',
        label: 'Tipo de Dispositivo',
        tipo: 'select',
        requerido: true,
        opciones: ['Termómetro', 'Tensiómetro', 'Glucómetro', 'Oxímetro', 'Nebulizador', 'Silla de ruedas', 'Muletas', 'Bastón'],
      },
      { nombre: 'garantiaMeses', label: 'Garantía (meses)', tipo: 'number', requerido: false },
    ],
  },
  {
    id: 'bebe',
    label: 'Bebé y Maternidad',
    slug: 'bebe-maternidad',
    campos: [
      { nombre: 'marca', label: 'Marca', tipo: 'text', requerido: true },
      {
        nombre: 'edadRecomendada',
        label: 'Edad Recomendada',
        tipo: 'select',
        requerido: true,
        opciones: ['0-3 meses', '3-6 meses', '6-12 meses', '1-3 años', '3+ años', 'Todas las edades', 'Maternidad'],
      },
      {
        nombre: 'tipoProducto',
        label: 'Tipo de Producto',
        tipo: 'select',
        requerido: true,
        opciones: ['Fórmula Láctea', 'Pañales', 'Toallitas', 'Crema', 'Champú bebé', 'Biberones', 'Chupetes', 'Juguetes'],
      },
    ],
  },
]

export const CATEGORIAS_MAP = new Map(CATEGORIAS.map((c) => [c.id, c]))

export function getCategoriaById(id: string): DefinicionCategoria | undefined {
  return CATEGORIAS_MAP.get(id)
}
