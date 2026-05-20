import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ItemCarrito } from '../types/order.types'

const STORAGE_KEY = 'drogueria-carrito'

export const useCartStore = defineStore('cart', () => {
  const items = ref<ItemCarrito[]>(_cargarDesdeStorage())
  const abierto = ref(false)

  const cantidad = computed(() => items.value.reduce((acc, item) => acc + item.cantidad, 0))
  const total = computed(() =>
    items.value.reduce((acc, item) => acc + item.precio * item.cantidad, 0),
  )
  const estaVacio = computed(() => items.value.length === 0)

  function agregar(item: Omit<ItemCarrito, 'cantidad'>) {
    const existente = items.value.find((i) => i.producto_id === item.producto_id)
    if (existente) {
      const nuevaCantidad = existente.cantidad + 1
      if (nuevaCantidad <= existente.stock) {
        existente.cantidad = nuevaCantidad
      }
    } else {
      items.value.push({ ...item, cantidad: 1 })
    }
    _guardarEnStorage()
  }

  function quitar(productoId: string) {
    items.value = items.value.filter((i) => i.producto_id !== productoId)
    _guardarEnStorage()
  }

  function actualizarCantidad(productoId: string, cantidad: number) {
    const item = items.value.find((i) => i.producto_id === productoId)
    if (!item) return
    if (cantidad <= 0) {
      quitar(productoId)
      return
    }
    item.cantidad = Math.min(cantidad, item.stock)
    _guardarEnStorage()
  }

  function vaciar() {
    items.value = []
    _guardarEnStorage()
  }

  function abrir() {
    abierto.value = true
  }

  function cerrar() {
    abierto.value = false
  }

  function _guardarEnStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items.value))
    } catch {
      // LocalStorage no disponible
    }
  }

  return {
    items,
    abierto,
    cantidad,
    total,
    estaVacio,
    agregar,
    quitar,
    actualizarCantidad,
    vaciar,
    abrir,
    cerrar,
  }
})

function _cargarDesdeStorage(): ItemCarrito[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}
