import { storeToRefs } from 'pinia'
import { useCartStore } from '../stores/cart.store'
import { useNotification } from './useNotification'
import { useWhatsapp } from './useWhatsapp'
import type { ItemCarrito } from '../types/order.types'
import * as ordersService from '../services/orders.service'

export function useCart() {
  const cartStore = useCartStore()
  const notif = useNotification()
  const { pedirCarrito } = useWhatsapp()
  const { items, cantidad, total, estaVacio, abierto } = storeToRefs(cartStore)

  function agregarAlCarrito(item: Omit<ItemCarrito, 'cantidad'>) {
    cartStore.agregar(item)
    notif.exito(`"${item.nombre}" agregado al carrito`)
    cartStore.abrir()
  }

  async function pedirPorWhatsapp() {
    if (estaVacio.value) {
      notif.advertencia('El carrito está vacío')
      return
    }

    const snapshot = items.value.map(i => ({
      producto_id: i.producto_id,
      nombre: i.nombre,
      precio: i.precio,
      cantidad: i.cantidad,
      imagen: i.imagen,
      unidad: i.unidad,
    }))
    const totalSnapshot = total.value

    pedirCarrito(items.value, totalSnapshot)

    try {
      await ordersService.crearOrden({ items: snapshot, total: totalSnapshot })
    } catch {
      // silencioso si el usuario no está autenticado
    }

    cartStore.vaciar()
    cartStore.cerrar()
  }

  return {
    items,
    cantidad,
    total,
    estaVacio,
    abierto,
    agregarAlCarrito,
    pedirPorWhatsapp,
    quitar: cartStore.quitar,
    actualizarCantidad: cartStore.actualizarCantidad,
    vaciar: cartStore.vaciar,
    abrir: cartStore.abrir,
    cerrar: cartStore.cerrar,
  }
}
