<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useNotification } from '../../composables/useNotification'
import * as mesasService from '../../services/mesas.service'
import type { Mesa } from '../../types/order.types'
import AppButton from '../../components/ui/AppButton.vue'
import AppInput from '../../components/ui/AppInput.vue'
import AppBadge from '../../components/ui/AppBadge.vue'
import { IconArmchair, IconPlus, IconTrash, IconToggleLeft, IconToggleRight } from '@tabler/icons-vue'

const notif = useNotification()

const mesas = ref<Mesa[]>([])
const cargando = ref(true)

async function cargar() {
  cargando.value = true
  try {
    mesas.value = await mesasService.listarMesas()
  } catch {
    notif.error('Error al cargar mesas')
  } finally {
    cargando.value = false
  }
}

onMounted(cargar)

// ── Crear ─────────────────────────────────────────────────────────────────────
const nombre = ref('')
const guardando = ref(false)

async function crear() {
  if (!nombre.value.trim()) {
    notif.advertencia('El nombre es requerido')
    return
  }
  guardando.value = true
  try {
    await mesasService.crearMesa(nombre.value)
    notif.exito('Mesa creada')
    nombre.value = ''
    await cargar()
  } catch (err) {
    notif.error(err instanceof Error ? err.message : 'Error al crear mesa')
  } finally {
    guardando.value = false
  }
}

// ── Toggle activo ─────────────────────────────────────────────────────────────
async function toggleActivo(mesa: Mesa) {
  try {
    await mesasService.toggleMesa(mesa.id, !mesa.activo)
    notif.exito(`Mesa ${!mesa.activo ? 'activada' : 'desactivada'}`)
    await cargar()
  } catch {
    notif.error('Error al actualizar mesa')
  }
}

// ── Eliminar ──────────────────────────────────────────────────────────────────
async function eliminar(id: string) {
  try {
    await mesasService.eliminarMesa(id)
    notif.exito('Mesa eliminada')
    await cargar()
  } catch {
    notif.error('Error al eliminar mesa')
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto flex flex-col gap-8">
    <h1 class="text-2xl font-bold text-text-primary flex items-center gap-2">
      <IconArmchair class="w-6 h-6" /> Mesas
    </h1>

    <!-- Formulario nueva mesa -->
    <section class="card p-6">
      <h2 class="font-semibold text-text-primary mb-4 text-lg">Nueva mesa</h2>
      <div class="flex gap-3">
        <AppInput
          v-model="nombre"
          id="mesa-nombre"
          label="Nombre"
          placeholder="Ej: Mesa 1"
          class="flex-1"
          @keyup.enter="crear"
        />
        <div class="flex items-end">
          <AppButton :cargando="guardando" @click="crear">
            <IconPlus class="w-4 h-4" /> Crear
          </AppButton>
        </div>
      </div>
    </section>

    <!-- Lista de mesas -->
    <section class="card overflow-hidden">
      <div class="px-6 py-4 border-b border-border">
        <h2 class="font-semibold text-text-primary text-lg">Mesas existentes</h2>
      </div>

      <div v-if="cargando" class="p-6 flex flex-col gap-3">
        <div v-for="n in 3" :key="n" class="h-14 bg-surface-muted rounded animate-pulse" />
      </div>

      <div v-else-if="mesas.length === 0" class="p-8 text-center text-text-muted text-sm">
        No hay mesas configuradas aún.
      </div>

      <div v-else class="divide-y divide-border">
        <div
          v-for="mesa in mesas"
          :key="mesa.id"
          class="flex items-center justify-between px-6 py-4"
        >
          <div class="flex items-center gap-3">
            <span class="font-medium text-text-primary">{{ mesa.nombre }}</span>
            <AppBadge :variante="mesa.activo ? 'success' : 'default'">
              {{ mesa.activo ? 'Activa' : 'Inactiva' }}
            </AppBadge>
          </div>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="p-1.5 text-text-muted hover:text-brand-blue transition-colors"
              :title="mesa.activo ? 'Desactivar' : 'Activar'"
              @click="toggleActivo(mesa)"
            >
              <component :is="mesa.activo ? IconToggleRight : IconToggleLeft" class="w-5 h-5" />
            </button>
            <button
              type="button"
              class="p-1.5 text-text-muted hover:text-error transition-colors"
              title="Eliminar"
              @click="eliminar(mesa.id)"
            >
              <IconTrash class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
