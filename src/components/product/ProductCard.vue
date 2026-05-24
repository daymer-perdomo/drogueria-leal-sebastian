<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import type { ProductoConCategoria } from '../../types/product.types'
import { useCart } from '../../composables/useCart'
import { useWhatsapp } from '../../composables/useWhatsapp'
import * as ordersService from '../../services/orders.service'
import AppButton from '../ui/AppButton.vue'
import AppBadge from '../ui/AppBadge.vue'
import { IconBrandWhatsapp, IconShoppingCart, IconPill } from '@tabler/icons-vue'

const props = defineProps<{
  producto: ProductoConCategoria
}>()

const imgCargada = ref(false)

const { agregarAlCarrito } = useCart()
const { pedirProducto } = useWhatsapp()

function formatearPrecio(precio: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(precio)
}

function onAgregarCarrito() {
  agregarAlCarrito({
    producto_id: props.producto.id,
    nombre: props.producto.nombre,
    precio: props.producto.precio,
    imagen: props.producto.imagenes?.[0],
    stock: props.producto.stock,
  })
}

async function onPedirWhatsapp() {
  pedirProducto(props.producto.nombre, props.producto.precio)
  try {
    await ordersService.crearOrden({
      items: [{
        producto_id: props.producto.id,
        nombre: props.producto.nombre,
        precio: props.producto.precio,
        cantidad: 1,
        imagen: props.producto.imagenes?.[0],
      }],
      total: props.producto.precio,
    })
  } catch {
    // silencioso si el usuario no está autenticado
  }
}
</script>

<template>
  <div class="card overflow-hidden flex flex-col group transition-shadow duration-base hover:shadow-lg">
    <!-- Imagen -->
    <RouterLink :to="{ name: 'producto-detalle', params: { id: producto.id } }">
      <div class="aspect-square bg-surface-muted overflow-hidden relative">
        <template v-if="producto.imagenes?.[0]">
          <div
            class="absolute inset-0 animate-pulse bg-surface-muted"
            :style="{ opacity: imgCargada ? 0 : 1, transition: 'opacity 0.3s ease' }"
          />
          <img
            :src="producto.imagenes[0]"
            :alt="producto.nombre"
            loading="lazy"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-slow"
            :style="{ opacity: imgCargada ? 1 : 0, transition: 'opacity 0.3s ease' }"
            @load="imgCargada = true"
          />
        </template>
        <div v-else class="w-full h-full flex items-center justify-center text-text-muted opacity-30">
          <IconPill class="w-16 h-16" />
        </div>
      </div>
    </RouterLink>

    <!-- Contenido -->
    <div class="p-2 sm:p-4 flex flex-col flex-1 gap-1.5 sm:gap-2">
      <div class="flex items-center justify-between gap-1">
        <AppBadge variante="default">{{ producto.categoria?.nombre }}</AppBadge>
        <span v-if="producto.codigo" class="text-xs text-text-muted font-mono">{{ producto.codigo }}</span>
      </div>

      <RouterLink :to="{ name: 'producto-detalle', params: { id: producto.id } }">
        <h3 class="font-semibold text-text-primary text-xs sm:text-base leading-tight hover:text-brand-blue transition-colors duration-base line-clamp-2">
          {{ producto.nombre }}
        </h3>
      </RouterLink>

      <p class="hidden sm:block text-sm text-text-secondary line-clamp-2 sm:flex-1">{{ producto.descripcion }}</p>

      <div class="flex items-center justify-between mt-auto pt-1 sm:pt-2">
        <span class="text-sm sm:text-xl font-bold text-brand-blue">{{ formatearPrecio(producto.precio) }}</span>
        <AppBadge :variante="producto.stock > 0 ? 'success' : 'error'">
          {{ producto.stock > 0 ? `${producto.stock}` : 'Agotado' }}
        </AppBadge>
      </div>

      <div class="flex gap-1.5 sm:gap-2">
        <AppButton
          variante="outline"
          tamano="sm"
          :disabled="producto.stock === 0"
          class="flex-1"
          @click="onAgregarCarrito"
        >
          <IconShoppingCart class="w-4 h-4" />
        </AppButton>
        <AppButton
          tamano="sm"
          :disabled="producto.stock === 0"
          class="flex-1 bg-brand-green hover:bg-brand-green-dark text-white border-0 focus-visible:ring-brand-green"
          @click="onPedirWhatsapp"
        >
          <IconBrandWhatsapp class="w-4 h-4" />
          <span class="hidden sm:inline">{{ producto.stock > 0 ? 'WhatsApp' : 'Sin stock' }}</span>
        </AppButton>
      </div>
    </div>
  </div>
</template>
