<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { IconX } from '@tabler/icons-vue'

const props = defineProps<{
  abierto: boolean
  titulo?: string
  tamano?: 'sm' | 'md' | 'lg'
}>()

const emit = defineEmits<{ cerrar: [] }>()

const anchosPorTamano = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
}

function manejarEscape(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.abierto) emit('cerrar')
}

onMounted(() => document.addEventListener('keydown', manejarEscape))
onUnmounted(() => document.removeEventListener('keydown', manejarEscape))
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="abierto"
        class="fixed inset-0 flex items-center justify-center p-4"
        style="z-index: var(--z-modal-backdrop)"
      >
        <div
          class="absolute inset-0 bg-surface-overlay"
          @click="emit('cerrar')"
        />
        <div
          :class="[
            'relative bg-surface rounded-xl shadow-xl w-full',
            anchosPorTamano[tamano ?? 'md'],
          ]"
          style="z-index: var(--z-modal)"
          role="dialog"
          aria-modal="true"
        >
          <div v-if="titulo" class="flex items-center justify-between p-6 border-b border-border">
            <h2 class="text-xl font-semibold text-text-primary">{{ titulo }}</h2>
            <button
              class="text-text-muted hover:text-text-primary transition-colors duration-base p-1 rounded-md"
              @click="emit('cerrar')"
            >
              <IconX class="h-5 w-5" />
            </button>
          </div>
          <div class="p-6">
            <slot />
          </div>
          <div v-if="$slots.footer" class="px-6 pb-6">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--transition-slow);
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
