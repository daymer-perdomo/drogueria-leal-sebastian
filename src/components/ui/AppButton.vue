<script setup lang="ts">
import { IconLoader2 } from '@tabler/icons-vue'

type Variante = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type Tamano = 'sm' | 'md' | 'lg'

const props = withDefaults(
  defineProps<{
    variante?: Variante
    tamano?: Tamano
    disabled?: boolean
    cargando?: boolean
    tipo?: 'button' | 'submit' | 'reset'
    bloque?: boolean
  }>(),
  {
    variante: 'primary',
    tamano: 'md',
    disabled: false,
    cargando: false,
    tipo: 'button',
    bloque: false,
  },
)

const clasesPorVariante: Record<Variante, string> = {
  primary:
    'bg-primary text-text-inverse hover:bg-primary-700 focus-visible:ring-primary-500',
  secondary:
    'bg-accent text-text-inverse hover:bg-accent-700 focus-visible:ring-accent-500',
  outline:
    'border border-primary text-primary bg-transparent hover:bg-primary-50 focus-visible:ring-primary-500',
  ghost:
    'text-text-secondary bg-transparent hover:bg-surface-muted focus-visible:ring-border-strong',
  danger:
    'bg-error text-text-inverse hover:opacity-90 focus-visible:ring-red-400',
}

const clasesPorTamano: Record<Tamano, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-md',
  md: 'px-4 py-2 text-base rounded-md',
  lg: 'px-6 py-3 text-lg rounded-lg',
}
</script>

<template>
  <button
    :type="tipo"
    :disabled="disabled || cargando"
    :class="[
      'inline-flex items-center justify-center gap-2 font-medium transition-colors duration-base',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      clasesPorVariante[variante],
      clasesPorTamano[tamano],
      bloque ? 'w-full' : '',
    ]"
  >
    <IconLoader2 v-if="cargando" class="animate-spin -ml-1 h-4 w-4" />
    <slot />
  </button>
</template>
