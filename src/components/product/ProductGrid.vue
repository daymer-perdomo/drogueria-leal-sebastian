<script setup lang="ts">
import type { ProductoConCategoria } from '../../types/product.types'
import ProductCard from './ProductCard.vue'

defineProps<{
  productos: ProductoConCategoria[]
  cargando?: boolean
}>()
</script>

<template>
  <div>
    <div v-if="cargando" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
      <div
        v-for="n in 8"
        :key="n"
        class="card overflow-hidden animate-pulse"
      >
        <div class="aspect-square bg-surface-muted" />
        <div class="p-2 sm:p-4 flex flex-col gap-3">
          <div class="h-3 bg-surface-muted rounded w-1/2" />
          <div class="h-4 bg-surface-muted rounded w-3/4" />
          <div class="h-3 bg-surface-muted rounded" />
          <div class="h-8 bg-surface-muted rounded mt-2" />
        </div>
      </div>
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
