<script setup lang="ts">
import { RouterLink } from 'vue-router'
import AppButton from '../../components/ui/AppButton.vue'
import { IconHome, IconLayoutGrid, IconPill } from '@tabler/icons-vue'
</script>

<template>
  <main class="flex items-center justify-center py-20 px-4">
    <div class="text-center max-w-lg w-full">

      <!-- Ilustración decorativa -->
      <div class="relative inline-flex items-center justify-center mb-8">
        <span class="ring-outer" />
        <span class="ring-inner" />
        <IconPill class="relative z-10 w-14 h-14" style="color: var(--color-brand-blue)" />
      </div>

      <!-- Número con gradiente de marca -->
      <h1 class="num-404">404</h1>

      <!-- Texto -->
      <p class="text-2xl font-bold text-text-primary mt-2 mb-3">
        Página no encontrada
      </p>
      <p class="text-text-secondary mb-10 leading-relaxed">
        La página que buscas no existe, fue movida o la URL está incorrecta.
      </p>

      <!-- Acciones -->
      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <RouterLink :to="{ name: 'home' }">
          <AppButton tamano="lg" class="w-full sm:w-auto">
            <IconHome class="w-4 h-4" />
            Ir al inicio
          </AppButton>
        </RouterLink>
        <RouterLink :to="{ name: 'catalogo' }">
          <AppButton variante="outline" tamano="lg" class="w-full sm:w-auto">
            <IconLayoutGrid class="w-4 h-4" />
            Ver catálogo
          </AppButton>
        </RouterLink>
      </div>

    </div>
  </main>
</template>

<style scoped>
.num-404 {
  font-size: clamp(5rem, 20vw, 9rem);
  font-weight: 900;
  line-height: 1;
  background: var(--gradient-brand);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.04em;
}

.ring-outer,
.ring-inner {
  position: absolute;
  border-radius: 50%;
  border-style: solid;
}

.ring-outer {
  inset: -1.5rem;
  border-width: 2px;
  border-color: var(--color-brand-blue);
  opacity: 0.15;
}

.ring-inner {
  inset: -0.5rem;
  border-width: 2px;
  border-color: var(--color-brand-turquoise);
  opacity: 0.25;
}
</style>
