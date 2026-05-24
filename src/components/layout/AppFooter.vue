<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { IconMapPin, IconClock, IconBrandWhatsapp } from '@tabler/icons-vue'
import { getConfigs } from '../../services/configuracion.service'

const whatsappNum          = ref(import.meta.env.VITE_WHATSAPP_NUMBER as string)
const tiendaDireccion      = ref('')
const tiendaHorarioSemana  = ref('')
const tiendaHorarioDomingo = ref('')

onMounted(async () => {
  const cfg = await getConfigs([
    'whatsapp_numero',
    'tienda_direccion',
    'tienda_horario_semana',
    'tienda_horario_domingo',
  ]).catch(() => ({} as Record<string, string>))

  if (cfg['whatsapp_numero'])       whatsappNum.value          = cfg['whatsapp_numero']
  if (cfg['tienda_direccion'])      tiendaDireccion.value      = cfg['tienda_direccion']
  if (cfg['tienda_horario_semana']) tiendaHorarioSemana.value  = cfg['tienda_horario_semana']
  if (cfg['tienda_horario_domingo'])tiendaHorarioDomingo.value = cfg['tienda_horario_domingo']
})
</script>

<template>
  <footer class="bg-brand-blue text-white mt-auto">
    <div class="container-app py-12 grid grid-cols-1 md:grid-cols-3 gap-8">

      <!-- Marca -->
      <div>
        <h3 class="font-bold text-lg mb-3">Droguería Leal</h3>
        <p class="text-sm leading-relaxed" style="color: var(--color-brand-turquoise)">
          Tu farmacia de confianza. Medicamentos, cuidado personal y más con atención especializada.
        </p>
      </div>

      <!-- Navegación -->
      <div>
        <h4 class="font-semibold mb-3">Navegación</h4>
        <ul class="flex flex-col gap-2 text-sm text-gray-300">
          <li>
            <RouterLink :to="{ name: 'catalogo' }" class="hover:text-brand-green transition-colors duration-base">
              Catálogo
            </RouterLink>
          </li>
          <li>
            <RouterLink :to="{ name: 'noticias' }" class="hover:text-brand-green transition-colors duration-base">
              Noticias
            </RouterLink>
          </li>
          <li>
            <RouterLink :to="{ name: 'login' }" class="hover:text-brand-green transition-colors duration-base">
              Mi cuenta
            </RouterLink>
          </li>
        </ul>
      </div>

      <!-- Contacto -->
      <div>
        <h4 class="font-semibold mb-4">Contacto</h4>
        <ul class="flex flex-col gap-3">

          <li v-if="tiendaDireccion" class="contact-row">
            <IconMapPin class="contact-icon" />
            <span class="text-sm text-gray-300">{{ tiendaDireccion }}</span>
          </li>
          <li v-else class="contact-row">
            <IconMapPin class="contact-icon" />
            <span class="text-sm text-gray-500 italic">Sin dirección configurada</span>
          </li>

          <li v-if="tiendaHorarioSemana || tiendaHorarioDomingo" class="contact-row items-start">
            <IconClock class="contact-icon mt-0.5" />
            <div class="flex flex-col gap-0.5">
              <span v-if="tiendaHorarioSemana" class="text-sm text-gray-300">{{ tiendaHorarioSemana }}</span>
              <span v-if="tiendaHorarioDomingo" class="text-sm text-gray-400">{{ tiendaHorarioDomingo }}</span>
            </div>
          </li>

          <li class="contact-row">
            <IconBrandWhatsapp class="contact-icon" />
            <a
              :href="`https://wa.me/${whatsappNum}`"
              target="_blank"
              rel="noopener noreferrer"
              class="text-sm text-gray-300 hover:text-brand-green transition-colors duration-base"
            >
              +{{ whatsappNum }}
            </a>
          </li>

        </ul>
      </div>

    </div>

    <div class="border-t py-4 text-center text-xs text-gray-400" style="border-color: rgba(255,255,255,0.1)">
      © {{ new Date().getFullYear() }} Droguería Leal. Todos los derechos reservados.
    </div>
  </footer>
</template>

<style scoped>
.contact-row {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.contact-icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
  opacity: 0.6;
}
</style>
