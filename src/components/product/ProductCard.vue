<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { ProductoConCategoria } from '../../types/product.types'
import { useCart } from '../../composables/useCart'
import { useWhatsapp } from '../../composables/useWhatsapp'
import AppButton from '../ui/AppButton.vue'
import AppBadge from '../ui/AppBadge.vue'
import { IconBrandWhatsapp, IconShoppingCart, IconPill } from '@tabler/icons-vue'

const props = defineProps<{
  producto: ProductoConCategoria
}>()

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
</script>

<template>
  <div class="card overflow-hidden flex flex-col group transition-shadow duration-base hover:shadow-lg">
    <!-- Imagen -->
    <RouterLink :to="{ name: 'producto-detalle', params: { id: producto.id } }">
      <div class="aspect-square bg-surface-muted overflow-hidden">
        <img
          v-if="producto.imagenes?.[0]"
          :src="producto.imagenes[0]"
          :alt="producto.nombre"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-slow"
        />
        <div v-else class="w-full h-full flex items-center justify-center text-text-muted opacity-30">
          <IconPill class="w-16 h-16" />
        </div>
      </div>
    </RouterLink>

    <!-- Contenido -->
    <div class="p-4 flex flex-col flex-1 gap-2">
      <AppBadge variante="default">{{ producto.categoria?.nombre }}</AppBadge>

      <RouterLink :to="{ name: 'producto-detalle', params: { id: producto.id } }">
        <h3 class="font-semibold text-text-primary text-base leading-tight hover:text-primary transition-colors duration-base line-clamp-2">
          {{ producto.nombre }}
        </h3>
      </RouterLink>

      <p class="text-sm text-text-secondary line-clamp-2 flex-1">{{ producto.descripcion }}</p>

      <div class="flex items-center justify-between mt-auto pt-2">
        <span class="text-xl font-bold text-primary">{{ formatearPrecio(producto.precio) }}</span>
        <AppBadge :variante="producto.stock > 0 ? 'success' : 'error'">
          {{ producto.stock > 0 ? `Stock: ${producto.stock}` : 'Agotado' }}
        </AppBadge>
      </div>

      <div class="flex gap-2">
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
          class="flex-1 bg-[#25D366] hover:bg-[#1ebe5d] text-white border-0 focus-visible:ring-green-400"
          @click="pedirProducto(producto.nombre, producto.precio)"
        >
          <IconBrandWhatsapp class="w-4 h-4" />
          {{ producto.stock > 0 ? 'WhatsApp' : 'Sin stock' }}
        </AppButton>
      </div>
    </div>
  </div>
</template>
