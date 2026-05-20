<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useNotification } from '../../composables/useNotification'
import * as bannersService from '../../services/banners.service'
import { subirImagenBanner } from '../../services/upload.service'
import type { Banner } from '../../services/banners.service'
import AppButton from '../../components/ui/AppButton.vue'
import AppInput from '../../components/ui/AppInput.vue'
import { IconPhoto, IconTrash, IconCheck, IconX, IconGripVertical } from '@tabler/icons-vue'

const notif = useNotification()
const banners = ref<Banner[]>([])
const cargando = ref(true)
const confirmarEliminar = ref<string | null>(null)
const eliminando = ref<string | null>(null)

async function cargar() {
  try {
    banners.value = await bannersService.listarBanners(false)
  } catch {
    notif.error('Error al cargar banners')
  } finally {
    cargando.value = false
  }
}

onMounted(cargar)

// ── Formulario nuevo banner ───────────────────────────────────────────────────
const archivoSeleccionado = ref<File | null>(null)
const preview = ref<string | null>(null)
const titulo = ref('')
const subtitulo = ref('')
const enlace = ref('')
const subiendo = ref(false)

function seleccionarArchivo(e: Event) {
  const input = e.target as HTMLInputElement
  const archivo = input.files?.[0]
  if (!archivo) return
  archivoSeleccionado.value = archivo
  preview.value = URL.createObjectURL(archivo)
}

function limpiarForm() {
  if (preview.value) URL.revokeObjectURL(preview.value)
  archivoSeleccionado.value = null
  preview.value = null
  titulo.value = ''
  subtitulo.value = ''
  enlace.value = ''
}

async function crear() {
  if (!archivoSeleccionado.value) {
    notif.advertencia('Selecciona una imagen')
    return
  }
  subiendo.value = true
  try {
    const imagen_url = await subirImagenBanner(archivoSeleccionado.value)
    const maxOrden = banners.value.reduce((m, b) => Math.max(m, b.orden), -1)
    await bannersService.crearBanner({
      imagen_url,
      titulo: titulo.value.trim() || undefined,
      subtitulo: subtitulo.value.trim() || undefined,
      enlace: enlace.value.trim() || undefined,
      orden: maxOrden + 1,
    })
    notif.exito('Banner agregado')
    limpiarForm()
    await cargar()
  } catch (err) {
    notif.error(err instanceof Error ? err.message : 'Error al crear banner')
  } finally {
    subiendo.value = false
  }
}

async function toggleActivo(banner: Banner) {
  try {
    await bannersService.actualizarBanner(banner.id, { activo: !banner.activo })
    banner.activo = !banner.activo
  } catch {
    notif.error('Error al actualizar')
  }
}

async function borrar(id: string) {
  eliminando.value = id
  confirmarEliminar.value = null
  try {
    await bannersService.borrarBanner(id)
    notif.exito('Banner eliminado')
    await cargar()
  } catch {
    notif.error('Error al eliminar')
  } finally {
    eliminando.value = null
  }
}
</script>

<template>
  <div class="max-w-3xl mx-auto flex flex-col gap-8">
    <h1 class="text-2xl font-bold text-text-primary flex items-center gap-2">
      <IconPhoto class="w-6 h-6" /> Banners publicitarios
    </h1>

    <!-- Formulario nuevo banner -->
    <section class="card p-6">
      <h2 class="font-semibold text-text-primary mb-5 text-lg">Nuevo banner</h2>
      <div class="flex flex-col gap-4">

        <!-- Upload imagen -->
        <div>
          <div
            v-if="preview"
            class="w-full rounded-xl overflow-hidden mb-3 relative bg-surface-muted"
            style="aspect-ratio: 1200/450"
          >
            <img :src="preview" alt="Preview" class="w-full h-full object-cover" />
            <button
              type="button"
              class="absolute top-2 right-2 bg-error text-white rounded-full w-7 h-7 flex items-center justify-center"
              @click="limpiarForm"
            >
              <IconX class="w-4 h-4" />
            </button>
          </div>
          <label
            :class="[
              'flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed cursor-pointer transition-colors py-8',
              preview ? 'border-primary bg-primary-50' : 'border-border hover:border-primary hover:bg-primary-50',
            ]"
          >
            <input type="file" accept="image/*" class="sr-only" @change="seleccionarArchivo" />
            <IconPhoto class="w-8 h-8 text-text-muted" />
            <span class="text-sm text-text-secondary font-medium">
              {{ preview ? 'Cambiar imagen' : 'Seleccionar imagen del banner' }}
            </span>
            <span class="text-xs text-text-muted">Se optimizará a 1200×500 px</span>
          </label>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <AppInput v-model="titulo" id="ban-titulo" label="Título (opcional)" placeholder="Oferta especial" />
          <AppInput v-model="subtitulo" id="ban-sub" label="Subtítulo (opcional)" placeholder="Hasta 30% de descuento" />
        </div>
        <AppInput v-model="enlace" id="ban-enlace" label="Enlace al hacer clic (opcional)" placeholder="https://..." />

        <AppButton bloque :cargando="subiendo" @click="crear">
          {{ subiendo ? 'Subiendo...' : 'Agregar banner' }}
        </AppButton>
      </div>
    </section>

    <!-- Lista de banners -->
    <section class="card overflow-hidden">
      <div class="px-6 py-4 border-b border-border">
        <h2 class="font-semibold text-text-primary text-lg">Banners activos</h2>
      </div>

      <div v-if="cargando" class="p-6 flex flex-col gap-3">
        <div v-for="n in 2" :key="n" class="h-24 bg-surface-muted rounded animate-pulse" />
      </div>

      <div v-else-if="banners.length === 0" class="p-8 text-center text-text-muted text-sm">
        No hay banners. Agrega el primero.
      </div>

      <div v-else class="divide-y divide-border">
        <div
          v-for="b in banners"
          :key="b.id"
          class="flex items-center gap-4 px-4 py-3"
          :class="{ 'opacity-50': !b.activo }"
        >
          <IconGripVertical class="w-4 h-4 text-text-muted flex-shrink-0" />

          <img
            :src="b.imagen_url"
            :alt="b.titulo ?? 'Banner'"
            class="w-24 h-9 object-cover rounded flex-shrink-0"
          />

          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-text-primary truncate">{{ b.titulo ?? '(sin título)' }}</p>
            <p v-if="b.subtitulo" class="text-xs text-text-muted truncate">{{ b.subtitulo }}</p>
          </div>

          <div class="flex items-center gap-2 flex-shrink-0">
            <AppButton
              :variante="b.activo ? 'ghost' : 'outline'"
              tamano="sm"
              @click="toggleActivo(b)"
            >
              {{ b.activo ? 'Ocultar' : 'Mostrar' }}
            </AppButton>

            <template v-if="confirmarEliminar === b.id">
              <AppButton
                variante="ghost"
                tamano="sm"
                class="text-error"
                :cargando="eliminando === b.id"
                @click="borrar(b.id)"
              >
                <IconCheck class="w-3.5 h-3.5 mr-1" />Sí
              </AppButton>
              <button type="button" class="text-text-muted hover:text-text-primary" @click="confirmarEliminar = null">
                <IconX class="w-4 h-4" />
              </button>
            </template>
            <button
              v-else
              type="button"
              class="text-text-muted hover:text-error transition-colors p-1"
              @click="confirmarEliminar = b.id"
            >
              <IconTrash class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
