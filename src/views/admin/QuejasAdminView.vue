<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import * as quejasService from '../../services/quejas.service'
import { useNotification } from '../../composables/useNotification'
import type { Queja, EstadoQueja } from '../../types/queja.types'
import AppBadge from '../../components/ui/AppBadge.vue'
import AppButton from '../../components/ui/AppButton.vue'
import AppModal from '../../components/ui/AppModal.vue'
import {
  IconMessageReport,
  IconClock,
  IconCheck,
  IconMail,
  IconSend,
} from '@tabler/icons-vue'

const notif = useNotification()
const quejas = ref<Queja[]>([])
const cargando = ref(false)
const filtroEstado = ref<EstadoQueja | 'todas'>('todas')
const quejaSeleccionada = ref<Queja | null>(null)
const modalAbierto = ref(false)
const respuestaEditada = ref('')
const guardando = ref(false)

const estados: Array<{ valor: EstadoQueja | 'todas'; label: string }> = [
  { valor: 'todas', label: 'Todas' },
  { valor: 'nueva', label: 'Nuevas' },
  { valor: 'en_proceso', label: 'En proceso' },
  { valor: 'resuelta', label: 'Resueltas' },
]

const variantePorEstado: Record<EstadoQueja, 'warning' | 'info' | 'success'> = {
  nueva: 'warning',
  en_proceso: 'info',
  resuelta: 'success',
}

const etiquetaEstado: Record<EstadoQueja, string> = {
  nueva: 'Nueva',
  en_proceso: 'En proceso',
  resuelta: 'Resuelta',
}

const quejasFiltradas = computed(() =>
  filtroEstado.value === 'todas'
    ? quejas.value
    : quejas.value.filter((q) => q.estado === filtroEstado.value),
)

const contadorPorEstado = computed(() => ({
  todas: quejas.value.length,
  nueva: quejas.value.filter((q) => q.estado === 'nueva').length,
  en_proceso: quejas.value.filter((q) => q.estado === 'en_proceso').length,
  resuelta: quejas.value.filter((q) => q.estado === 'resuelta').length,
}))

onMounted(async () => {
  await cargar()
})

async function cargar() {
  cargando.value = true
  try {
    quejas.value = await quejasService.listarTodasLasQuejas()
  } finally {
    cargando.value = false
  }
}

function abrirQueja(queja: Queja) {
  quejaSeleccionada.value = { ...queja }
  respuestaEditada.value = queja.respuesta ?? ''
  modalAbierto.value = true
}

function cerrarModal() {
  modalAbierto.value = false
  quejaSeleccionada.value = null
}

async function cambiarEstado(queja: Queja, estado: EstadoQueja) {
  try {
    const actualizada = await quejasService.actualizarQueja(queja.id, { estado })
    actualizarEnLista(actualizada)
    if (quejaSeleccionada.value?.id === queja.id) {
      quejaSeleccionada.value = { ...quejaSeleccionada.value, estado }
    }
    notif.exito('Estado actualizado')
  } catch {
    notif.error('No se pudo actualizar el estado')
  }
}

async function guardarRespuesta() {
  if (!quejaSeleccionada.value) return
  guardando.value = true
  try {
    const actualizada = await quejasService.actualizarQueja(quejaSeleccionada.value.id, {
      respuesta: respuestaEditada.value.trim() || undefined,
      estado: quejaSeleccionada.value.estado === 'nueva' ? 'en_proceso' : quejaSeleccionada.value.estado,
    })
    actualizarEnLista(actualizada)
    quejaSeleccionada.value = actualizada
    notif.exito('Respuesta guardada')
    cerrarModal()
  } catch {
    notif.error('No se pudo guardar la respuesta')
  } finally {
    guardando.value = false
  }
}

function actualizarEnLista(actualizada: Queja) {
  const idx = quejas.value.findIndex((q) => q.id === actualizada.id)
  if (idx !== -1) quejas.value[idx] = actualizada
}

function formatearFecha(fecha: string) {
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(fecha),
  )
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-text-primary mb-6">Quejas y Solicitudes</h1>

    <!-- Filtros de estado -->
    <div class="flex gap-2 flex-wrap mb-6">
      <button
        v-for="tab in estados"
        :key="tab.valor"
        :class="[
          'px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-base',
          filtroEstado === tab.valor
            ? 'bg-primary text-text-inverse'
            : 'bg-surface-muted text-text-secondary hover:bg-surface-subtle',
        ]"
        @click="filtroEstado = tab.valor"
      >
        {{ tab.label }}
        <span
          :class="[
            'ml-1.5 text-xs rounded-full px-1.5 py-0.5',
            filtroEstado === tab.valor ? 'bg-white/20' : 'bg-border',
          ]"
        >
          {{ contadorPorEstado[tab.valor] }}
        </span>
      </button>
    </div>

    <!-- Skeleton carga -->
    <div v-if="cargando" class="flex flex-col gap-3">
      <div v-for="n in 4" :key="n" class="card p-4 animate-pulse h-20" />
    </div>

    <!-- Estado vacío -->
    <div v-else-if="quejasFiltradas.length === 0" class="text-center py-16 text-text-muted">
      <IconMessageReport class="w-12 h-12 mx-auto mb-3 opacity-40" />
      <p>No hay quejas en esta categoría</p>
    </div>

    <!-- Listado -->
    <div v-else class="flex flex-col gap-3">
      <div
        v-for="queja in quejasFiltradas"
        :key="queja.id"
        class="card p-4 cursor-pointer hover:shadow-md transition-shadow duration-base"
        @click="abrirQueja(queja)"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <IconMail
                v-if="queja.estado === 'nueva'"
                class="w-4 h-4 text-warning flex-shrink-0"
              />
              <IconClock
                v-else-if="queja.estado === 'en_proceso'"
                class="w-4 h-4 text-info flex-shrink-0"
              />
              <IconCheck
                v-else
                class="w-4 h-4 text-success flex-shrink-0"
              />
              <p class="font-medium text-text-primary text-sm truncate">{{ queja.asunto }}</p>
            </div>
            <p class="text-xs text-text-muted mb-1">
              {{ queja.nombre }} · {{ queja.email }}
            </p>
            <p class="text-sm text-text-secondary line-clamp-1">{{ queja.mensaje }}</p>
          </div>
          <div class="flex flex-col items-end gap-2 flex-shrink-0">
            <AppBadge :variante="variantePorEstado[queja.estado]">
              {{ etiquetaEstado[queja.estado] }}
            </AppBadge>
            <p class="text-xs text-text-muted">{{ formatearFecha(queja.created_at) }}</p>
          </div>
        </div>
        <div
          v-if="queja.respuesta"
          class="mt-2 text-xs text-info flex items-center gap-1"
        >
          <IconSend class="w-3 h-3" />
          Respuesta enviada
        </div>
      </div>
    </div>

    <!-- Modal detalle / respuesta -->
    <AppModal
      :abierto="modalAbierto"
      :titulo="quejaSeleccionada?.asunto"
      tamano="lg"
      @cerrar="cerrarModal"
    >
      <div v-if="quejaSeleccionada" class="flex flex-col gap-5">
        <!-- Datos del cliente -->
        <div class="bg-surface-subtle rounded-lg p-4 text-sm flex flex-col gap-2">
          <div class="flex justify-between">
            <span class="text-text-muted">Cliente</span>
            <span class="font-medium text-text-primary">{{ quejaSeleccionada.nombre }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-text-muted">Correo</span>
            <span class="font-medium text-text-primary">{{ quejaSeleccionada.email }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-text-muted">Fecha</span>
            <span class="font-medium text-text-primary">{{ formatearFecha(quejaSeleccionada.created_at) }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-text-muted">Estado</span>
            <AppBadge :variante="variantePorEstado[quejaSeleccionada.estado]">
              {{ etiquetaEstado[quejaSeleccionada.estado] }}
            </AppBadge>
          </div>
        </div>

        <!-- Mensaje -->
        <div>
          <p class="text-sm font-semibold text-text-primary mb-2">Mensaje del cliente</p>
          <p class="text-sm text-text-secondary leading-relaxed bg-surface-subtle rounded-lg p-3">
            {{ quejaSeleccionada.mensaje }}
          </p>
        </div>

        <!-- Cambio de estado -->
        <div>
          <p class="text-sm font-semibold text-text-primary mb-2">Cambiar estado</p>
          <div class="flex gap-2 flex-wrap">
            <AppButton
              v-for="est in (['nueva', 'en_proceso', 'resuelta'] as EstadoQueja[])"
              :key="est"
              :variante="quejaSeleccionada.estado === est ? 'primary' : 'ghost'"
              tamano="sm"
              class="capitalize"
              @click="cambiarEstado(quejaSeleccionada!, est)"
            >
              {{ etiquetaEstado[est] }}
            </AppButton>
          </div>
        </div>

        <!-- Respuesta -->
        <div>
          <label class="text-sm font-semibold text-text-primary mb-2 block">
            Respuesta al cliente
          </label>
          <textarea
            v-model="respuestaEditada"
            rows="4"
            placeholder="Escribe una respuesta para el cliente..."
            class="input-base resize-none w-full"
          />
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <AppButton variante="ghost" @click="cerrarModal">Cancelar</AppButton>
          <AppButton :cargando="guardando" @click="guardarRespuesta">
            <IconSend class="w-4 h-4" />
            Guardar respuesta
          </AppButton>
        </div>
      </template>
    </AppModal>
  </div>
</template>
