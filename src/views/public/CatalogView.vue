<script setup lang="ts">
import { onMounted, watch, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useProducts } from '../../composables/useProducts'
import * as categoriasService from '../../services/categories.service'
import type { Categoria } from '../../types/category.types'
import ProductGrid from '../../components/product/ProductGrid.vue'
import AppInput from '../../components/ui/AppInput.vue'

const route = useRoute()
const { productos, cargando, totalProductos, totalPaginas, filtros, aplicarFiltros, irAPagina } = useProducts({ soloActivos: true })

const busqueda = ref('')
const categorias = ref<Categoria[]>([])

function slugAId(slug: string | undefined): string | undefined {
  if (!slug) return undefined
  return categorias.value.find((c) => c.slug === slug)?.id
}

onMounted(async () => {
  try {
    categorias.value = await categoriasService.listarCategorias()
  } catch {
    // categories are non-critical; proceed without filter sidebar
  }
  const slug = route.query.categoria as string | undefined
  const q = route.query.busqueda as string | undefined
  if (q) busqueda.value = q
  aplicarFiltros({ categoriaId: slugAId(slug), busqueda: q || undefined })
})

watch(() => route.query, (query) => {
  const slug = query.categoria as string | undefined
  const q = query.busqueda as string | undefined
  if (q !== undefined) busqueda.value = q ?? ''
  aplicarFiltros({ categoriaId: slugAId(slug), busqueda: q || undefined })
})

let timeout: ReturnType<typeof setTimeout>
function onBusqueda() {
  clearTimeout(timeout)
  timeout = setTimeout(() => aplicarFiltros({ busqueda: busqueda.value || undefined }), 400)
}
</script>

<template>
  <main class="container-app py-8">
    <h1 class="text-3xl font-bold text-text-primary mb-6">Catálogo</h1>

    <div class="flex flex-col md:flex-row gap-6">
      <!-- Sidebar filtros -->
      <aside class="w-full md:w-56 flex-shrink-0">
        <div class="card p-4 flex flex-col gap-4">
          <h3 class="font-semibold text-text-primary">Filtros</h3>

          <AppInput
            v-model="busqueda"
            placeholder="Buscar producto..."
            @input="onBusqueda"
          />

          <div>
            <h4 class="text-sm font-medium text-text-secondary mb-2">Categoría</h4>
            <ul class="flex flex-col gap-1">
              <li>
                <button
                  :class="['w-full text-left px-2 py-1.5 rounded-md text-sm transition-colors duration-base', !filtros.categoriaId ? 'bg-brand-blue/10 text-brand-blue font-medium' : 'text-text-secondary hover:bg-surface-muted']"
                  @click="aplicarFiltros({ categoriaId: undefined })"
                >
                  Todas
                </button>
              </li>
              <li v-for="cat in categorias" :key="cat.id">
                <button
                  :class="['w-full text-left px-2 py-1.5 rounded-md text-sm transition-colors duration-base', filtros.categoriaId === cat.id ? 'bg-brand-blue/10 text-brand-blue font-medium' : 'text-text-secondary hover:bg-surface-muted']"
                  @click="aplicarFiltros({ categoriaId: cat.id })"
                >
                  {{ cat.nombre }}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </aside>

      <!-- Productos -->
      <div class="flex-1 min-w-0">
        <p class="text-sm text-text-muted mb-4">{{ totalProductos }} producto{{ totalProductos !== 1 ? 's' : '' }} encontrado{{ totalProductos !== 1 ? 's' : '' }}</p>
        <ProductGrid :productos="productos" :cargando="cargando" />

        <!-- Paginación -->
        <div v-if="totalPaginas > 1" class="flex justify-center gap-2 mt-8">
          <button
            v-for="p in totalPaginas"
            :key="p"
            :class="['w-9 h-9 rounded-md text-sm font-medium transition-colors duration-base', filtros.pagina === p ? 'bg-brand-blue text-white' : 'border border-border text-text-secondary hover:border-brand-blue hover:text-brand-blue']"
            @click="irAPagina(p)"
          >
            {{ p }}
          </button>
        </div>
      </div>
    </div>
  </main>
</template>
