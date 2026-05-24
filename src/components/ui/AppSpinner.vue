<script setup lang="ts">
withDefaults(defineProps<{ size?: 'sm' | 'md' | 'lg' }>(), { size: 'md' })
</script>

<template>
  <svg
    viewBox="0 0 48 48"
    fill="none"
    class="spinner"
    :class="size"
    role="status"
    aria-label="Cargando…"
  >
    <defs>
      <linearGradient id="spinner-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%"   stop-color="#0F4FA8" />
        <stop offset="50%"  stop-color="#13A8B8" />
        <stop offset="100%" stop-color="#7CC244" />
      </linearGradient>
    </defs>
    <!-- Track -->
    <circle cx="24" cy="24" r="20" stroke="#e2e8f0" stroke-width="4" />
    <!-- Arc -->
    <circle
      cx="24" cy="24" r="20"
      stroke="url(#spinner-grad)"
      stroke-width="4"
      stroke-linecap="round"
      stroke-dasharray="90 36"
    />
  </svg>
</template>

<style scoped>
.spinner { display: block; animation: spin 0.85s linear infinite; }
.spinner.sm { width: 1.25rem; height: 1.25rem; }
.spinner.md { width: 2rem;    height: 2rem;    }
.spinner.lg { width: 3rem;    height: 3rem;    }

@keyframes spin { to { transform: rotate(360deg); } }
</style>
