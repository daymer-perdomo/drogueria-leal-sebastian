<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import type { Banner } from '../../services/banners.service'

const props = defineProps<{ banners: Banner[] }>()

const actual = ref(0)
const transitando = ref(false)
const cargando = ref(true)
let intervalo: ReturnType<typeof setInterval> | null = null

const bannerActual = computed(() => props.banners[actual.value])

function cargarImagen() {
  cargando.value = true
}

function imagenCargada() {
  cargando.value = false
}

function ir(i: number) {
  if (i === actual.value || transitando.value) return
  transitando.value = true
  setTimeout(() => {
    actual.value = i
    transitando.value = false
  }, 300)
}

function siguiente() {
  ir((actual.value + 1) % props.banners.length)
}

function iniciarAutoplay() {
  if (props.banners.length > 1) {
    intervalo = setInterval(siguiente, 5000)
  }
}

function pausar() {
  if (intervalo) { clearInterval(intervalo); intervalo = null }
}

onMounted(iniciarAutoplay)
onUnmounted(pausar)
</script>

<template>
  <section
    v-if="banners.length > 0"
    class="w-full relative rounded-xl overflow-hidden bg-surface-muted"
    @mouseenter="pausar"
    @mouseleave="iniciarAutoplay"
  >
    <div class="relative w-full" style="aspect-ratio: 1774 / 887;">
      <div
        class="absolute inset-0 bg-surface-muted animate-pulse"
        :class="{ 'opacity-0': !cargando }"
        style="transition: opacity 0.3s ease;"
      />
      <Transition name="banner">
        <a
          v-if="bannerActual"
          :key="actual"
          class="absolute inset-0 block"
          :href="bannerActual.enlace ?? undefined"
          :target="bannerActual.enlace ? '_blank' : undefined"
          :rel="bannerActual.enlace ? 'noopener noreferrer' : undefined"
          :style="{ cursor: bannerActual.enlace ? 'pointer' : 'default' }"
        >
          <img
            :src="bannerActual.imagen_url"
            :alt="bannerActual.titulo ?? 'Banner'"
            class="w-full h-full object-contain"
            @load="imagenCargada"
            @change="cargarImagen"
          />

          <!-- Overlay de texto -->
          <div
            v-if="bannerActual.titulo || bannerActual.subtitulo"
            class="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex flex-col justify-center px-8 md:px-16"
          >
            <h2
              v-if="bannerActual.titulo"
              class="text-white font-bold text-xl md:text-3xl lg:text-4xl drop-shadow max-w-lg"
            >
              {{ bannerActual.titulo }}
            </h2>
            <p
              v-if="bannerActual.subtitulo"
              class="text-white/90 mt-2 text-sm md:text-base max-w-md drop-shadow"
            >
              {{ bannerActual.subtitulo }}
            </p>
          </div>
        </a>
      </Transition>
    </div>

    <!-- Indicadores -->
    <div
      v-if="banners.length > 1"
      class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2"
    >
      <button
        v-for="(_, i) in banners"
        :key="i"
        class="h-2 rounded-full transition-all duration-300"
        :class="i === actual ? 'bg-white w-5' : 'bg-white/50 w-2'"
        @click="ir(i)"
      />
    </div>

    <!-- Flechas -->
    <template v-if="banners.length > 1">
      <button
        class="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 text-white flex items-center justify-center hover:bg-black/50 transition-colors text-lg leading-none"
        @click="ir((actual - 1 + banners.length) % banners.length)"
      >‹</button>
      <button
        class="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 text-white flex items-center justify-center hover:bg-black/50 transition-colors text-lg leading-none"
        @click="siguiente"
      >›</button>
    </template>
  </section>
</template>

<style scoped>
.banner-enter-active,
.banner-leave-active {
  transition: opacity 0.3s ease;
}
.banner-enter-from,
.banner-leave-to {
  opacity: 0;
}
</style>
