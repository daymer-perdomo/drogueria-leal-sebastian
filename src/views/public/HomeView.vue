<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useProducts } from '../../composables/useProducts'
import ProductGrid from '../../components/product/ProductGrid.vue'
import AppButton from '../../components/ui/AppButton.vue'
import HomeBanner from '../../components/ui/HomeBanner.vue'
import * as bannersService from '../../services/banners.service'
import type { Banner } from '../../services/banners.service'
import { getConfigs } from '../../services/configuracion.service'
import {
  IconPill,
  IconBottle,
  IconBarbell,
  IconStethoscope,
  IconBabyCarriage,
  IconMapPin,
  IconClockHour4,
  IconBrandWhatsapp,
} from '@tabler/icons-vue'

const { productos, cargando, cargar } = useProducts({ porPagina: 8, soloActivos: true })
const banners = ref<Banner[]>([])

const whatsappNum          = ref(import.meta.env.VITE_WHATSAPP_NUMBER as string)
const tiendaDireccion      = ref('Bogotá, Colombia')
const tiendaHorarioSemana  = ref('Lun – Sáb  7:00 a.m. – 10:00 p.m.')
const tiendaHorarioDomingo = ref('Dom  8:00 a.m. – 8:00 p.m.')
const mapaLat              = ref(4.6097)
const mapaLon              = ref(-74.0817)

const mapaSrc = computed(() => {
  const lat = mapaLat.value, lon = mapaLon.value, d = 0.01
  const w = (lon - d).toFixed(4), e = (lon + d).toFixed(4)
  const s = (lat - d).toFixed(4), n = (lat + d).toFixed(4)
  return `https://www.openstreetmap.org/export/embed.html?bbox=${w}%2C${s}%2C${e}%2C${n}&layer=mapnik&marker=${lat.toFixed(4)}%2C${lon.toFixed(4)}`
})

onMounted(async () => {
  await Promise.all([
    cargar(),
    bannersService.listarBanners(true).then((b) => { banners.value = b }).catch(() => {}),
    getConfigs([
      'whatsapp_numero',
      'tienda_direccion', 'tienda_horario_semana', 'tienda_horario_domingo',
      'mapa_lat', 'mapa_lon',
    ]).then(cfg => {
      if (cfg['whatsapp_numero'])    whatsappNum.value          = cfg['whatsapp_numero']
      if (cfg['tienda_direccion'])   tiendaDireccion.value      = cfg['tienda_direccion']
      if (cfg['tienda_horario_semana'])  tiendaHorarioSemana.value  = cfg['tienda_horario_semana']
      if (cfg['tienda_horario_domingo']) tiendaHorarioDomingo.value = cfg['tienda_horario_domingo']
      if (cfg['mapa_lat'])  mapaLat.value = parseFloat(cfg['mapa_lat'])
      if (cfg['mapa_lon'])  mapaLon.value = parseFloat(cfg['mapa_lon'])
    }).catch(() => {}),
  ])
})

const categorias = [
  { slug: 'medicamentos', label: 'Medicamentos', icon: IconPill },
  { slug: 'cuidado-personal', label: 'Cuidado Personal', icon: IconBottle },
  { slug: 'suplementos', label: 'Suplementos', icon: IconBarbell },
  { slug: 'dispositivos-medicos', label: 'Dispositivos', icon: IconStethoscope },
  { slug: 'bebe-maternidad', label: 'Bebé', icon: IconBabyCarriage },
]
</script>

<template>
  <main>
    <!-- Banner publicitario -->
    <div v-if="banners.length > 0" class="container-app px-4 pt-6">
      <HomeBanner :banners="banners" />
    </div>

    <!-- Hero -->
    <section class="bg-gradient-to-br from-brand-blue/10 to-brand-turquoise/10 py-16 md:py-24">
      <div class="container-app text-center">
        <h1 class="text-3xl md:text-4xl font-bold text-brand-blue mb-4">
          Droguería Leal Sebastián
        </h1>
        <p class="text-lg text-text-secondary max-w-xl mx-auto mb-8">
          Tu salud, nuestra prioridad. Medicamentos, vitaminas, cuidado personal y dispositivos médicos con atención experta.
        </p>
        <div class="flex gap-3 justify-center flex-wrap">
          <RouterLink :to="{ name: 'catalogo' }">
            <AppButton tamano="lg">Ver catálogo</AppButton>
          </RouterLink>
          <RouterLink :to="{ name: 'noticias' }">
            <AppButton variante="outline" tamano="lg">Noticias de salud</AppButton>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- Destacados -->
    <section class="container-app py-12">
      <h2 class="text-2xl font-bold text-text-primary mb-6">Productos destacados</h2>
      <ProductGrid :productos="productos" :cargando="cargando" />
      <div class="text-center mt-8">
        <RouterLink :to="{ name: 'catalogo' }">
          <AppButton variante="outline">Ver todos los productos</AppButton>
        </RouterLink>
      </div>
    </section>

    <!-- Categorías rápidas -->
    <section class="bg-surface-subtle py-12">
      <div class="container-app">
        <h2 class="text-2xl font-bold text-text-primary mb-6">Categorías</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          <RouterLink
            v-for="cat in categorias"
            :key="cat.slug"
            :to="{ name: 'catalogo', query: { categoria: cat.slug } }"
            class="card p-4 flex flex-col items-center gap-2 text-center hover:shadow-md transition-shadow duration-base cursor-pointer"
          >
            <component :is="cat.icon" class="w-8 h-8 text-brand-blue" />
            <span class="text-sm font-medium text-text-primary">{{ cat.label }}</span>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- Ubicación -->
    <section class="py-16">
      <div class="container-app">
        <div class="card overflow-hidden loc-card">

          <!-- Franja de marca -->
          <div class="loc-strip">
            <div class="flex items-center gap-2 mb-0.5">
              <IconMapPin class="w-4 h-4 text-white opacity-90" />
              <span class="text-white font-semibold text-sm tracking-wide">Encuéntranos</span>
            </div>
            <p class="text-white/65 text-xs">Visítanos en tienda o escríbenos por WhatsApp</p>
          </div>

          <!-- Cuerpo: info + mapa -->
          <div class="flex flex-col md:flex-row">

            <!-- Panel de información -->
            <div class="loc-info">
              <h2 class="text-xl font-bold text-text-primary mb-1">Droguería Leal Sebastián</h2>
              <p class="text-sm mb-6" style="color: var(--color-text-muted)">Tu farmacia de confianza</p>

              <ul class="flex flex-col gap-4 mb-7">
                <li class="loc-row">
                  <span class="loc-icon" style="background: var(--color-primary-light)">
                    <IconMapPin class="w-4 h-4" style="color: var(--color-brand-green-dark)" />
                  </span>
                  <div>
                    <p class="loc-label">Dirección</p>
                    <p class="loc-value" style="white-space: pre-line">{{ tiendaDireccion }}</p>
                  </div>
                </li>

                <li class="loc-row">
                  <span class="loc-icon" style="background: #e0f0ff">
                    <IconClockHour4 class="w-4 h-4" style="color: var(--color-brand-blue)" />
                  </span>
                  <div>
                    <p class="loc-label">Horario</p>
                    <p class="loc-value">{{ tiendaHorarioSemana }}</p>
                    <p class="loc-value" style="color: var(--color-text-muted)">{{ tiendaHorarioDomingo }}</p>
                  </div>
                </li>

                <li class="loc-row">
                  <span class="loc-icon" style="background: var(--color-success-bg)">
                    <IconBrandWhatsapp class="w-4 h-4" style="color: var(--color-success)" />
                  </span>
                  <div>
                    <p class="loc-label">WhatsApp</p>
                    <p class="loc-value">+{{ whatsappNum }}</p>
                  </div>
                </li>
              </ul>

              <a
                :href="`https://wa.me/${whatsappNum}`"
                target="_blank"
                rel="noopener noreferrer"
                class="wa-cta"
              >
                <IconBrandWhatsapp class="w-4 h-4" />
                Abrir en WhatsApp
              </a>
            </div>

            <!-- Mapa OpenStreetMap — coordenadas configurables desde el admin -->
            <div class="loc-map">
              <iframe
                :src="mapaSrc"
                title="Ubicación Droguería Leal Sebastián"
                loading="lazy"
                class="loc-iframe"
              />
            </div>

          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.loc-card {
  box-shadow: var(--shadow-lg);
}

.loc-strip {
  padding: 1rem 1.5rem;
  background: var(--gradient-brand);
}

.loc-info {
  width: 19rem;
  flex-shrink: 0;
  padding: 2rem 1.75rem;
  border-right: 1px solid var(--color-border);
}

.loc-map {
  flex: 1;
  min-height: 22rem;
  background: var(--color-surface-muted);
}

.loc-iframe {
  width: 100%;
  height: 100%;
  min-height: 22rem;
  border: 0;
  display: block;
}

.loc-row {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.loc-icon {
  width: 2rem;
  height: 2rem;
  border-radius: var(--radius-md);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 0.1rem;
}

.loc-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-muted);
  margin-bottom: 0.2rem;
}

.loc-value {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  line-height: var(--line-height-normal);
}

.wa-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.25rem;
  background: var(--color-success);
  color: #fff;
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  text-decoration: none;
  transition: filter var(--transition-fast);
}
.wa-cta:hover { filter: brightness(1.1); }

@media (max-width: 767px) {
  .loc-info {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--color-border);
    padding: 1.5rem;
  }
  .loc-map { min-height: 16rem; }
  .loc-iframe { min-height: 16rem; }
}
</style>
