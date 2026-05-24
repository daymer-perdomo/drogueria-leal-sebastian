<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth.store'
import AppNavbar from './components/layout/AppNavbar.vue'
import AppFooter from './components/layout/AppFooter.vue'
import CartDrawer from './components/cart/CartDrawer.vue'
import ToastContainer from './components/ui/ToastContainer.vue'
import AppSpinner from './components/ui/AppSpinner.vue'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

const cargandoRuta = ref(false)
let _timer: ReturnType<typeof setTimeout> | null = null

router.beforeEach(() => {
  _timer = setTimeout(() => { cargandoRuta.value = true }, 150)
})
router.afterEach(() => {
  if (_timer) { clearTimeout(_timer); _timer = null }
  cargandoRuta.value = false
})

onMounted(() => {
  authStore.inicializar()
})

const ocultarLayout = (ruta: string) =>
  ruta.startsWith('/admin') || ruta === '/login' || ruta === '/registro'
</script>

<template>
  <div class="min-h-screen flex flex-col">

    <!-- Spinner global de navegación -->
    <Transition name="nav-fade">
      <div
        v-if="cargandoRuta"
        class="fixed inset-0 z-[9999] flex items-center justify-center"
        style="background: rgba(255,255,255,0.75); backdrop-filter: blur(4px);"
      >
        <AppSpinner size="lg" />
      </div>
    </Transition>

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

<style>
.nav-fade-enter-active,
.nav-fade-leave-active {
  transition: opacity 0.2s ease;
}
.nav-fade-enter-from,
.nav-fade-leave-to {
  opacity: 0;
}
</style>
