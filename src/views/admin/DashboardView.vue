<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import * as productsService from '../../services/products.service'
import * as ordersService from '../../services/orders.service'
import AppCard from '../../components/ui/AppCard.vue'
import { IconPackage, IconBell, IconCamera, IconShoppingBag, IconNews, IconArrowRight } from '@tabler/icons-vue'

const totalProductos = ref(0)
const ordenesPendientes = ref(0)
const cargando = ref(false)

onMounted(async () => {
  cargando.value = true
  try {
    const [prods, ordenes] = await Promise.all([
      productsService.contarProductos({ soloActivos: false }),
      ordersService.listarTodasLasOrdenes(1, 100),
    ])
    totalProductos.value = prods
    ordenesPendientes.value = ordenes.filter((o) => o.estado === 'pendiente').length
  } finally {
    cargando.value = false
  }
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-text-primary mb-6">Dashboard</h1>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      <AppCard>
        <div class="flex items-center gap-4">
          <IconPackage class="w-8 h-8 text-primary" />
          <div>
            <p class="text-text-muted text-sm">Productos</p>
            <p class="text-2xl font-bold text-text-primary">{{ cargando ? '...' : totalProductos }}</p>
          </div>
        </div>
      </AppCard>
      <AppCard>
        <div class="flex items-center gap-4">
          <IconBell class="w-8 h-8 text-primary" />
          <div>
            <p class="text-text-muted text-sm">Órdenes pendientes</p>
            <p class="text-2xl font-bold text-text-primary">{{ cargando ? '...' : ordenesPendientes }}</p>
          </div>
        </div>
      </AppCard>
      <AppCard>
        <div class="flex items-center gap-4">
          <IconCamera class="w-8 h-8 text-primary" />
          <div>
            <p class="text-text-muted text-sm">Captura rápida</p>
            <RouterLink :to="{ name: 'admin-capturar' }" class="inline-flex items-center gap-1 text-primary font-medium text-sm hover:underline">
              Ir a cámara <IconArrowRight class="w-3 h-3" />
            </RouterLink>
          </div>
        </div>
      </AppCard>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <AppCard>
        <h2 class="font-semibold text-text-primary mb-4">Accesos rápidos</h2>
        <ul class="flex flex-col gap-2">
          <li>
            <RouterLink :to="{ name: 'admin-productos' }" class="flex items-center gap-2 p-2 rounded-md hover:bg-surface-muted text-sm text-text-secondary transition-colors duration-base">
              <IconPackage class="w-4 h-4" /> Gestionar productos
            </RouterLink>
          </li>
          <li>
            <RouterLink :to="{ name: 'admin-capturar' }" class="flex items-center gap-2 p-2 rounded-md hover:bg-surface-muted text-sm text-text-secondary transition-colors duration-base">
              <IconCamera class="w-4 h-4" /> Capturar producto con cámara
            </RouterLink>
          </li>
          <li>
            <RouterLink :to="{ name: 'admin-ordenes' }" class="flex items-center gap-2 p-2 rounded-md hover:bg-surface-muted text-sm text-text-secondary transition-colors duration-base">
              <IconShoppingBag class="w-4 h-4" /> Ver órdenes
            </RouterLink>
          </li>
          <li>
            <RouterLink :to="{ name: 'admin-noticias' }" class="flex items-center gap-2 p-2 rounded-md hover:bg-surface-muted text-sm text-text-secondary transition-colors duration-base">
              <IconNews class="w-4 h-4" /> Publicar noticias
            </RouterLink>
          </li>
        </ul>
      </AppCard>
    </div>
  </div>
</template>
