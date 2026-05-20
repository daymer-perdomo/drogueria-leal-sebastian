<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuth } from '../../composables/useAuth'
import { useNotification } from '../../composables/useNotification'
import * as quejasService from '../../services/quejas.service'
import type { Queja } from '../../types/queja.types'
import AppButton from '../../components/ui/AppButton.vue'
import AppCard from '../../components/ui/AppCard.vue'
import AppBadge from '../../components/ui/AppBadge.vue'
import { IconMessageReport, IconSend, IconInbox } from '@tabler/icons-vue'

const { estaAutenticado, user } = useAuth()
const notif = useNotification()

const enviando = ref(false)
const enviado = ref(false)
const misQuejas = ref<Queja[]>([])
const cargandoQuejas = ref(false)

const form = ref({
  nombre: '',
  email: '',
  asunto: '',
  mensaje: '',
})

onMounted(async () => {
  if (user.value?.perfil?.nombre) form.value.nombre = user.value.perfil.nombre
  if (user.value?.email) form.value.email = user.value.email

  if (estaAutenticado.value) {
    cargandoQuejas.value = true
    try {
      misQuejas.value = await quejasService.listarMisQuejas()
    } finally {
      cargandoQuejas.value = false
    }
  }
})

const formularioValido = computed(() =>
  form.value.nombre.trim().length >= 2 &&
  form.value.email.includes('@') &&
  form.value.asunto.trim().length >= 3 &&
  form.value.mensaje.trim().length >= 10,
)

async function onEnviar() {
  if (!formularioValido.value) return
  enviando.value = true
  try {
    await quejasService.enviarQueja(form.value)
    enviado.value = true
    form.value.asunto = ''
    form.value.mensaje = ''
    if (estaAutenticado.value) {
      misQuejas.value = await quejasService.listarMisQuejas()
    }
    notif.exito('Tu queja fue enviada exitosamente')
  } catch (err) {
    notif.error(err instanceof Error ? err.message : 'Error al enviar la queja')
  } finally {
    enviando.value = false
  }
}

const etiquetaEstado: Record<string, string> = {
  nueva: 'Nueva',
  en_proceso: 'En proceso',
  resuelta: 'Resuelta',
}

const variantePorEstado: Record<string, 'warning' | 'info' | 'success'> = {
  nueva: 'warning',
  en_proceso: 'info',
  resuelta: 'success',
}

function formatearFecha(fecha: string) {
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'long' }).format(new Date(fecha))
}
</script>

<template>
  <main class="container-app py-8">
    <div class="max-w-2xl mx-auto">
      <div class="flex items-center gap-3 mb-8">
        <IconMessageReport class="w-8 h-8 text-primary flex-shrink-0" />
        <div>
          <h1 class="text-2xl font-bold text-text-primary">Quejas y Solicitudes</h1>
          <p class="text-sm text-text-secondary mt-0.5">
            Cuéntanos cómo podemos mejorar. Respondemos en menos de 24 horas.
          </p>
        </div>
      </div>

      <!-- Formulario -->
      <AppCard class="mb-8">
        <Transition name="fade">
          <div
            v-if="enviado"
            class="bg-[var(--color-success-bg)] border border-success text-success rounded-lg p-4 mb-5 text-sm font-medium text-center"
          >
            ¡Queja enviada! Nos pondremos en contacto contigo pronto.
          </div>
        </Transition>

        <form class="flex flex-col gap-4" @submit.prevent="onEnviar">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="flex flex-col gap-1">
              <label class="text-sm font-medium text-text-primary">
                Nombre <span class="text-error">*</span>
              </label>
              <input
                v-model="form.nombre"
                type="text"
                placeholder="Tu nombre completo"
                class="input-base"
                required
              />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-sm font-medium text-text-primary">
                Correo electrónico <span class="text-error">*</span>
              </label>
              <input
                v-model="form.email"
                type="email"
                placeholder="tu@correo.com"
                class="input-base"
                required
              />
            </div>
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-text-primary">
              Asunto <span class="text-error">*</span>
            </label>
            <input
              v-model="form.asunto"
              type="text"
              placeholder="Describe brevemente tu solicitud"
              class="input-base"
              required
            />
          </div>

          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-text-primary">
              Mensaje <span class="text-error">*</span>
            </label>
            <textarea
              v-model="form.mensaje"
              rows="5"
              placeholder="Describe detalladamente tu queja o solicitud..."
              class="input-base resize-none"
              required
            />
          </div>

          <AppButton
            tipo="submit"
            bloque
            :cargando="enviando"
            :disabled="!formularioValido"
          >
            <IconSend class="w-4 h-4" />
            Enviar queja
          </AppButton>
        </form>
      </AppCard>

      <!-- Mis quejas anteriores (solo autenticados) -->
      <div v-if="estaAutenticado">
        <h2 class="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          <IconInbox class="w-5 h-5 text-text-muted" />
          Mis quejas enviadas
        </h2>

        <div v-if="cargandoQuejas" class="flex flex-col gap-3">
          <div v-for="n in 2" :key="n" class="card p-4 animate-pulse flex flex-col gap-2">
            <div class="h-4 bg-surface-muted rounded w-1/2" />
            <div class="h-3 bg-surface-muted rounded w-full" />
          </div>
        </div>

        <div v-else-if="misQuejas.length === 0" class="text-center py-10 text-text-muted">
          <IconMessageReport class="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p class="text-sm">Aún no has enviado ninguna queja</p>
        </div>

        <div v-else class="flex flex-col gap-3">
          <div
            v-for="queja in misQuejas"
            :key="queja.id"
            class="card p-4"
          >
            <div class="flex items-start justify-between gap-3 mb-2">
              <p class="font-medium text-text-primary text-sm">{{ queja.asunto }}</p>
              <AppBadge :variante="variantePorEstado[queja.estado]" class="flex-shrink-0">
                {{ etiquetaEstado[queja.estado] }}
              </AppBadge>
            </div>
            <p class="text-sm text-text-secondary mb-2 line-clamp-2">{{ queja.mensaje }}</p>
            <p class="text-xs text-text-muted">{{ formatearFecha(queja.created_at) }}</p>
            <div
              v-if="queja.respuesta"
              class="mt-3 bg-[var(--color-info-bg)] border border-info rounded-md p-3 text-sm text-info"
            >
              <p class="font-semibold mb-1">Respuesta del equipo:</p>
              <p>{{ queja.respuesta }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-slow);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
