<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as ordersService from '../../services/orders.service'
import type { Orden } from '../../types/order.types'
import AppBadge from '../../components/ui/AppBadge.vue'
import { IconPackage } from '@tabler/icons-vue'

const ordenes = ref<Orden[]>([])
const cargando = ref(false)

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
    ordenes.value = await ordersService.listarMisOrdenes()
  } finally {
    cargando.value = false
  }
})

function formatearPrecio(precio: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(precio)
}

function formatearFecha(fecha: string) {
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'long' }).format(new Date(fecha))
}
</script>

<template>
  <main class="container-app py-8">
    <h1 class="text-3xl font-bold text-text-primary mb-6">Mis Pedidos</h1>

    <div v-if="cargando" class="flex flex-col gap-4">
      <div v-for="n in 3" :key="n" class="card p-6 animate-pulse flex flex-col gap-3">
        <div class="h-4 bg-surface-muted rounded w-1/4" />
        <div class="h-3 bg-surface-muted rounded w-1/2" />
      </div>
    </div>

    <div v-else-if="ordenes.length === 0" class="text-center py-16 text-text-muted">
      <IconPackage class="w-12 h-12 mb-4 mx-auto opacity-50" />
      <p class="text-lg font-medium">Aún no tienes pedidos</p>
    </div>

    <div v-else class="flex flex-col gap-4">
      <div
        v-for="orden in ordenes"
        :key="orden.id"
        class="card p-5"
      >
        <div class="flex items-start justify-between mb-3">
          <div>
            <p class="text-xs text-text-muted font-mono">{{ orden.id.slice(0, 8).toUpperCase() }}</p>
            <p class="text-sm text-text-secondary mt-0.5">{{ formatearFecha(orden.created_at ?? '') }}</p>
          </div>
          <AppBadge :variante="variantePorEstado[orden.estado] ?? 'default'" class="capitalize">
            {{ orden.estado }}
          </AppBadge>
        </div>

        <ul class="flex flex-col gap-1 text-sm text-text-secondary mb-3">
          <li v-for="(item, i) in orden.items" :key="i">
            {{ item.cantidad }}× {{ item.nombre }}
          </li>
        </ul>

        <div class="text-right font-bold text-primary">{{ formatearPrecio(orden.total) }}</div>
      </div>
    </div>
  </main>
</template>
