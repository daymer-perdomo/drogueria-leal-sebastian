<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import { useCart } from '../../composables/useCart'
import AppButton from '../ui/AppButton.vue'
import { IconPill, IconShoppingCart, IconMenu2, IconX, IconMessageReport } from '@tabler/icons-vue'

const { estaAutenticado, esAdmin, user, logout } = useAuth()
const { cantidad, abrir } = useCart()
const router = useRouter()
const menuMovilAbierto = ref(false)

async function manejarLogout() {
  await logout()
  router.push({ name: 'home' })
}
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
        class="flex items-center gap-2 font-bold text-lg text-primary"
      >
        <IconPill class="w-6 h-6 text-primary" />
        <span class="hidden sm:block">Droguería Leal Sebastián</span>
        <span class="sm:hidden">DLS</span>
      </RouterLink>

      <!-- Navegación desktop -->
      <nav class="hidden md:flex items-center gap-6 text-sm font-medium">
        <RouterLink
          :to="{ name: 'catalogo' }"
          class="text-text-secondary hover:text-primary transition-colors duration-base"
          active-class="text-primary"
        >
          Catálogo
        </RouterLink>
        <RouterLink
          :to="{ name: 'noticias' }"
          class="text-text-secondary hover:text-primary transition-colors duration-base"
          active-class="text-primary"
        >
          Noticias
        </RouterLink>
        <RouterLink
          :to="{ name: 'quejas' }"
          class="flex items-center gap-1 text-text-secondary hover:text-primary transition-colors duration-base"
          active-class="text-primary"
        >
          <IconMessageReport class="w-4 h-4" />
          Quejas
        </RouterLink>
        <RouterLink
          v-if="estaAutenticado"
          :to="{ name: 'mis-pedidos' }"
          class="text-text-secondary hover:text-primary transition-colors duration-base"
          active-class="text-primary"
        >
          Mis Pedidos
        </RouterLink>
        <RouterLink
          v-if="esAdmin"
          :to="{ name: 'admin-dashboard' }"
          class="text-text-secondary hover:text-primary transition-colors duration-base"
          active-class="text-primary"
        >
          Admin
        </RouterLink>
      </nav>

      <!-- Acciones -->
      <div class="flex items-center gap-2">
        <!-- Carrito -->
        <button
          class="relative p-2 text-text-secondary hover:text-primary transition-colors duration-base rounded-md"
          aria-label="Abrir carrito"
          @click="abrir()"
        >
          <IconShoppingCart class="h-6 w-6" />
          <span
            v-if="cantidad > 0"
            class="absolute -top-0.5 -right-0.5 bg-primary text-text-inverse text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold"
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
</style>
