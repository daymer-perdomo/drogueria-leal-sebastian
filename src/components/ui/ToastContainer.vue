<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useUiStore } from '../../stores/ui.store'
import { IconCheck, IconX, IconAlertTriangle, IconInfoCircle } from '@tabler/icons-vue'

const uiStore = useUiStore()
const { notificaciones } = storeToRefs(uiStore)

const iconosPorTipo = {
  exito: IconCheck,
  error: IconX,
  advertencia: IconAlertTriangle,
  info: IconInfoCircle,
}

const clasesPorTipo = {
  exito: 'bg-[var(--color-success-bg)] text-success border-success',
  error: 'bg-[var(--color-error-bg)] text-error border-error',
  advertencia: 'bg-[var(--color-warning-bg)] text-warning border-warning',
  info: 'bg-[var(--color-info-bg)] text-info border-info',
}
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed top-4 right-4 flex flex-col gap-2 w-80 max-w-full"
      style="z-index: var(--z-toast)"
    >
      <TransitionGroup name="toast" tag="div" class="flex flex-col gap-2">
        <div
          v-for="n in notificaciones"
          :key="n.id"
          :class="[
            'flex items-start gap-3 p-4 rounded-lg border shadow-md text-sm font-medium',
            clasesPorTipo[n.tipo],
          ]"
        >
          <component :is="iconosPorTipo[n.tipo]" class="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span class="flex-1">{{ n.mensaje }}</span>
          <button
            class="ml-auto leading-none opacity-60 hover:opacity-100"
            @click="uiStore.cerrarNotificacion(n.id)"
          >
            <IconX class="w-4 h-4" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all var(--transition-slow);
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
