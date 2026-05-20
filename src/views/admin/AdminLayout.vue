<script setup lang="ts">
import { RouterView, RouterLink, useRoute } from 'vue-router'
import {
  IconLayoutDashboard,
  IconPackage,
  IconCamera,
  IconShoppingBag,
  IconNews,
  IconMessageReport,
  IconArrowLeft,
} from '@tabler/icons-vue'

const route = useRoute()

const nav = [
  { name: 'admin-dashboard', label: 'Dashboard', icon: IconLayoutDashboard },
  { name: 'admin-productos', label: 'Productos', icon: IconPackage },
  { name: 'admin-capturar', label: 'Capturar Producto', icon: IconCamera },
  { name: 'admin-ordenes', label: 'Órdenes', icon: IconShoppingBag },
  { name: 'admin-noticias', label: 'Noticias', icon: IconNews },
  { name: 'admin-quejas', label: 'Quejas', icon: IconMessageReport },
]
</script>

<template>
  <div class="flex min-h-screen">
    <!-- Sidebar -->
    <aside
      class="hidden md:flex flex-col bg-primary-900 text-primary-100"
      :style="{ width: 'var(--sidebar-width)' }"
    >
      <div class="p-4 border-b border-primary-800">
        <p class="font-bold text-text-inverse text-sm">Panel Admin</p>
        <p class="text-xs text-primary-400 mt-0.5">Droguería Leal Sebastián</p>
      </div>
      <nav class="flex flex-col p-2 gap-1 flex-1">
        <RouterLink
          v-for="item in nav"
          :key="item.name"
          :to="{ name: item.name }"
          :class="[
            'flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors duration-base',
            route.name === item.name
              ? 'bg-primary text-text-inverse'
              : 'text-primary-300 hover:bg-primary-800 hover:text-text-inverse',
          ]"
        >
          <component :is="item.icon" class="w-4 h-4" />
          {{ item.label }}
        </RouterLink>
      </nav>
      <div class="p-4 border-t border-primary-800">
        <RouterLink :to="{ name: 'home' }" class="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-200">
          <IconArrowLeft class="w-3 h-3" /> Ver tienda
        </RouterLink>
      </div>
    </aside>

    <!-- Contenido -->
    <div class="flex-1 min-w-0 flex flex-col">
      <!-- Top bar móvil -->
      <div class="md:hidden bg-primary-900 text-primary-100 px-4 py-3 flex items-center gap-4 overflow-x-auto">
        <RouterLink
          v-for="item in nav"
          :key="item.name"
          :to="{ name: item.name }"
          :class="[
            'flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors duration-base',
            route.name === item.name ? 'bg-primary text-text-inverse' : 'text-primary-300',
          ]"
        >
          <component :is="item.icon" class="w-4 h-4" />
          {{ item.label }}
        </RouterLink>
      </div>

      <main class="flex-1 p-4 md:p-8 bg-surface-subtle">
        <RouterView />
      </main>
    </div>
  </div>
</template>
