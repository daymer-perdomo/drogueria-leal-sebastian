<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useNotification } from '../../composables/useNotification'
import * as categoriasService from '../../services/categories.service'
import type { Categoria, CampoCategoria } from '../../types/category.types'
import AppButton from '../../components/ui/AppButton.vue'
import AppInput from '../../components/ui/AppInput.vue'
import { IconCategory, IconPlus, IconTrash, IconChevronDown, IconChevronUp } from '@tabler/icons-vue'

const notif = useNotification()

// ── Lista de categorías ───────────────────────────────────────────────────────
const categorias = ref<Categoria[]>([])
const cargando = ref(true)
const expandida = ref<string | null>(null)

async function cargar() {
  try {
    categorias.value = await categoriasService.listarCategorias()
  } catch {
    notif.error('Error al cargar categorías')
  } finally {
    cargando.value = false
  }
}

onMounted(cargar)

// ── Slug automático ───────────────────────────────────────────────────────────
function generarSlug(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// ── Formulario nueva categoría ────────────────────────────────────────────────
const nombre = ref('')
const slug = ref('')
const slugEditado = ref(false)

watch(nombre, (val) => {
  if (!slugEditado.value) slug.value = generarSlug(val)
})

// ── Campos dinámicos ──────────────────────────────────────────────────────────
interface CampoForm extends CampoCategoria {
  opcionesTexto: string
}

function campVacio(): CampoForm {
  return { nombre: '', label: '', tipo: 'text', requerido: false, opciones: [], opcionesTexto: '' }
}

const campos = ref<CampoForm[]>([])

function agregarCampo() {
  campos.value.push(campVacio())
}

function eliminarCampo(i: number) {
  campos.value.splice(i, 1)
}

function actualizarNombreCampo(i: number) {
  const campo = campos.value[i]
  if (campo) campo.nombre = generarSlug(campo.label).replace(/-/g, '_')
}

// ── Submit ────────────────────────────────────────────────────────────────────
const guardando = ref(false)

async function crear() {
  if (!nombre.value.trim()) {
    notif.advertencia('El nombre es requerido')
    return
  }
  if (!slug.value.trim()) {
    notif.advertencia('El slug es requerido')
    return
  }

  const camposSchema: CampoCategoria[] = campos.value.map((c) => ({
    nombre: c.nombre || generarSlug(c.label).replace(/-/g, '_'),
    label: c.label,
    tipo: c.tipo,
    requerido: c.requerido,
    ...(c.tipo === 'select' && {
      opciones: c.opcionesTexto.split('\n').map((o) => o.trim()).filter(Boolean),
    }),
  }))

  guardando.value = true
  try {
    await categoriasService.crearCategoria(nombre.value.trim(), slug.value.trim(), camposSchema)
    notif.exito('Categoría creada')
    nombre.value = ''
    slug.value = ''
    slugEditado.value = false
    campos.value = []
    await cargar()
  } catch (err) {
    notif.error(err instanceof Error ? err.message : 'Error al crear categoría')
  } finally {
    guardando.value = false
  }
}
</script>

<template>
  <div class="max-w-3xl mx-auto flex flex-col gap-8">
    <h1 class="text-2xl font-bold text-text-primary flex items-center gap-2">
      <IconCategory class="w-6 h-6" /> Categorías
    </h1>

    <!-- Formulario nueva categoría -->
    <section class="card p-6">
      <h2 class="font-semibold text-text-primary mb-5 text-lg">Nueva categoría</h2>
      <div class="flex flex-col gap-4">

        <div class="grid grid-cols-2 gap-3">
          <AppInput
            v-model="nombre"
            id="cat-nombre"
            label="Nombre"
            placeholder="Ej: Medicamentos"
            requerido
          />
          <div class="flex flex-col gap-1">
            <label for="cat-slug" class="text-sm font-medium text-text-primary">
              Slug <span class="text-error">*</span>
            </label>
            <input
              id="cat-slug"
              v-model="slug"
              type="text"
              class="input-base font-mono text-sm"
              placeholder="medicamentos"
              @input="slugEditado = true"
            />
          </div>
        </div>

        <!-- Campos dinámicos -->
        <div class="flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium text-text-primary">Campos adicionales</p>
            <AppButton variante="outline" tamano="sm" @click="agregarCampo">
              <IconPlus class="w-3.5 h-3.5 mr-1" /> Agregar campo
            </AppButton>
          </div>

          <div v-if="campos.length === 0" class="text-sm text-text-muted text-center py-4 border border-dashed border-border rounded-lg">
            Sin campos adicionales. Agrega los que necesites.
          </div>

          <div
            v-for="(campo, i) in campos"
            :key="i"
            class="border border-border rounded-lg p-4 flex flex-col gap-3 bg-surface-subtle"
          >
            <div class="grid grid-cols-2 gap-3">
              <div class="flex flex-col gap-1">
                <label class="text-xs font-medium text-text-secondary">Etiqueta (label)</label>
                <input
                  v-model="campo.label"
                  type="text"
                  class="input-base text-sm"
                  placeholder="Ej: Requiere fórmula"
                  @input="actualizarNombreCampo(i)"
                />
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-xs font-medium text-text-secondary">Clave (nombre)</label>
                <input
                  v-model="campo.nombre"
                  type="text"
                  class="input-base text-sm font-mono"
                  placeholder="requiere_formula"
                />
              </div>
            </div>

            <div class="flex items-center gap-4">
              <div class="flex flex-col gap-1 flex-1">
                <label class="text-xs font-medium text-text-secondary">Tipo</label>
                <select v-model="campo.tipo" class="input-base text-sm">
                  <option value="text">Texto</option>
                  <option value="number">Número</option>
                  <option value="boolean">Sí/No (checkbox)</option>
                  <option value="select">Lista de opciones</option>
                </select>
              </div>
              <div class="flex items-center gap-2 mt-4">
                <input
                  :id="`req-${i}`"
                  v-model="campo.requerido"
                  type="checkbox"
                  class="w-4 h-4 rounded border-border text-primary"
                />
                <label :for="`req-${i}`" class="text-sm text-text-primary">Requerido</label>
              </div>
              <button
                type="button"
                class="mt-4 text-error hover:opacity-70 transition-opacity"
                @click="eliminarCampo(i)"
              >
                <IconTrash class="w-4 h-4" />
              </button>
            </div>

            <!-- Opciones para tipo select -->
            <div v-if="campo.tipo === 'select'" class="flex flex-col gap-1">
              <label class="text-xs font-medium text-text-secondary">Opciones (una por línea)</label>
              <textarea
                v-model="campo.opcionesTexto"
                rows="3"
                class="input-base text-sm resize-none"
                placeholder="Opción 1&#10;Opción 2&#10;Opción 3"
              />
            </div>
          </div>
        </div>

        <AppButton bloque :cargando="guardando" @click="crear">
          Crear categoría
        </AppButton>
      </div>
    </section>

    <!-- Lista de categorías existentes -->
    <section class="card overflow-hidden">
      <div class="px-6 py-4 border-b border-border">
        <h2 class="font-semibold text-text-primary text-lg">Categorías existentes</h2>
      </div>

      <div v-if="cargando" class="p-6 flex flex-col gap-3">
        <div v-for="n in 3" :key="n" class="h-12 bg-surface-muted rounded animate-pulse" />
      </div>

      <div v-else-if="categorias.length === 0" class="p-8 text-center text-text-muted text-sm">
        No hay categorías aún.
      </div>

      <div v-else class="divide-y divide-border">
        <div v-for="cat in categorias" :key="cat.id">
          <button
            type="button"
            class="w-full flex items-center justify-between px-6 py-4 hover:bg-surface-subtle transition-colors text-left"
            @click="expandida = expandida === cat.id ? null : cat.id"
          >
            <div>
              <p class="font-medium text-text-primary">{{ cat.nombre }}</p>
              <p class="text-xs text-text-muted font-mono">{{ cat.slug }}</p>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-xs text-text-muted">{{ cat.campos_schema.length }} campo{{ cat.campos_schema.length !== 1 ? 's' : '' }}</span>
              <component
                :is="expandida === cat.id ? IconChevronUp : IconChevronDown"
                class="w-4 h-4 text-text-muted"
              />
            </div>
          </button>

          <div v-if="expandida === cat.id && cat.campos_schema.length > 0" class="px-6 pb-4">
            <table class="w-full text-sm">
              <thead>
                <tr class="text-text-muted text-xs">
                  <th class="text-left pb-2 font-medium">Clave</th>
                  <th class="text-left pb-2 font-medium">Etiqueta</th>
                  <th class="text-left pb-2 font-medium">Tipo</th>
                  <th class="text-left pb-2 font-medium">Requerido</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                <tr v-for="campo in cat.campos_schema" :key="campo.nombre">
                  <td class="py-2 font-mono text-xs text-text-secondary">{{ campo.nombre }}</td>
                  <td class="py-2 text-text-primary">{{ campo.label }}</td>
                  <td class="py-2 text-text-secondary">{{ campo.tipo }}</td>
                  <td class="py-2">
                    <span
                      :class="campo.requerido ? 'text-success' : 'text-text-muted'"
                      class="text-xs font-medium"
                    >
                      {{ campo.requerido ? 'Sí' : 'No' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else-if="expandida === cat.id" class="px-6 pb-4 text-sm text-text-muted">
            Sin campos adicionales.
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
