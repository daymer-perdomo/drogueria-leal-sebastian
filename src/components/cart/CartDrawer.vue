<script setup lang="ts">
import { ref } from 'vue'
import { useCart } from '../../composables/useCart'
import AppButton from '../ui/AppButton.vue'
import AppModal from '../ui/AppModal.vue'
import { IconX, IconShoppingCartOff, IconPill, IconBrandWhatsapp, IconAlertCircle } from '@tabler/icons-vue'
import * as cajasService from '../../services/cajas.service'
import * as mesasService from '../../services/mesas.service'
import type { Caja, Mesa } from '../../types/order.types'

const { items, total, estaVacio, abierto, cerrar, quitar, actualizarCantidad, pedirPorWhatsapp } = useCart()

function formatearPrecio(precio: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(precio)
}

// ── Modal selección caja / mesa ───────────────────────────────────────────────
const mostrarModal = ref(false)
const cajas = ref<Caja[]>([])
const mesas = ref<Mesa[]>([])
const cajaSeleccionada = ref<Caja | null>(null)
const mesaSeleccionada = ref<Mesa | null>(null)
const cargandoOpciones = ref(false)
const enviando = ref(false)

async function abrirModal() {
  mostrarModal.value = true
  if (cajas.value.length === 0 || mesas.value.length === 0) {
    cargandoOpciones.value = true
    try {
      const [c, m] = await Promise.all([cajasService.listarCajas(), mesasService.listarMesas()])
      cajas.value = c
      mesas.value = m
    } finally {
      cargandoOpciones.value = false
    }
  }
}

function cerrarModal() {
  mostrarModal.value = false
}

async function confirmarPedido() {
  if (!cajaSeleccionada.value || !mesaSeleccionada.value) return
  enviando.value = true
  try {
    await pedirPorWhatsapp(
      cajaSeleccionada.value.id,
      mesaSeleccionada.value.id,
      cajaSeleccionada.value.nombre,
      mesaSeleccionada.value.nombre,
    )
    cerrarModal()
    cajaSeleccionada.value = null
    mesaSeleccionada.value = null
  } finally {
    enviando.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div
        v-if="abierto"
        class="fixed inset-0 flex"
        style="z-index: var(--z-modal-backdrop)"
      >
        <!-- Backdrop -->
        <div class="flex-1 bg-surface-overlay" @click="cerrar()" />

        <!-- Panel -->
        <div class="w-full max-w-sm bg-surface flex flex-col shadow-xl">
          <!-- Header -->
          <div class="flex items-center justify-between p-4 border-b border-border">
            <h2 class="text-lg font-semibold text-text-primary">Carrito de compras</h2>
            <button
              class="p-1 text-text-muted hover:text-text-primary transition-colors duration-base"
              @click="cerrar()"
            >
              <IconX class="w-5 h-5" />
            </button>
          </div>

          <!-- Items -->
          <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            <div v-if="estaVacio" class="flex-1 flex flex-col items-center justify-center text-text-muted py-8">
              <IconShoppingCartOff class="w-12 h-12 mb-3 opacity-50" />
              <p class="font-medium">Tu carrito está vacío</p>
            </div>

            <div
              v-for="item in items"
              :key="item.producto_id"
              class="flex gap-3 p-3 bg-surface-subtle rounded-lg"
            >
              <img
                v-if="item.imagen"
                :src="item.imagen"
                :alt="item.nombre"
                class="w-16 h-16 object-cover rounded-md flex-shrink-0"
              />
              <div v-else class="w-16 h-16 bg-surface-muted rounded-md flex-shrink-0 flex items-center justify-center text-text-muted">
                <IconPill class="w-8 h-8" />
              </div>

              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-text-primary truncate">{{ item.nombre }}</p>
                <p class="text-sm text-brand-blue font-semibold mt-0.5">{{ formatearPrecio(item.precio) }}</p>

                <div class="flex items-center gap-2 mt-2">
                   <button
                     class="w-7 h-7 rounded-md border border-border flex items-center justify-center text-text-secondary hover:border-brand-blue hover:text-brand-blue transition-colors duration-base"
                     @click="actualizarCantidad(item.producto_id, item.cantidad - 1)"
                   >
                     −
                   </button>
                   <span class="text-sm font-medium w-6 text-center">{{ item.cantidad }}</span>
                   <button
                     class="w-7 h-7 rounded-md border border-border flex items-center justify-center text-text-secondary hover:border-brand-blue hover:text-brand-blue transition-colors duration-base"
                     :disabled="item.cantidad >= item.stock"
                     @click="actualizarCantidad(item.producto_id, item.cantidad + 1)"
                   >
                     +
                   </button>
                  <button
                    class="ml-auto text-error text-xs hover:underline"
                    @click="quitar(item.producto_id)"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div v-if="!estaVacio" class="p-4 border-t border-border flex flex-col gap-3">
            <div class="flex justify-between items-center">
              <span class="font-medium text-text-secondary">Total estimado</span>
              <span class="text-xl font-bold text-brand-blue">{{ formatearPrecio(total) }}</span>
            </div>
            <p class="text-xs text-text-muted text-center">
              El pedido se confirma vía WhatsApp
            </p>
            <AppButton bloque class="bg-brand-green hover:bg-brand-green-dark text-white border-0 focus-visible:ring-brand-green" @click="abrirModal">
              <IconBrandWhatsapp class="w-5 h-5" />
              Pedir por WhatsApp
            </AppButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Modal: selección de caja y mesa -->
  <AppModal :abierto="mostrarModal" titulo="Selecciona caja y mesa" tamano="sm" @cerrar="cerrarModal">
    <div class="flex flex-col gap-5">

      <!-- Cargando -->
      <div v-if="cargandoOpciones" class="flex flex-col gap-3">
        <div class="h-8 bg-surface-muted rounded animate-pulse" />
        <div class="grid grid-cols-3 gap-2">
          <div v-for="n in 3" :key="n" class="h-10 bg-surface-muted rounded animate-pulse" />
        </div>
      </div>

      <template v-else>
        <!-- Sin cajas configuradas -->
        <div v-if="cajas.length === 0 || mesas.length === 0" class="flex flex-col items-center gap-2 py-4 text-text-muted text-sm text-center">
          <IconAlertCircle class="w-8 h-8 opacity-50" />
          <p>No hay cajas o mesas configuradas.<br>Contacta al administrador.</p>
        </div>

        <template v-else>
          <!-- Selección de caja -->
          <div>
            <p class="text-sm font-semibold text-text-primary mb-2">Caja <span class="text-error">*</span></p>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="caja in cajas"
                :key="caja.id"
                type="button"
                :class="[
                  'py-2 px-3 rounded-lg border text-sm font-medium transition-colors duration-base',
                  cajaSeleccionada?.id === caja.id
                    ? 'border-brand-blue bg-brand-blue text-white'
                    : 'border-border text-text-primary hover:border-brand-blue hover:text-brand-blue',
                ]"
                @click="cajaSeleccionada = caja"
              >
                {{ caja.nombre }}
              </button>
            </div>
          </div>

          <!-- Selección de mesa -->
          <div>
            <p class="text-sm font-semibold text-text-primary mb-2">Mesa <span class="text-error">*</span></p>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="mesa in mesas"
                :key="mesa.id"
                type="button"
                :class="[
                  'py-2 px-3 rounded-lg border text-sm font-medium transition-colors duration-base',
                  mesaSeleccionada?.id === mesa.id
                    ? 'border-brand-blue bg-brand-blue text-white'
                    : 'border-border text-text-primary hover:border-brand-blue hover:text-brand-blue',
                ]"
                @click="mesaSeleccionada = mesa"
              >
                {{ mesa.nombre }}
              </button>
            </div>
          </div>

          <AppButton
            bloque
            :cargando="enviando"
            :disabled="!cajaSeleccionada || !mesaSeleccionada"
            class="bg-brand-green hover:bg-brand-green-dark text-white border-0 focus-visible:ring-brand-green"
            @click="confirmarPedido"
          >
            <IconBrandWhatsapp class="w-5 h-5" />
            Confirmar y pedir
          </AppButton>
        </template>
      </template>
    </div>
  </AppModal>
</template>

<style scoped>
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity var(--transition-slow);
}
.drawer-enter-active .flex-col,
.drawer-leave-active .flex-col {
  transition: transform var(--transition-slow);
}
.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}
</style>
