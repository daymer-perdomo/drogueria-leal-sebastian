<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { IconSettings, IconBrandWhatsapp } from '@tabler/icons-vue'
import AppButton from '../../components/ui/AppButton.vue'
import AppInput from '../../components/ui/AppInput.vue'
import { useNotification } from '../../composables/useNotification'
import { getConfig, setConfig } from '../../services/configuracion.service'

const notif = useNotification()
const cargando = ref(true)
const guardando = ref(false)

const whatsappNumero = ref('')

onMounted(async () => {
  try {
    whatsappNumero.value = (await getConfig('whatsapp_numero')) ?? ''
  } catch {
    notif.error('Error al cargar la configuración')
  } finally {
    cargando.value = false
  }
})

async function guardar() {
  const numero = whatsappNumero.value.trim()
  if (!numero) {
    notif.advertencia('El número no puede estar vacío')
    return
  }
  if (!/^\d{7,15}$/.test(numero)) {
    notif.advertencia('Ingresa el número en formato internacional sin + ni espacios (ej: 573154178719)')
    return
  }
  guardando.value = true
  try {
    await setConfig('whatsapp_numero', numero)
    notif.exito('Configuración guardada')
  } catch {
    notif.error('Error al guardar la configuración')
  } finally {
    guardando.value = false
  }
}
</script>

<template>
  <div class="max-w-lg mx-auto flex flex-col gap-8">
    <h1 class="text-2xl font-bold text-text-primary flex items-center gap-2">
      <IconSettings class="w-6 h-6" /> Configuración
    </h1>

    <section class="card p-6">
      <h2 class="font-semibold text-text-primary mb-1 text-lg flex items-center gap-2">
        <IconBrandWhatsapp class="w-5 h-5 text-green-600" /> Número de WhatsApp
      </h2>
      <p class="text-sm text-text-muted mb-5">
        Número al que se enviarán los pedidos de los clientes. Formato internacional sin
        <code class="bg-surface-muted px-1 rounded">+</code> ni espacios.
      </p>

      <div v-if="cargando" class="h-10 bg-surface-muted rounded animate-pulse" />
      <div v-else class="flex flex-col gap-4">
        <AppInput
          v-model="whatsappNumero"
          id="cfg-whatsapp"
          label="Número (ej: 573154178719)"
          placeholder="573154178719"
        />
        <p class="text-xs text-text-muted">
          Vista previa:
          <a
            :href="`https://wa.me/${whatsappNumero}`"
            target="_blank"
            rel="noopener noreferrer"
            class="text-green-600 underline font-mono"
          >wa.me/{{ whatsappNumero || '…' }}</a>
        </p>
        <AppButton :cargando="guardando" @click="guardar">
          {{ guardando ? 'Guardando...' : 'Guardar cambios' }}
        </AppButton>
      </div>
    </section>
  </div>
</template>
