<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useProductDetail } from '../../composables/useProducts'
import { useCart } from '../../composables/useCart'
import AppButton from '../../components/ui/AppButton.vue'
import AppBadge from '../../components/ui/AppBadge.vue'
import { IconPill, IconAlertCircle, IconBrandWhatsapp, IconShoppingCart } from '@tabler/icons-vue'
import { useWhatsapp } from '../../composables/useWhatsapp'
import * as ordersService from '../../services/orders.service'
import type { UnidadVenta } from '../../types/product.types'

const props = defineProps<{ id: string }>()
const { producto, cargando, cargar } = useProductDetail(props.id)
const { agregarAlCarrito } = useCart()
const { pedirProducto } = useWhatsapp()
const imagenActiva = ref(0)

onMounted(cargar)

function formatearPrecio(precio: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(precio)
}

// ── Unidades de venta ─────────────────────────────────────────────────────────
const unidadesVenta = computed<UnidadVenta[]>(() => {
  const uv = producto.value?.campos_extra?.unidades_venta
  return Array.isArray(uv) ? (uv as UnidadVenta[]) : []
})

const unidadSeleccionada = ref<UnidadVenta | null>(null)

const precioMostrado = computed(() =>
  unidadSeleccionada.value?.precio ?? producto.value?.precio ?? 0,
)

// Cuando el producto carga, seleccionar la primera unidad por defecto
function inicializarUnidad() {
  if (unidadesVenta.value.length > 0) {
    unidadSeleccionada.value = unidadesVenta.value[0] ?? null
  }
}

onMounted(async () => {
  await cargar()
  inicializarUnidad()
})

// ── Acciones ──────────────────────────────────────────────────────────────────
function onAgregar() {
  if (!producto.value) return
  agregarAlCarrito({
    producto_id: producto.value.id,
    nombre: producto.value.nombre,
    precio: precioMostrado.value,
    imagen: producto.value.imagenes?.[0],
    stock: producto.value.stock,
    unidad: unidadSeleccionada.value?.etiqueta,
  })
}

async function onWhatsapp() {
  if (!producto.value) return
  pedirProducto(producto.value.nombre, precioMostrado.value, unidadSeleccionada.value?.etiqueta)
  try {
    await ordersService.crearOrden({
      items: [{
        producto_id: producto.value.id,
        nombre: producto.value.nombre,
        precio: precioMostrado.value,
        cantidad: 1,
        imagen: producto.value.imagenes?.[0],
        unidad: unidadSeleccionada.value?.etiqueta,
      }],
      total: precioMostrado.value,
    })
  } catch {
    // silencioso si el usuario no está autenticado
  }
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
            :class="['w-16 h-16 rounded-md overflow-hidden border-2 transition-colors duration-base', imagenActiva === i ? 'border-brand-blue' : 'border-border']"
            @click="imagenActiva = i"
          >
            <img :src="img" :alt="`Imagen ${i + 1}`" class="w-full h-full object-cover" />
          </button>
        </div>
      </div>

      <!-- Info -->
      <div class="flex-1">
        <div class="flex items-center gap-2 mb-2 flex-wrap">
          <AppBadge variante="default">{{ producto.categoria?.nombre }}</AppBadge>
          <span
            v-if="producto.codigo"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-subtle border border-border text-xs font-mono text-text-secondary"
          >
            <span class="text-text-muted">Cód.</span>{{ producto.codigo }}
          </span>
        </div>
        <h1 class="text-3xl font-bold text-text-primary mb-2">{{ producto.nombre }}</h1>
        <p class="text-3xl font-bold text-brand-blue mb-4">{{ formatearPrecio(precioMostrado) }}</p>
        <p class="text-text-secondary mb-4">{{ producto.descripcion }}</p>

        <!-- Selector de unidad de venta -->
        <div v-if="unidadesVenta.length > 0" class="mb-5">
          <p class="text-sm font-semibold text-text-primary mb-2">¿Cómo lo quieres?</p>
          <div class="flex gap-2 flex-wrap">
            <button
              v-for="unidad in unidadesVenta"
              :key="unidad.tipo"
              type="button"
              :class="[
                'px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors duration-base',
                unidadSeleccionada?.tipo === unidad.tipo
                  ? 'border-brand-blue bg-brand-blue text-white'
                  : 'border-border text-text-primary hover:border-brand-blue',
              ]"
              @click="unidadSeleccionada = unidad"
            >
              {{ unidad.etiqueta }} — {{ formatearPrecio(unidad.precio) }}
            </button>
          </div>
        </div>

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
            class="bg-brand-green hover:bg-brand-green-dark text-white border-0 focus-visible:ring-brand-green"
            @click="onWhatsapp"
          >
            <IconBrandWhatsapp class="w-5 h-5" />
            Pedir por WhatsApp
          </AppButton>
        </div>

        <!-- Campos extra (excluye unidades_venta) -->
        <div
          v-if="Object.keys(producto.campos_extra ?? {}).filter(k => k !== 'unidades_venta').length > 0"
          class="mt-8 card p-4"
        >
          <h3 class="font-semibold text-text-primary mb-3">Información del producto</h3>
          <dl class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <template v-for="(valor, clave) in producto.campos_extra" :key="clave">
              <template v-if="clave !== 'unidades_venta'">
                <dt class="text-text-muted capitalize">{{ String(clave).replace(/([A-Z])/g, ' $1') }}</dt>
                <dd class="text-text-primary font-medium">{{ valor }}</dd>
              </template>
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
