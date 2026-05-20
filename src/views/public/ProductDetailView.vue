<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useProductDetail } from '../../composables/useProducts'
import { useCart } from '../../composables/useCart'
import AppButton from '../../components/ui/AppButton.vue'
import AppBadge from '../../components/ui/AppBadge.vue'
import { IconPill, IconAlertCircle, IconBrandWhatsapp, IconShoppingCart } from '@tabler/icons-vue'
import { useWhatsapp } from '../../composables/useWhatsapp'

const props = defineProps<{ id: string }>()
const { producto, cargando, cargar } = useProductDetail(props.id)
const { agregarAlCarrito } = useCart()
const { pedirProducto } = useWhatsapp()
const imagenActiva = ref(0)

onMounted(cargar)

function formatearPrecio(precio: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(precio)
}

function onAgregar() {
  if (!producto.value) return
  agregarAlCarrito({
    producto_id: producto.value.id,
    nombre: producto.value.nombre,
    precio: producto.value.precio,
    imagen: producto.value.imagenes?.[0],
    stock: producto.value.stock,
  })
}

function onWhatsapp() {
  if (!producto.value) return
  pedirProducto(producto.value.nombre, producto.value.precio)
}
</script>

<template>
  <main class="container-app py-8">
    <div v-if="cargando" class="animate-pulse flex flex-col md:flex-row gap-8">
      <div class="w-full md:w-96 aspect-square bg-surface-muted rounded-xl" />
      <div class="flex-1 flex flex-col gap-4">
        <div class="h-8 bg-surface-muted rounded w-3/4" />
        <div class="h-4 bg-surface-muted rounded w-1/4" />
        <div class="h-20 bg-surface-muted rounded" />
        <div class="h-10 bg-surface-muted rounded w-40" />
      </div>
    </div>

    <div v-else-if="producto" class="flex flex-col md:flex-row gap-8">
      <!-- Galería -->
      <div class="w-full md:w-96 flex-shrink-0">
        <div class="aspect-square bg-surface-muted rounded-xl overflow-hidden mb-3">
          <img
            v-if="producto.imagenes?.[imagenActiva]"
            :src="producto.imagenes[imagenActiva]"
            :alt="producto.nombre"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-text-muted opacity-30">
            <IconPill class="w-20 h-20" />
          </div>
        </div>
        <div v-if="producto.imagenes?.length > 1" class="flex gap-2">
          <button
            v-for="(img, i) in producto.imagenes"
            :key="i"
            :class="['w-16 h-16 rounded-md overflow-hidden border-2 transition-colors duration-base', imagenActiva === i ? 'border-primary' : 'border-border']"
            @click="imagenActiva = i"
          >
            <img :src="img" :alt="`Imagen ${i + 1}`" class="w-full h-full object-cover" />
          </button>
        </div>
      </div>

      <!-- Info -->
      <div class="flex-1">
        <AppBadge variante="default" class="mb-2">{{ producto.categoria?.nombre }}</AppBadge>
        <h1 class="text-3xl font-bold text-text-primary mb-2">{{ producto.nombre }}</h1>
        <p class="text-3xl font-bold text-primary mb-4">{{ formatearPrecio(producto.precio) }}</p>
        <p class="text-text-secondary mb-6">{{ producto.descripcion }}</p>

        <div class="flex items-center gap-4 mb-6">
          <AppBadge :variante="producto.stock > 0 ? 'success' : 'error'">
            {{ producto.stock > 0 ? `Disponible (${producto.stock} en stock)` : 'Sin stock' }}
          </AppBadge>
        </div>

        <div class="flex flex-col sm:flex-row gap-3">
          <AppButton
            tamano="lg"
            variante="outline"
            :disabled="producto.stock === 0"
            @click="onAgregar"
          >
            <IconShoppingCart class="w-5 h-5" />
            Agregar al carrito
          </AppButton>
          <AppButton
            tamano="lg"
            :disabled="producto.stock === 0"
            class="bg-[#25D366] hover:bg-[#1ebe5d] text-white border-0 focus-visible:ring-green-400"
            @click="onWhatsapp"
          >
            <IconBrandWhatsapp class="w-5 h-5" />
            Pedir por WhatsApp
          </AppButton>
        </div>

        <!-- Campos extra -->
        <div v-if="Object.keys(producto.campos_extra ?? {}).length > 0" class="mt-8 card p-4">
          <h3 class="font-semibold text-text-primary mb-3">Información del producto</h3>
          <dl class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <template v-for="(valor, clave) in producto.campos_extra" :key="clave">
              <dt class="text-text-muted capitalize">{{ String(clave).replace(/([A-Z])/g, ' $1') }}</dt>
              <dd class="text-text-primary font-medium">{{ valor }}</dd>
            </template>
          </dl>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-16 text-text-muted">
      <IconAlertCircle class="w-12 h-12 mb-4 mx-auto text-error opacity-70" />
      <p class="text-lg">Producto no encontrado</p>
    </div>
  </main>
</template>
