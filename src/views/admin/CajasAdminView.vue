<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useNotification } from '../../composables/useNotification'
import * as cajasService from '../../services/cajas.service'
import type { Caja } from '../../types/order.types'
import AppButton from '../../components/ui/AppButton.vue'
import AppInput from '../../components/ui/AppInput.vue'
import AppBadge from '../../components/ui/AppBadge.vue'
import { IconCash, IconPlus, IconTrash, IconToggleLeft, IconToggleRight } from '@tabler/icons-vue'

const notif = useNotification()

const cajas = ref<Caja[]>([])
const cargando = ref(true)

async function cargar() {
  cargando.value = true
  try {
    cajas.value = await cajasService.listarCajas()
  } catch {
    notif.error('Error al cargar cajas')
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
    await cajasService.crearCaja(nombre.value)
    notif.exito('Caja creada')
    nombre.value = ''
    await cargar()
  } catch (err) {
    notif.error(err instanceof Error ? err.message : 'Error al crear caja')
  } finally {
    guardando.value = false
  }
}

// ── Toggle activo ─────────────────────────────────────────────────────────────
async function toggleActivo(caja: Caja) {
  try {
    await cajasService.toggleCaja(caja.id, !caja.activo)
    notif.exito(`Caja ${!caja.activo ? 'activada' : 'desactivada'}`)
    await cargar()
  } catch {
    notif.error('Error al actualizar caja')
  }
}

// ── Eliminar ──────────────────────────────────────────────────────────────────
async function eliminar(id: string) {
  try {
    await cajasService.eliminarCaja(id)
    notif.exito('Caja eliminada')
    await cargar()
  } catch {
    notif.error('Error al eliminar caja')
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto flex flex-col gap-8">
    <h1 class="text-2xl font-bold text-text-primary flex items-center gap-2">
      <IconCash class="w-6 h-6" /> Cajas
    </h1>

    <!-- Formulario nueva caja -->
    <section class="card p-6">
      <h2 class="font-semibold text-text-primary mb-4 text-lg">Nueva caja</h2>
      <div class="flex gap-3">
        <AppInput
          v-model="nombre"
          id="caja-nombre"
          label="Nombre"
          placeholder="Ej: Caja 1"
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

    <!-- Lista de cajas -->
    <section class="card overflow-hidden">
      <div class="px-6 py-4 border-b border-border">
        <h2 class="font-semibold text-text-primary text-lg">Cajas existentes</h2>
      </div>

      <div v-if="cargando" class="p-6 flex flex-col gap-3">
        <div v-for="n in 3" :key="n" class="h-14 bg-surface-muted rounded animate-pulse" />
      </div>

      <div v-else-if="cajas.length === 0" class="p-8 text-center text-text-muted text-sm">
        No hay cajas configuradas aún.
      </div>

      <div v-else class="divide-y divide-border">
        <div
          v-for="caja in cajas"
          :key="caja.id"
          class="flex items-center justify-between px-6 py-4"
        >
          <div class="flex items-center gap-3">
            <span class="font-medium text-text-primary">{{ caja.nombre }}</span>
            <AppBadge :variante="caja.activo ? 'success' : 'default'">
              {{ caja.activo ? 'Activa' : 'Inactiva' }}
            </AppBadge>
          </div>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="p-1.5 text-text-muted hover:text-brand-blue transition-colors"
              :title="caja.activo ? 'Desactivar' : 'Activar'"
              @click="toggleActivo(caja)"
            >
              <component :is="caja.activo ? IconToggleRight : IconToggleLeft" class="w-5 h-5" />
            </button>
            <button
              type="button"
              class="p-1.5 text-text-muted hover:text-error transition-colors"
              title="Eliminar"
              @click="eliminar(caja.id)"
            >
              <IconTrash class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
