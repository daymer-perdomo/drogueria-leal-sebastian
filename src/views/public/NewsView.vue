<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as newsService from '../../services/news.service'
import type { Noticia } from '../../services/news.service'
import { IconNews } from '@tabler/icons-vue'

const noticias = ref<Noticia[]>([])
const cargando = ref(false)

onMounted(async () => {
  cargando.value = true
  try {
    noticias.value = await newsService.listarNoticias()
  } finally {
    cargando.value = false
  }
})

function formatearFecha(fecha: string) {
  return new Intl.DateTimeFormat('es-CO', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(fecha))
}
</script>

<template>
  <main class="container-app py-8">
    <h1 class="text-3xl font-bold text-text-primary mb-8">Noticias de Salud</h1>

    <div v-if="cargando" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="n in 6" :key="n" class="card overflow-hidden animate-pulse">
        <div class="h-48 bg-surface-muted" />
        <div class="p-4 flex flex-col gap-3">
          <div class="h-5 bg-surface-muted rounded w-3/4" />
          <div class="h-3 bg-surface-muted rounded" />
          <div class="h-3 bg-surface-muted rounded w-2/3" />
        </div>
      </div>
    </div>

    <div v-else-if="noticias.length === 0" class="text-center py-16 text-text-muted">
      <IconNews class="w-12 h-12 mb-4 mx-auto opacity-50" />
      <p class="text-lg">No hay noticias disponibles</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <article
        v-for="noticia in noticias"
        :key="noticia.id"
        class="card overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-base"
      >
        <div v-if="noticia.imagen_url" class="aspect-video bg-surface-muted overflow-hidden">
          <img :src="noticia.imagen_url" :alt="noticia.titulo" class="w-full h-full object-cover" />
        </div>
        <div v-else class="aspect-video bg-primary-50 flex items-center justify-center text-primary opacity-40">
          <IconNews class="w-12 h-12" />
        </div>
        <div class="p-5 flex flex-col flex-1 gap-2">
          <p class="text-xs text-text-muted">{{ formatearFecha(noticia.created_at) }}</p>
          <h2 class="font-bold text-lg text-text-primary leading-tight">{{ noticia.titulo }}</h2>
          <p class="text-sm text-text-secondary flex-1 line-clamp-3">{{ noticia.contenido }}</p>
        </div>
      </article>
    </div>
  </main>
</template>
