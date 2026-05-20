<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import * as productsService from '../../services/products.service'
import * as ordersService from '../../services/orders.service'
import AppCard from '../../components/ui/AppCard.vue'
import AppButton from '../../components/ui/AppButton.vue'
import {
  IconPackage, IconBell, IconCamera, IconShoppingBag, IconNews, IconArrowRight,
  IconQrcode, IconCopy, IconCheck, IconDeviceMobile,
} from '@tabler/icons-vue'

const totalProductos = ref(0)
const ordenesPendientes = ref(0)
const cargando = ref(false)
const copiado = ref(false)

const appUrl = import.meta.env.VITE_APP_URL ?? window.location.origin
const urlCaptura = computed(() => `${appUrl}/admin/capturar-producto`)
const qrUrl = computed(
  () => `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(urlCaptura.value)}&bgcolor=ffffff&color=1a1a2e&margin=10`,
)

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

async function copiarUrl() {
  try {
    await navigator.clipboard.writeText(urlCaptura.value)
    copiado.value = true
    setTimeout(() => { copiado.value = false }, 2000)
  } catch {
    // Fallback para navegadores que bloquean clipboard sin HTTPS
    const el = document.createElement('textarea')
    el.value = urlCaptura.value
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
    copiado.value = true
    setTimeout(() => { copiado.value = false }, 2000)
  }
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-text-primary mb-6">Dashboard</h1>

    <!-- Métricas -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
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
      <!-- Accesos rápidos -->
      <AppCard>
        <h2 class="font-semibold text-text-primary mb-4">Accesos rápidos</h2>
        <ul class="flex flex-col gap-1">
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

      <!-- Captura desde móvil -->
      <AppCard>
        <div class="flex items-center gap-2 mb-4">
          <IconDeviceMobile class="w-5 h-5 text-primary" />
          <h2 class="font-semibold text-text-primary">Captura desde móvil</h2>
        </div>

        <p class="text-sm text-text-secondary mb-4">
          Escanea el QR con tu teléfono o copia la URL para capturar productos usando la cámara trasera.
        </p>

        <!-- QR Code -->
        <div class="flex justify-center mb-4">
          <div class="p-2 border border-border rounded-xl bg-white inline-block shadow-sm">
            <img
              :src="qrUrl"
              alt="QR Captura de producto"
              class="w-[180px] h-[180px] block"
            />
          </div>
        </div>

        <!-- URL + botón copiar -->
        <div class="flex items-center gap-2 bg-surface-muted rounded-lg px-3 py-2">
          <IconQrcode class="w-4 h-4 text-text-muted flex-shrink-0" />
          <p class="text-xs text-text-secondary font-mono truncate flex-1">{{ urlCaptura }}</p>
          <button
            class="flex-shrink-0 p-1 rounded-md hover:bg-surface-subtle transition-colors duration-base"
            :title="copiado ? '¡Copiado!' : 'Copiar URL'"
            @click="copiarUrl"
          >
            <IconCheck v-if="copiado" class="w-4 h-4 text-success" />
            <IconCopy v-else class="w-4 h-4 text-text-muted" />
          </button>
        </div>

        <p class="text-xs text-text-muted mt-2 text-center">
          Deberás iniciar sesión con tu cuenta admin en el móvil
        </p>
      </AppCard>
    </div>
  </div>
</template>
