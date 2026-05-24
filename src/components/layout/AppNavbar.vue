<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import { useCart } from '../../composables/useCart'
import AppButton from '../ui/AppButton.vue'
import SearchDropdown from '../ui/SearchDropdown.vue'
import { IconShoppingCart, IconMenu2, IconX, IconMessageReport, IconSearch } from '@tabler/icons-vue'
import logo from '../../assets/logo-2.png'

const { estaAutenticado, esAdmin, user, logout } = useAuth()
const { cantidad, abrir } = useCart()
const router = useRouter()
const menuMovilAbierto = ref(false)
const terminoBusqueda = ref('')
const dropdownVisible = ref(false)
const searchWrapper = ref<HTMLElement | null>(null)

async function manejarLogout() {
  await logout()
  router.push({ name: 'home' })
}

function buscar() {
  const termino = terminoBusqueda.value.trim()
  if (!termino) return
  router.push({ name: 'catalogo', query: { busqueda: termino } })
  terminoBusqueda.value = ''
  dropdownVisible.value = false
  menuMovilAbierto.value = false
}

function cerrarDropdown() {
  dropdownVisible.value = false
  terminoBusqueda.value = ''
}

function manejarClickFuera(e: MouseEvent) {
  if (searchWrapper.value && !searchWrapper.value.contains(e.target as Node)) {
    dropdownVisible.value = false
  }
}

function manejarEscape(e: KeyboardEvent) {
  if (e.key === 'Escape') dropdownVisible.value = false
}

onMounted(() => {
  document.addEventListener('click', manejarClickFuera)
  document.addEventListener('keydown', manejarEscape)
})
onUnmounted(() => {
  document.removeEventListener('click', manejarClickFuera)
  document.removeEventListener('keydown', manejarEscape)
})
</script>

<template>
  <header
    class="sticky top-0 bg-surface border-b border-border shadow-sm"
    style="z-index: var(--z-sticky)"
  >
    <div class="container-app flex items-center justify-between" style="height: var(--navbar-height)">
      <!-- Logo -->
      <RouterLink
        :to="{ name: 'home' }"
        class="flex items-center gap-2"
      >
        <img :src="logo" alt="Droguería Leal" class="h-10 w-auto" />
      </RouterLink>

      <!-- Navegación desktop -->
      <nav class="hidden md:flex items-center gap-6 text-sm font-medium">
        <RouterLink
          :to="{ name: 'catalogo' }"
          class="text-text-secondary hover:text-brand-blue transition-colors duration-base"
          active-class="text-brand-blue"
        >
          Catálogo
        </RouterLink>
        <RouterLink
          :to="{ name: 'noticias' }"
          class="text-text-secondary hover:text-brand-blue transition-colors duration-base"
          active-class="text-brand-blue"
        >
          Noticias
        </RouterLink>
        <RouterLink
          :to="{ name: 'quejas' }"
          class="flex items-center gap-1 text-text-secondary hover:text-brand-blue transition-colors duration-base"
          active-class="text-brand-blue"
        >
          <IconMessageReport class="w-4 h-4" />
          Quejas
        </RouterLink>
        <RouterLink
          v-if="estaAutenticado"
          :to="{ name: 'mis-pedidos' }"
          class="text-text-secondary hover:text-brand-blue transition-colors duration-base"
          active-class="text-brand-blue"
        >
          Mis Pedidos
        </RouterLink>
        <RouterLink
          v-if="esAdmin"
          :to="{ name: 'admin-dashboard' }"
          class="text-text-secondary hover:text-brand-blue transition-colors duration-base"
          active-class="text-brand-blue"
        >
          Admin
        </RouterLink>
      </nav>

      <!-- Acciones -->
      <div class="flex items-center gap-2">
        <!-- Carrito -->
        <button
          class="relative p-2 text-text-secondary hover:text-brand-blue transition-colors duration-base rounded-md"
          aria-label="Abrir carrito"
          @click="abrir()"
        >
          <IconShoppingCart class="h-6 w-6" />
          <span
            v-if="cantidad > 0"
            class="absolute -top-0.5 -right-0.5 bg-brand-blue text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold"
          >
            {{ cantidad > 99 ? '99+' : cantidad }}
          </span>
        </button>

        <!-- Auth desktop -->
        <template v-if="estaAutenticado">
          <span class="hidden md:block text-sm text-text-secondary">
            {{ user?.perfil?.nombre ?? user?.email }}
          </span>
          <AppButton variante="ghost" tamano="sm" class="hidden md:flex" @click="manejarLogout">
            Salir
          </AppButton>
        </template>
        <template v-else>
          <RouterLink :to="{ name: 'login' }" class="hidden md:block">
            <AppButton variante="outline" tamano="sm">Entrar</AppButton>
          </RouterLink>
          <RouterLink :to="{ name: 'registro' }" class="hidden md:block">
            <AppButton tamano="sm">Registrarse</AppButton>
          </RouterLink>
        </template>

        <!-- Botón menú móvil -->
        <button
          class="md:hidden p-2 text-text-secondary"
          @click="menuMovilAbierto = !menuMovilAbierto"
          aria-label="Menú"
        >
          <IconMenu2 v-if="!menuMovilAbierto" class="h-6 w-6" />
          <IconX v-else class="h-6 w-6" />
        </button>
      </div>
    </div>

    <!-- Menú móvil -->
    <Transition name="slide-down">
      <div
        v-if="menuMovilAbierto"
        class="md:hidden border-t border-border bg-surface px-4 py-4 flex flex-col gap-3"
      >
        <RouterLink :to="{ name: 'catalogo' }" class="text-text-secondary py-2" @click="menuMovilAbierto = false">Catálogo</RouterLink>
        <RouterLink :to="{ name: 'noticias' }" class="text-text-secondary py-2" @click="menuMovilAbierto = false">Noticias</RouterLink>
        <RouterLink :to="{ name: 'quejas' }" class="flex items-center gap-1.5 text-text-secondary py-2" @click="menuMovilAbierto = false">
          <IconMessageReport class="w-4 h-4" /> Quejas
        </RouterLink>
        <RouterLink v-if="estaAutenticado" :to="{ name: 'mis-pedidos' }" class="text-text-secondary py-2" @click="menuMovilAbierto = false">Mis Pedidos</RouterLink>
        <RouterLink v-if="esAdmin" :to="{ name: 'admin-dashboard' }" class="text-text-secondary py-2" @click="menuMovilAbierto = false">Admin</RouterLink>
        <hr class="border-border" />
        <template v-if="estaAutenticado">
          <AppButton variante="ghost" bloque @click="manejarLogout">Cerrar sesión</AppButton>
        </template>
        <template v-else>
          <RouterLink :to="{ name: 'login' }" @click="menuMovilAbierto = false">
            <AppButton variante="outline" bloque>Iniciar sesión</AppButton>
          </RouterLink>
          <RouterLink :to="{ name: 'registro' }" @click="menuMovilAbierto = false">
            <AppButton bloque>Registrarse</AppButton>
          </RouterLink>
        </template>
      </div>
    </Transition>

    <!-- Barra de búsqueda rápida -->
    <div class="search-band w-full border-t border-brand-blue/10">
      <div class="container-app px-4 py-3">
        <div ref="searchWrapper" class="relative">
          <form class="flex items-center gap-2 sm:gap-3" @submit.prevent="buscar">
            <div class="relative flex-1">
              <div class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <IconSearch class="w-5 h-5 text-brand-blue opacity-70" />
              </div>
              <input
                v-model="terminoBusqueda"
                type="search"
                placeholder="Busca por nombre o código de producto… Ej: Acetaminofén, MED-001"
                class="search-input w-full h-11 pl-11 pr-4 text-sm"
                autocomplete="off"
                @focus="dropdownVisible = true"
                @input="dropdownVisible = true"
              />
            </div>
            <button type="submit" class="search-btn h-11 px-5 sm:px-7 flex items-center gap-2 text-sm font-semibold whitespace-nowrap">
              <IconSearch class="w-4 h-4" />
              <span class="hidden sm:inline">Buscar</span>
            </button>
          </form>

          <SearchDropdown
            :termino="terminoBusqueda"
            :visible="dropdownVisible"
            @cerrar="cerrarDropdown"
          />
        </div>

        <p class="text-center text-xs text-text-muted mt-1.5 tracking-wide">
          Encuentra cualquier producto por nombre o por su código
        </p>
      </div>
    </div>
  </header>
</template>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all var(--transition-base);
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.search-band {
  background: linear-gradient(135deg, #f0f5ff 0%, #e8f9fb 100%);
}

.search-input {
  border-radius: 0.75rem;
  border: 1.5px solid #c7d9f5;
  background: #ffffff;
  color: var(--color-text-primary);
  box-shadow: 0 1px 4px rgba(15, 79, 168, 0.08);
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.search-input::placeholder {
  color: var(--color-text-muted);
}
.search-input:focus {
  border-color: var(--color-brand-blue);
  box-shadow: 0 0 0 3px rgba(15, 79, 168, 0.12), 0 1px 4px rgba(15, 79, 168, 0.08);
}
.search-input::-webkit-search-cancel-button {
  cursor: pointer;
}

.search-btn {
  border-radius: 0.75rem;
  background: var(--color-brand-blue);
  color: #ffffff;
  border: none;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(15, 79, 168, 0.25);
  transition: background 0.2s, box-shadow 0.2s, transform 0.15s;
}
.search-btn:hover {
  background: #0d4495;
  box-shadow: 0 4px 12px rgba(15, 79, 168, 0.35);
  transform: translateY(-1px);
}
.search-btn:active {
  transform: translateY(0);
  box-shadow: 0 1px 4px rgba(15, 79, 168, 0.2);
}
</style>
