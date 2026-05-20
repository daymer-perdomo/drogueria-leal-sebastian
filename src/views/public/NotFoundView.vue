<script setup lang="ts">
import { RouterLink } from 'vue-router'
import AppButton from '../../components/ui/AppButton.vue'
</script>

<template>
  <main class="min-h-screen flex items-center justify-center text-center p-4">
    <div>
      <p class="text-8xl mb-4">🔍</p>
      <h1 class="text-4xl font-bold text-text-primary mb-2">404</h1>
      <p class="text-xl text-text-secondary mb-8">Página no encontrada</p>
      <RouterLink :to="{ name: 'home' }">
        <AppButton tamano="lg">Volver al inicio</AppButton>
      </RouterLink>
    </div>
  </main>
</template>
