<script setup lang="ts">
withDefaults(
  defineProps<{
    relleno?: boolean
  }>(),
  { relleno: true },
)
</script>

<template>
  <div :class="['card', relleno ? 'p-6' : '']">
    <slot />
  </div>
</template>
