<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  IconSettings, IconBrandWhatsapp, IconMapPin,
  IconClockHour4, IconExternalLink,
} from '@tabler/icons-vue'
import AppButton from '../../components/ui/AppButton.vue'
import AppInput from '../../components/ui/AppInput.vue'
import { useNotification } from '../../composables/useNotification'
import { getConfigs, setConfigs } from '../../services/configuracion.service'

const notif    = useNotification()
const cargando = ref(true)

// ── WhatsApp ─────────────────────────────────────────────────────────────────
const whatsappNumero    = ref('')
const guardandoWhatsapp = ref(false)

async function guardarWhatsapp() {
  const n = whatsappNumero.value.trim()
  if (!n) { notif.advertencia('El número no puede estar vacío'); return }
  if (!/^\d{7,15}$/.test(n)) {
    notif.advertencia('Usa formato internacional sin + ni espacios (ej: 573154178719)')
    return
  }
  guardandoWhatsapp.value = true
  try {
    await setConfigs({ whatsapp_numero: n })
    notif.exito('WhatsApp actualizado')
  } catch { notif.error('Error al guardar') }
  finally { guardandoWhatsapp.value = false }
}

// ── Información de la tienda ─────────────────────────────────────────────────
const tiendaDireccion      = ref('')
const tiendaHorarioSemana  = ref('')
const tiendaHorarioDomingo = ref('')
const guardandoTienda      = ref(false)

async function guardarTienda() {
  guardandoTienda.value = true
  try {
    await setConfigs({
      tienda_direccion:       tiendaDireccion.value.trim(),
      tienda_horario_semana:  tiendaHorarioSemana.value.trim(),
      tienda_horario_domingo: tiendaHorarioDomingo.value.trim(),
    })
    notif.exito('Información de tienda actualizada')
  } catch { notif.error('Error al guardar') }
  finally { guardandoTienda.value = false }
}

// ── Mapa ─────────────────────────────────────────────────────────────────────
const mapaLat    = ref('')
const mapaLon    = ref('')
const guardandoMapa = ref(false)

const mapaPreviewSrc = computed(() => {
  const lat = parseFloat(mapaLat.value)
  const lon = parseFloat(mapaLon.value)
  if (isNaN(lat) || isNaN(lon)) return ''
  return osmUrl(lat, lon)
})

function osmUrl(lat: number, lon: number, delta = 0.01): string {
  const w = (lon - delta).toFixed(4), e = (lon + delta).toFixed(4)
  const s = (lat - delta).toFixed(4), n = (lat + delta).toFixed(4)
  return `https://www.openstreetmap.org/export/embed.html?bbox=${w}%2C${s}%2C${e}%2C${n}&layer=mapnik&marker=${lat.toFixed(4)}%2C${lon.toFixed(4)}`
}

async function guardarMapa() {
  const lat = parseFloat(mapaLat.value)
  const lon = parseFloat(mapaLon.value)
  if (isNaN(lat) || isNaN(lon)) {
    notif.advertencia('Ingresa coordenadas válidas')
    return
  }
  guardandoMapa.value = true
  try {
    await setConfigs({ mapa_lat: String(lat), mapa_lon: String(lon) })
    notif.exito('Ubicación del mapa actualizada')
  } catch { notif.error('Error al guardar') }
  finally { guardandoMapa.value = false }
}

// ── Carga inicial ─────────────────────────────────────────────────────────────
onMounted(async () => {
  try {
    const cfg = await getConfigs([
      'whatsapp_numero',
      'tienda_direccion', 'tienda_horario_semana', 'tienda_horario_domingo',
      'mapa_lat', 'mapa_lon',
    ])
    whatsappNumero.value    = cfg['whatsapp_numero']    ?? ''
    tiendaDireccion.value   = cfg['tienda_direccion']   ?? ''
    tiendaHorarioSemana.value  = cfg['tienda_horario_semana']  ?? 'Lun – Sáb  7:00 a.m. – 10:00 p.m.'
    tiendaHorarioDomingo.value = cfg['tienda_horario_domingo'] ?? 'Dom  8:00 a.m. – 8:00 p.m.'
    mapaLat.value = cfg['mapa_lat'] ?? '4.6097'
    mapaLon.value = cfg['mapa_lon'] ?? '-74.0817'
  } catch {
    notif.error('Error al cargar la configuración')
  } finally {
    cargando.value = false
  }
})
</script>

<template>
  <div class="max-w-2xl mx-auto flex flex-col gap-6">
    <h1 class="text-2xl font-bold text-text-primary flex items-center gap-2">
      <IconSettings class="w-6 h-6" /> Configuración
    </h1>

    <div v-if="cargando" class="flex flex-col gap-4">
      <div v-for="n in 3" :key="n" class="card p-6 animate-pulse h-40" />
    </div>

    <template v-else>

      <!-- ── WhatsApp ── -->
      <section class="card p-6">
        <h2 class="section-head">
          <IconBrandWhatsapp class="w-5 h-5" style="color: var(--color-success)" />
          Número de WhatsApp
        </h2>
        <p class="text-sm text-text-muted mb-5">
          Número al que se enviarán los pedidos. Formato internacional sin
          <code class="bg-surface-muted px-1 rounded">+</code> ni espacios.
        </p>
        <div class="flex flex-col gap-4">
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
              target="_blank" rel="noopener noreferrer"
              class="underline font-mono" style="color: var(--color-success)"
            >wa.me/{{ whatsappNumero || '…' }}</a>
          </p>
          <AppButton :cargando="guardandoWhatsapp" @click="guardarWhatsapp">
            Guardar WhatsApp
          </AppButton>
        </div>
      </section>

      <!-- ── Información de la tienda ── -->
      <section class="card p-6">
        <h2 class="section-head">
          <IconClockHour4 class="w-5 h-5" style="color: var(--color-brand-blue)" />
          Información de la tienda
        </h2>
        <p class="text-sm text-text-muted mb-5">
          Estos datos se muestran en la sección de ubicación del inicio.
        </p>
        <div class="flex flex-col gap-4">
          <AppInput
            v-model="tiendaDireccion"
            id="cfg-direccion"
            label="Dirección"
            placeholder="Calle 45 # 12-34, Bogotá, Colombia"
          />
          <AppInput
            v-model="tiendaHorarioSemana"
            id="cfg-horario-semana"
            label="Horario Lunes – Sábado"
            placeholder="Lun – Sáb  7:00 a.m. – 10:00 p.m."
          />
          <AppInput
            v-model="tiendaHorarioDomingo"
            id="cfg-horario-dom"
            label="Horario Domingo"
            placeholder="Dom  8:00 a.m. – 8:00 p.m."
          />
          <AppButton :cargando="guardandoTienda" @click="guardarTienda">
            Guardar información
          </AppButton>
        </div>
      </section>

      <!-- ── Ubicación en el mapa ── -->
      <section class="card p-6">
        <h2 class="section-head">
          <IconMapPin class="w-5 h-5" style="color: var(--color-brand-green-dark)" />
          Ubicación en el mapa
        </h2>
        <p class="text-sm text-text-muted mb-2">
          Ingresa las coordenadas de la tienda para centrar el mapa en el inicio.
        </p>
        <div class="tip-box mb-5">
          <p class="text-xs" style="color: var(--color-text-secondary)">
            <strong>¿Cómo obtener coordenadas?</strong>
            Busca la dirección en
            <a
              href="https://www.openstreetmap.org"
              target="_blank" rel="noopener noreferrer"
              class="underline inline-flex items-center gap-0.5"
              style="color: var(--color-brand-blue)"
            >OpenStreetMap <IconExternalLink class="w-3 h-3" /></a>,
            haz clic derecho sobre el punto y copia las coordenadas
            (<em>latitud</em> primero, luego <em>longitud</em>).
          </p>
        </div>

        <div class="grid grid-cols-2 gap-4 mb-4">
          <AppInput
            v-model="mapaLat"
            id="cfg-lat"
            label="Latitud"
            tipo="number"
            placeholder="4.6097"
            ayuda="Número positivo = Norte"
          />
          <AppInput
            v-model="mapaLon"
            id="cfg-lon"
            label="Longitud"
            tipo="number"
            placeholder="-74.0817"
            ayuda="Número negativo = Oeste"
          />
        </div>

        <!-- Vista previa del mapa -->
        <div v-if="mapaPreviewSrc" class="map-preview mb-4">
          <p class="text-xs font-medium mb-2" style="color: var(--color-text-muted)">
            Vista previa
          </p>
          <div class="rounded-lg overflow-hidden border" style="border-color: var(--color-border); height: 220px">
            <iframe
              :src="mapaPreviewSrc"
              title="Vista previa del mapa"
              loading="lazy"
              class="w-full h-full border-0"
            />
          </div>
        </div>
        <div v-else class="rounded-lg flex items-center justify-center mb-4" style="height:220px; background: var(--color-surface-muted); border: 1px dashed var(--color-border)">
          <p class="text-sm" style="color: var(--color-text-muted)">Ingresa coordenadas válidas para previsualizar</p>
        </div>

        <AppButton :cargando="guardandoMapa" @click="guardarMapa">
          Guardar ubicación
        </AppButton>
      </section>

    </template>
  </div>
</template>

<style scoped>
.section-head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: 0.375rem;
}

.tip-box {
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  background: var(--color-surface-subtle);
  border: 1px solid var(--color-border);
}
</style>
