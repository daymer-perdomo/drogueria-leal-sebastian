<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import * as productsService from '../../services/products.service'
import type { ProductoConCategoria } from '../../types/product.types'
import type { ProductoSugerencia } from '../../services/products.service'
import { IconPackage, IconArrowRight, IconLoader2, IconSearch, IconAlertCircle } from '@tabler/icons-vue'

const props = defineProps<{
  termino: string
  visible: boolean
}>()

const emit = defineEmits<{
  cerrar: []
}>()

const router = useRouter()

const resultados = ref<ProductoConCategoria[]>([])
const sugerencias = ref<ProductoSugerencia[]>([])
const totalEncontrados = ref(0)
const cargando = ref(false)

const sinResultados = computed(
  () => !cargando.value && resultados.value.length === 0 && props.termino.trim().length >= 2,
)

function formatearPrecio(precio: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(precio)
}

let timer: ReturnType<typeof setTimeout>

watch(
  () => [props.termino, props.visible] as const,
  ([termino, visible]) => {
    clearTimeout(timer)

    if (!visible || termino.trim().length < 2) {
      resultados.value = []
      sugerencias.value = []
      totalEncontrados.value = 0
      cargando.value = false
      return
    }

    cargando.value = true
    timer = setTimeout(async () => {
      try {
        const t = termino.trim()
        const [lista, total] = await Promise.all([
          productsService.buscarProductosRapido(t, 6),
          productsService.contarProductos({ busqueda: t, soloActivos: true }),
        ])
        resultados.value = lista
        totalEncontrados.value = total

        if (lista.length === 0) {
          sugerencias.value = await productsService.buscarSugerencias(t, 5)
        } else {
          sugerencias.value = []
        }
      } catch {
        resultados.value = []
        sugerencias.value = []
      } finally {
        cargando.value = false
      }
    }, 280)
  },
)

function irAProducto(id: string) {
  router.push({ name: 'producto-detalle', params: { id } })
  emit('cerrar')
}

function verTodos() {
  router.push({ name: 'catalogo', query: { busqueda: props.termino.trim() } })
  emit('cerrar')
}

function buscarSugerencia(nombre: string) {
  router.push({ name: 'catalogo', query: { busqueda: nombre } })
  emit('cerrar')
}
</script>

<template>
  <Transition name="dropdown">
    <div v-if="visible && termino.trim().length >= 2" class="dropdown-panel" role="listbox">

      <!-- Cargando -->
      <div v-if="cargando" class="estado-centro">
        <IconLoader2 class="w-5 h-5 animate-spin text-brand-blue opacity-60" />
        <span class="text-sm text-text-muted">Buscando productos…</span>
      </div>

      <template v-else>

        <!-- Resultados encontrados -->
        <template v-if="resultados.length > 0">
          <ul>
            <li
              v-for="p in resultados"
              :key="p.id"
              class="result-row"
              @mousedown.prevent="irAProducto(p.id)"
            >
              <div class="result-thumb">
                <img v-if="p.imagenes?.[0]" :src="p.imagenes[0]" :alt="p.nombre" class="w-full h-full object-cover" />
                <IconPackage v-else class="w-5 h-5 text-text-muted opacity-40" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-text-primary truncate leading-tight">{{ p.nombre }}</p>
                <p v-if="p.codigo" class="text-xs text-text-muted font-mono mt-0.5">{{ p.codigo }}</p>
              </div>
              <div class="text-right shrink-0">
                <span class="text-sm font-bold text-brand-blue">{{ formatearPrecio(p.precio) }}</span>
                <p v-if="p.stock === 0" class="text-xs text-error">Agotado</p>
              </div>
            </li>
          </ul>

          <button class="ver-todos-btn" @mousedown.prevent="verTodos">
            <span>Ver todos los resultados</span>
            <span class="count-pill">{{ totalEncontrados }}</span>
            <IconArrowRight class="w-4 h-4 ml-auto" />
          </button>
        </template>

        <!-- Sin resultados -->
        <template v-else-if="sinResultados">
          <div class="px-4 pt-4 pb-2">
            <div class="flex items-center gap-2 mb-3">
              <IconAlertCircle class="w-4 h-4 text-text-muted shrink-0" />
              <p class="text-sm text-text-secondary">
                Sin resultados para <strong class="text-text-primary">"{{ termino }}"</strong>
              </p>
            </div>

            <template v-if="sugerencias.length > 0">
              <p class="text-xs font-bold text-text-muted uppercase tracking-widest mb-2">
                ¿Quisiste decir?
              </p>
              <ul class="flex flex-col gap-0.5 mb-2">
                <li
                  v-for="s in sugerencias"
                  :key="s.id"
                  class="sugerencia-row"
                  @mousedown.prevent="buscarSugerencia(s.nombre)"
                >
                  <IconSearch class="w-3.5 h-3.5 text-brand-turquoise shrink-0" />
                  <span class="text-sm text-text-primary flex-1 truncate">{{ s.nombre }}</span>
                  <span v-if="s.codigo" class="text-xs text-text-muted font-mono ml-2">{{ s.codigo }}</span>
                  <span class="text-xs font-semibold text-brand-blue ml-2">{{ formatearPrecio(s.precio) }}</span>
                </li>
              </ul>
            </template>

            <p v-else class="text-xs text-text-muted pb-2">
              Intenta con otro término o revisa la ortografía.
            </p>
          </div>
        </template>

      </template>
    </div>
  </Transition>
</template>

<style scoped>
.dropdown-panel {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: #ffffff;
  border: 1.5px solid #dbe8f8;
  border-radius: 1rem;
  box-shadow:
    0 4px 6px -1px rgba(15, 79, 168, 0.06),
    0 12px 32px -4px rgba(15, 79, 168, 0.14);
  overflow: hidden;
  z-index: 200;
  max-height: 440px;
  overflow-y: auto;
}

.estado-centro {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1.5rem 1rem;
}

/* --- Resultado individual --- */
.result-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 1rem;
  cursor: pointer;
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.12s;
}
.result-row:last-of-type {
  border-bottom: none;
}
.result-row:hover {
  background: #f0f5ff;
}

.result-thumb {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.625rem;
  background: #f1f5f9;
  flex-shrink: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* --- Botón "Ver todos" --- */
.ver-todos-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: #f0f5ff;
  border-top: 1.5px solid #dbe8f8;
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--color-brand-blue);
  cursor: pointer;
  letter-spacing: 0.01em;
  transition: background 0.12s;
  text-align: left;
}
.ver-todos-btn:hover {
  background: #dbeafe;
}

.count-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.35rem;
  height: 1.35rem;
  padding: 0 0.4rem;
  background: var(--color-brand-blue);
  color: #fff;
  border-radius: 9999px;
  font-size: 0.7rem;
  font-weight: 800;
}

/* --- Sugerencia --- */
.sugerencia-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background 0.12s;
}
.sugerencia-row:hover {
  background: #f0f5ff;
}

/* --- Transición del panel --- */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.99);
}
</style>
