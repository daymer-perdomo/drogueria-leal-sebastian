<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useProducts } from '../../composables/useProducts'
import ProductGrid from '../../components/product/ProductGrid.vue'
import AppButton from '../../components/ui/AppButton.vue'
import HomeBanner from '../../components/ui/HomeBanner.vue'
import * as bannersService from '../../services/banners.service'
import type { Banner } from '../../services/banners.service'
import {
  IconPill,
  IconBottle,
  IconBarbell,
  IconStethoscope,
  IconBabyCarriage,
} from '@tabler/icons-vue'

const { productos, cargando, cargar } = useProducts({ porPagina: 8, soloActivos: true })
const banners = ref<Banner[]>([])

onMounted(async () => {
  await Promise.all([
    cargar(),
    bannersService.listarBanners(true).then((b) => { banners.value = b }).catch(() => {}),
  ])
})

const categorias = [
  { slug: 'medicamentos', label: 'Medicamentos', icon: IconPill },
  { slug: 'cuidado-personal', label: 'Cuidado Personal', icon: IconBottle },
  { slug: 'suplementos', label: 'Suplementos', icon: IconBarbell },
  { slug: 'dispositivos-medicos', label: 'Dispositivos', icon: IconStethoscope },
  { slug: 'bebe-maternidad', label: 'Bebé', icon: IconBabyCarriage },
]
</script>

<template>
  <main>
    <!-- Banner publicitario -->
    <div v-if="banners.length > 0" class="container-app px-4 pt-6">
      <HomeBanner :banners="banners" />
    </div>

    <!-- Hero -->
    <section class="bg-gradient-to-br from-primary-50 to-accent-50 py-16 md:py-24">
      <div class="container-app text-center">
        <h1 class="text-3xl md:text-4xl font-bold text-primary-900 mb-4">
          Droguería Leal Sebastián
        </h1>
        <p class="text-lg text-text-secondary max-w-xl mx-auto mb-8">
          Tu salud, nuestra prioridad. Medicamentos, vitaminas, cuidado personal y dispositivos médicos con atención experta.
        </p>
        <div class="flex gap-3 justify-center flex-wrap">
          <RouterLink :to="{ name: 'catalogo' }">
            <AppButton tamano="lg">Ver catálogo</AppButton>
          </RouterLink>
          <RouterLink :to="{ name: 'noticias' }">
            <AppButton variante="outline" tamano="lg">Noticias de salud</AppButton>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- Destacados -->
    <section class="container-app py-12">
      <h2 class="text-2xl font-bold text-text-primary mb-6">Productos destacados</h2>
      <ProductGrid :productos="productos" :cargando="cargando" />
      <div class="text-center mt-8">
        <RouterLink :to="{ name: 'catalogo' }">
          <AppButton variante="outline">Ver todos los productos</AppButton>
        </RouterLink>
      </div>
    </section>

    <!-- Categorías rápidas -->
    <section class="bg-surface-subtle py-12">
      <div class="container-app">
        <h2 class="text-2xl font-bold text-text-primary mb-6">Categorías</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          <RouterLink
            v-for="cat in categorias"
            :key="cat.slug"
            :to="{ name: 'catalogo', query: { categoria: cat.slug } }"
            class="card p-4 flex flex-col items-center gap-2 text-center hover:shadow-md transition-shadow duration-base cursor-pointer"
          >
            <component :is="cat.icon" class="w-8 h-8 text-primary" />
            <span class="text-sm font-medium text-text-primary">{{ cat.label }}</span>
          </RouterLink>
        </div>
      </div>
    </section>
  </main>
</template>
