<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as newsService from '../../services/news.service'
import type { Noticia } from '../../services/news.service'
import { useNotification } from '../../composables/useNotification'
import AppButton from '../../components/ui/AppButton.vue'
import AppInput from '../../components/ui/AppInput.vue'
import AppModal from '../../components/ui/AppModal.vue'
import AppBadge from '../../components/ui/AppBadge.vue'

const noticias = ref<Noticia[]>([])
const cargando = ref(false)
const modalAbierto = ref(false)
const guardando = ref(false)
const notif = useNotification()

const form = ref({ titulo: '', contenido: '', imagen_url: '', publicado: false })

onMounted(async () => {
  cargando.value = true
  try {
    noticias.value = await newsService.listarNoticias(false)
  } finally {
    cargando.value = false
  }
})

function abrirModal() {
  form.value = { titulo: '', contenido: '', imagen_url: '', publicado: false }
  modalAbierto.value = true
}

async function guardar() {
  if (!form.value.titulo || !form.value.contenido) {
    notif.advertencia('El título y contenido son requeridos')
    return
  }
  guardando.value = true
  try {
    const nueva = await newsService.crearNoticia(
      form.value.titulo,
      form.value.contenido,
      form.value.imagen_url || undefined,
    )
    noticias.value.unshift(nueva)
    if (form.value.publicado) {
      await newsService.actualizarNoticia(nueva.id, { publicado: true })
      if (noticias.value[0]) noticias.value[0].publicado = true
    }
    notif.exito('Noticia guardada')
    modalAbierto.value = false
  } catch (err) {
    notif.error(err instanceof Error ? err.message : 'Error al guardar')
  } finally {
    guardando.value = false
  }
}

async function togglePublicado(noticia: Noticia) {
  try {
    await newsService.actualizarNoticia(noticia.id, { publicado: !noticia.publicado })
    noticia.publicado = !noticia.publicado
    notif.exito(noticia.publicado ? 'Noticia publicada' : 'Noticia despublicada')
  } catch (err) {
    notif.error(err instanceof Error ? err.message : 'Error')
  }
}

async function eliminar(id: string) {
  if (!confirm('¿Eliminar esta noticia?')) return
  try {
    await newsService.eliminarNoticia(id)
    noticias.value = noticias.value.filter((n) => n.id !== id)
    notif.exito('Noticia eliminada')
  } catch (err) {
    notif.error(err instanceof Error ? err.message : 'Error')
  }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-text-primary">Noticias</h1>
      <AppButton @click="abrirModal">+ Nueva noticia</AppButton>
    </div>

    <div v-if="cargando" class="flex flex-col gap-3">
      <div v-for="n in 4" :key="n" class="card p-4 animate-pulse h-20" />
    </div>

    <div v-else class="flex flex-col gap-3">
      <div
        v-for="noticia in noticias"
        :key="noticia.id"
        class="card p-4 flex items-start justify-between gap-4"
      >
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <h3 class="font-medium text-text-primary truncate">{{ noticia.titulo }}</h3>
            <AppBadge :variante="noticia.publicado ? 'success' : 'default'">
              {{ noticia.publicado ? 'Publicada' : 'Borrador' }}
            </AppBadge>
          </div>
          <p class="text-sm text-text-secondary line-clamp-2">{{ noticia.contenido }}</p>
        </div>
        <div class="flex items-center gap-2 flex-shrink-0">
          <AppButton variante="outline" tamano="sm" @click="togglePublicado(noticia)">
            {{ noticia.publicado ? 'Despublicar' : 'Publicar' }}
          </AppButton>
          <AppButton variante="danger" tamano="sm" @click="eliminar(noticia.id)">
            Eliminar
          </AppButton>
        </div>
      </div>
    </div>

    <AppModal :abierto="modalAbierto" titulo="Nueva Noticia" @cerrar="modalAbierto = false">
      <div class="flex flex-col gap-4">
        <AppInput v-model="form.titulo" label="Título" placeholder="Título de la noticia" requerido />
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-text-primary">Contenido <span class="text-error">*</span></label>
          <textarea v-model="form.contenido" rows="5" class="input-base resize-none" placeholder="Escribe el contenido de la noticia..." />
        </div>
        <AppInput v-model="form.imagen_url" label="URL de imagen (opcional)" tipo="url" placeholder="https://..." />
        <div class="flex items-center gap-2">
          <input v-model="form.publicado" type="checkbox" id="publicar" class="w-4 h-4" />
          <label for="publicar" class="text-sm text-text-secondary">Publicar inmediatamente</label>
        </div>
      </div>
      <template #footer>
        <div class="flex gap-2 justify-end">
          <AppButton variante="ghost" @click="modalAbierto = false">Cancelar</AppButton>
          <AppButton :cargando="guardando" @click="guardar">Guardar</AppButton>
        </div>
      </template>
    </AppModal>
  </div>
</template>
