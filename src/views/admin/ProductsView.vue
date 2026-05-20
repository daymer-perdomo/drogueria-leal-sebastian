<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useProducts } from '../../composables/useProducts'
import { useNotification } from '../../composables/useNotification'
import * as productsService from '../../services/products.service'
import AppButton from '../../components/ui/AppButton.vue'
import AppBadge from '../../components/ui/AppBadge.vue'
import { IconPackage, IconPill, IconPencil } from '@tabler/icons-vue'

const { productos, cargando, cargar } = useProducts({ soloActivos: false })
const notif = useNotification()
const eliminando = ref<string | null>(null)

onMounted(cargar)

async function toggleActivo(producto: typeof productos.value[0]) {
  eliminando.value = producto.id
  try {
    await productsService.actualizarProducto({ id: producto.id, activo: !producto.activo })
    await cargar()
    notif.exito(`Producto ${producto.activo ? 'desactivado' : 'activado'}`)
  } catch (err) {
    notif.error(err instanceof Error ? err.message : 'Error al actualizar')
  } finally {
    eliminando.value = null
  }
}

function formatearPrecio(precio: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(precio)
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-text-primary">Productos</h1>
      <RouterLink :to="{ name: 'admin-capturar' }">
        <AppButton>+ Capturar producto</AppButton>
      </RouterLink>
    </div>

    <div v-if="cargando" class="flex flex-col gap-2">
      <div v-for="n in 5" :key="n" class="card p-4 animate-pulse flex gap-4">
        <div class="w-16 h-16 bg-surface-muted rounded-md" />
        <div class="flex-1 flex flex-col gap-2">
          <div class="h-4 bg-surface-muted rounded w-1/3" />
          <div class="h-3 bg-surface-muted rounded w-1/5" />
        </div>
      </div>
    </div>

    <div v-else-if="productos.length === 0" class="text-center py-12 text-text-muted">
      <IconPackage class="w-12 h-12 mb-3 mx-auto opacity-50" />
      <p>No hay productos. Captura el primero.</p>
    </div>

    <div v-else class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-surface-muted text-text-secondary">
            <tr>
              <th class="text-left px-4 py-3">Producto</th>
              <th class="text-left px-4 py-3">Categoría</th>
              <th class="text-right px-4 py-3">Precio</th>
              <th class="text-right px-4 py-3">Stock</th>
              <th class="text-center px-4 py-3">Estado</th>
              <th class="text-center px-4 py-3">Acción</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr
              v-for="p in productos"
              :key="p.id"
              class="hover:bg-surface-subtle transition-colors duration-base"
            >
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <img
                    v-if="p.imagenes?.[0]"
                    :src="p.imagenes[0]"
                    :alt="p.nombre"
                    class="w-10 h-10 rounded-md object-cover flex-shrink-0"
                  />
                  <span v-else class="w-10 h-10 rounded-md bg-surface-muted flex items-center justify-center flex-shrink-0 text-text-muted"><IconPill class="w-5 h-5" /></span>
                  <span class="font-medium text-text-primary">{{ p.nombre }}</span>
                </div>
              </td>
              <td class="px-4 py-3 text-text-secondary">{{ p.categoria?.nombre }}</td>
              <td class="px-4 py-3 text-right font-medium text-text-primary">{{ formatearPrecio(p.precio) }}</td>
              <td class="px-4 py-3 text-right">
                <AppBadge :variante="p.stock > 0 ? 'success' : 'error'">{{ p.stock }}</AppBadge>
              </td>
              <td class="px-4 py-3 text-center">
                <AppBadge :variante="p.activo ? 'success' : 'default'">
                  {{ p.activo ? 'Activo' : 'Inactivo' }}
                </AppBadge>
              </td>
              <td class="px-4 py-3 text-center">
                <div class="flex items-center justify-center gap-2">
                  <RouterLink :to="{ name: 'admin-editar-producto', params: { id: p.id } }">
                    <AppButton variante="outline" tamano="sm">
                      <IconPencil class="w-3.5 h-3.5 mr-1" />Editar
                    </AppButton>
                  </RouterLink>
                  <AppButton
                    :variante="p.activo ? 'ghost' : 'outline'"
                    tamano="sm"
                    :cargando="eliminando === p.id"
                    @click="toggleActivo(p)"
                  >
                    {{ p.activo ? 'Desactivar' : 'Activar' }}
                  </AppButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
