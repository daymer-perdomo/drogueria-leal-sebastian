<script setup lang="ts">
import type { ProductoConCategoria } from '../../types/product.types'
import ProductCard from './ProductCard.vue'
import AppSpinner from '../ui/AppSpinner.vue'

defineProps<{
  productos: ProductoConCategoria[]
  cargando?: boolean
}>()
</script>

<template>
  <div>
    <div v-if="cargando" class="flex justify-center items-center py-16">
      <AppSpinner size="lg" />
    </div>

    <div v-else-if="productos.length === 0" class="text-center py-16 text-text-muted">
      <p class="text-4xl mb-4">🔍</p>
      <p class="text-lg font-medium">No se encontraron productos</p>
      <p class="text-sm mt-1">Intenta con otros filtros</p>
    </div>

    <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
      <ProductCard
        v-for="producto in productos"
        :key="producto.id"
        :producto="producto"
      />
    </div>
  </div>
</template>
