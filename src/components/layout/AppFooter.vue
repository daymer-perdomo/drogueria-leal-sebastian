<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <footer class="bg-primary-900 text-primary-100 mt-auto">
    <div class="container-app py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
      <div>
        <h3 class="font-bold text-lg text-text-inverse mb-3">Droguería Leal Sebastián</h3>
        <p class="text-sm text-primary-300 leading-relaxed">
          Tu farmacia de confianza. Medicamentos, cuidado personal y más con atención especializada.
        </p>
      </div>
      <div>
        <h4 class="font-semibold text-text-inverse mb-3">Navegación</h4>
        <ul class="flex flex-col gap-2 text-sm text-primary-300">
          <li><RouterLink :to="{ name: 'catalogo' }" class="hover:text-text-inverse transition-colors duration-base">Catálogo</RouterLink></li>
          <li><RouterLink :to="{ name: 'noticias' }" class="hover:text-text-inverse transition-colors duration-base">Noticias</RouterLink></li>
          <li><RouterLink :to="{ name: 'login' }" class="hover:text-text-inverse transition-colors duration-base">Mi cuenta</RouterLink></li>
        </ul>
      </div>
      <div>
        <h4 class="font-semibold text-text-inverse mb-3">Contacto</h4>
        <ul class="flex flex-col gap-2 text-sm text-primary-300">
          <li>📍 Dirección de la droguería</li>
          <li>📞 Teléfono de contacto</li>
          <li>✉️ correo@drogueria.com</li>
        </ul>
      </div>
    </div>
    <div class="border-t border-primary-800 py-4 text-center text-xs text-primary-400">
      © {{ new Date().getFullYear() }} Droguería Leal Sebastián. Todos los derechos reservados.
    </div>
  </footer>
</template>
