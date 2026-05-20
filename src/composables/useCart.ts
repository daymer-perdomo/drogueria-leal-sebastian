import { storeToRefs } from 'pinia'
import { useCartStore } from '../stores/cart.store'
import { useNotification } from './useNotification'
import { useWhatsapp } from './useWhatsapp'
import type { ItemCarrito } from '../types/order.types'

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

  function pedirPorWhatsapp() {
    if (estaVacio.value) {
      notif.advertencia('El carrito está vacío')
      return
    }
    pedirCarrito(items.value, total.value)
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
