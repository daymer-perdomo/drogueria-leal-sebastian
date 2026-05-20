import { ref } from 'vue'
import type { ItemCarrito } from '../types/order.types'
import { getConfig } from '../services/configuracion.service'

const _numero = ref<string>(import.meta.env.VITE_WHATSAPP_NUMBER as string)
let _cargado = false

async function _cargarNumero() {
  if (_cargado) return
  _cargado = true
  const val = await getConfig('whatsapp_numero')
  if (val) _numero.value = val
}

function formatearPrecio(precio: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(precio)
}

export function useWhatsapp() {
  _cargarNumero()

  function pedirCarrito(items: ItemCarrito[], total: number) {
    const lineas = items.map(
      (item) =>
        `• ${item.cantidad}× ${item.nombre} — ${formatearPrecio(item.precio * item.cantidad)}`,
    )

    const mensaje = [
      'Hola 👋, me gustaría hacer el siguiente pedido en *Droguería Leal Sebastián*:',
      '',
      ...lineas,
      '',
      `*Total: ${formatearPrecio(total)}*`,
      '',
      '¿Pueden confirmar disponibilidad y forma de pago? Gracias.',
    ].join('\n')

    _abrir(mensaje)
  }

  function pedirProducto(nombre: string, precio: number) {
    const mensaje = [
      'Hola 👋, me interesa el siguiente producto de *Droguería Leal Sebastián*:',
      '',
      `*${nombre}*`,
      `Precio: ${formatearPrecio(precio)}`,
      '',
      '¿Está disponible? ¿Cómo puedo proceder?',
    ].join('\n')

    _abrir(mensaje)
  }

  function _abrir(mensaje: string) {
    const url = `https://wa.me/${_numero.value}?text=${encodeURIComponent(mensaje)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return { pedirCarrito, pedirProducto }
}
