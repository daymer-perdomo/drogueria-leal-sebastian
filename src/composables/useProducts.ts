import { ref, computed } from 'vue'
import * as productsService from '../services/products.service'
import { useNotification } from './useNotification'
import type { ProductoConCategoria, FiltrosProducto } from '../types/product.types'

/**
 * Composable para listar y filtrar productos.
 */
export function useProducts(filtrosIniciales: FiltrosProducto = {}) {
  const productos = ref<ProductoConCategoria[]>([])
  const cargando = ref(false)
  const error = ref<string | null>(null)
  const filtros = ref<FiltrosProducto>({ pagina: 1, porPagina: 20, ...filtrosIniciales })
  const totalProductos = ref(0)
  const notif = useNotification()

  const totalPaginas = computed(() =>
    Math.ceil(totalProductos.value / (filtros.value.porPagina ?? 20)),
  )

  async function cargar() {
    cargando.value = true
    error.value = null
    try {
      const [lista, total] = await Promise.all([
        productsService.listarProductos(filtros.value),
        productsService.contarProductos(filtros.value),
      ])
      productos.value = lista
      totalProductos.value = total
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al cargar productos'
      error.value = mensaje
      notif.error(mensaje)
    } finally {
      cargando.value = false
    }
  }

  function aplicarFiltros(nuevosFiltros: Partial<FiltrosProducto>) {
    filtros.value = { ...filtros.value, ...nuevosFiltros, pagina: 1 }
    cargar()
  }

  function irAPagina(pagina: number) {
    filtros.value = { ...filtros.value, pagina }
    cargar()
  }

  return {
    productos,
    cargando,
    error,
    filtros,
    totalProductos,
    totalPaginas,
    cargar,
    aplicarFiltros,
    irAPagina,
  }
}

/**
 * Composable para obtener el detalle de un producto individual.
 */
export function useProductDetail(id: string) {
  const producto = ref<ProductoConCategoria | null>(null)
  const cargando = ref(false)
  const error = ref<string | null>(null)
  const notif = useNotification()

  async function cargar() {
    cargando.value = true
    error.value = null
    try {
      producto.value = await productsService.obtenerProducto(id)
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Producto no encontrado'
      error.value = mensaje
      notif.error(mensaje)
    } finally {
      cargando.value = false
    }
  }

  return { producto, cargando, error, cargar }
}
