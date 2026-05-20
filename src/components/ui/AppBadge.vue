<script setup lang="ts">
type Variante = 'success' | 'warning' | 'error' | 'info' | 'default'

withDefaults(
  defineProps<{
    variante?: Variante
  }>(),
  { variante: 'default' },
)

const clases: Record<Variante, string> = {
  success: 'bg-[var(--color-success-bg)] text-success',
  warning: 'bg-[var(--color-warning-bg)] text-warning',
  error:   'bg-[var(--color-error-bg)] text-error',
  info:    'bg-[var(--color-info-bg)] text-info',
  default: 'bg-surface-muted text-text-secondary',
}
</script>

<template>
  <span :class="['badge', clases[variante]]">
    <slot />
  </span>
</template>
