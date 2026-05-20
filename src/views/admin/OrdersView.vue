<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as ordersService from '../../services/orders.service'
import { useNotification } from '../../composables/useNotification'
import type { Orden, EstadoOrden } from '../../types/order.types'
import AppBadge from '../../components/ui/AppBadge.vue'
import AppButton from '../../components/ui/AppButton.vue'
import { IconShoppingBag } from '@tabler/icons-vue'

const ordenes = ref<Orden[]>([])
const cargando = ref(false)
const actualizando = ref<string | null>(null)
const notif = useNotification()

const estados: EstadoOrden[] = ['pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado']
const variantePorEstado: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
  pendiente: 'warning',
  confirmado: 'info',
  enviado: 'info',
  entregado: 'success',
  cancelado: 'error',
}

onMounted(async () => {
  cargando.value = true
  try {
    ordenes.value = await ordersService.listarTodasLasOrdenes()
  } finally {
    cargando.value = false
  }
})

async function cambiarEstado(id: string, estado: EstadoOrden) {
  actualizando.value = id
  try {
    const actualizada = await ordersService.actualizarEstadoOrden(id, estado)
    const idx = ordenes.value.findIndex((o) => o.id === id)
    if (idx !== -1) ordenes.value[idx] = actualizada
    notif.exito('Estado actualizado')
  } catch (err) {
    notif.error(err instanceof Error ? err.message : 'Error al actualizar')
  } finally {
    actualizando.value = null
  }
}

function formatearPrecio(precio: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(precio)
}

function formatearFecha(fecha: string) {
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(fecha))
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-text-primary mb-6">Órdenes</h1>

    <div v-if="cargando" class="flex flex-col gap-3">
      <div v-for="n in 5" :key="n" class="card p-4 animate-pulse h-20" />
    </div>

    <div v-else-if="ordenes.length === 0" class="text-center py-12 text-text-muted">
      <IconShoppingBag class="w-12 h-12 mb-3 mx-auto opacity-50" />
      <p>No hay órdenes registradas</p>
    </div>

    <div v-else class="flex flex-col gap-4">
      <div
        v-for="orden in ordenes"
        :key="orden.id"
        class="card p-4"
      >
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <p class="text-xs font-mono text-text-muted">{{ orden.id.slice(0, 8).toUpperCase() }}</p>
            <p class="text-xs text-text-muted mt-0.5">{{ formatearFecha(orden.created_at ?? '') }}</p>
          </div>
          <div class="flex items-center gap-3">
            <span class="font-bold text-primary">{{ formatearPrecio(orden.total) }}</span>
            <AppBadge :variante="variantePorEstado[orden.estado] ?? 'default'" class="capitalize">
              {{ orden.estado }}
            </AppBadge>
          </div>
        </div>

        <ul class="text-sm text-text-secondary mb-3 flex flex-col gap-0.5">
          <li v-for="(item, i) in orden.items" :key="i">
            {{ item.cantidad }}× {{ item.nombre }} — {{ formatearPrecio(item.precio * item.cantidad) }}
          </li>
        </ul>

        <!-- Cambiar estado -->
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-xs text-text-muted">Cambiar estado:</span>
          <AppButton
            v-for="estado in estados"
            :key="estado"
            :variante="orden.estado === estado ? 'primary' : 'ghost'"
            tamano="sm"
            :cargando="actualizando === orden.id && orden.estado !== estado"
            class="capitalize"
            @click="cambiarEstado(orden.id, estado)"
          >
            {{ estado }}
          </AppButton>
        </div>
      </div>
    </div>
  </div>
</template>
