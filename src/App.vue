<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth.store'
import AppNavbar from './components/layout/AppNavbar.vue'
import AppFooter from './components/layout/AppFooter.vue'
import CartDrawer from './components/cart/CartDrawer.vue'
import ToastContainer from './components/ui/ToastContainer.vue'

const authStore = useAuthStore()
const route = useRoute()

onMounted(() => {
  authStore.inicializar()
})

// Las vistas de admin y auth tienen su propio layout completo
const ocultarLayout = (ruta: string) =>
  ruta.startsWith('/admin') || ruta === '/login' || ruta === '/registro'
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <template v-if="!ocultarLayout(route.path)">
      <AppNavbar />
      <div class="flex-1">
        <RouterView />
      </div>
      <AppFooter />
    </template>

    <template v-else>
      <RouterView />
    </template>

    <CartDrawer />
    <ToastContainer />
  </div>
</template>
