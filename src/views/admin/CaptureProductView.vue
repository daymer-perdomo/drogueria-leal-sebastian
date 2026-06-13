<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useCamera } from '../../composables/useCamera'
import { useNotification } from '../../composables/useNotification'
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import type { Categoria } from '../../types/category.types'
import type { UnidadVenta } from '../../types/product.types'
import * as categoriasService from '../../services/categories.service'
import * as productsService from '../../services/products.service'
import AppButton from '../../components/ui/AppButton.vue'
import AppInput from '../../components/ui/AppInput.vue'
import { IconCamera, IconCheck, IconX, IconRefresh } from '@tabler/icons-vue'

const { fotoPreview, archivoSeleccionado, subiendo, errorCaptura, manejarSeleccion, subirFoto, limpiar } = useCamera()
const notif = useNotification()

// ── Categorías desde la base de datos ───────────────────────────────────────
const categorias = ref<Categoria[]>([])
onMounted(async () => {
  try {
    categorias.value = await categoriasService.listarCategorias()
  } catch {
    // silently ignore; user will see empty category list
  }
})

// ── Formulario base ─────────────────────────────────────────────────────────
const categoriaSeleccionadaId = ref<string>('')
const categoriaActual = computed<Categoria | undefined>(() =>
  categorias.value.find((c) => c.id === categoriaSeleccionadaId.value),
)

const schemaBase = z.object({
  codigo: z.string().optional(),
  nombre: z.string().min(2, 'Mínimo 2 caracteres'),
  descripcion: z.string().min(1, 'La descripción es requerida'),
  precio: z.coerce.number().positive('El precio debe ser mayor a 0'),
  stock: z.coerce.number().int().min(0, 'El stock no puede ser negativo'),
})

const { handleSubmit, errors, resetForm } = useForm({
  validationSchema: toTypedSchema(schemaBase),
})

const { value: codigo } = useField<string>('codigo')
const { value: nombre } = useField<string>('nombre')
const { value: descripcion } = useField<string>('descripcion')
const { value: precio } = useField<string>('precio')
const { value: stock } = useField<string>('stock')

// ── Campos dinámicos ─────────────────────────────────────────────────────────
const camposExtra = ref<Record<string, string | boolean>>({})

watch(categoriaActual, (nueva) => {
  camposExtra.value = {}
  if (nueva) {
    for (const campo of nueva.campos_schema) {
      camposExtra.value[campo.nombre] = campo.tipo === 'boolean' ? false : ''
    }
  }
})

// ── Unidades de venta ────────────────────────────────────────────────────────
const unidadesForm = ref({
  caja: { habilitada: false, precio: '' },
  tableta: { habilitada: false, precio: '' },
})

function unidadesParaGuardar(): UnidadVenta[] {
  const result: UnidadVenta[] = []
  if (unidadesForm.value.caja.habilitada && Number(unidadesForm.value.caja.precio) > 0) {
    result.push({ tipo: 'caja', etiqueta: 'Caja', precio: Number(unidadesForm.value.caja.precio) })
  }
  if (unidadesForm.value.tableta.habilitada && Number(unidadesForm.value.tableta.precio) > 0) {
    result.push({ tipo: 'tableta', etiqueta: 'Tableta', precio: Number(unidadesForm.value.tableta.precio) })
  }
  return result
}

// ── Submit ───────────────────────────────────────────────────────────────────
const guardando = ref(false)
const exitoso = ref(false)

const onSubmit = handleSubmit(async (valores) => {
  if (!archivoSeleccionado.value) {
    notif.advertencia('Por favor toma una foto del producto')
    return
  }
  if (!categoriaSeleccionadaId.value) {
    notif.advertencia('Selecciona una categoría')
    return
  }

  guardando.value = true
  try {
    const urlImagen = await subirFoto()
    if (!urlImagen) {
      notif.error('No se pudo subir la imagen')
      return
    }

    const uv = unidadesParaGuardar()
    await productsService.crearProducto({
      codigo: valores.codigo || null,
      nombre: valores.nombre,
      descripcion: valores.descripcion,
      precio: Number(valores.precio),
      stock: Number(valores.stock),
      categoria_id: categoriaSeleccionadaId.value,
      imagenes: [urlImagen],
      campos_extra: { ...camposExtra.value, ...(uv.length ? { unidades_venta: uv } : {}) },
      activo: true,
    })

    notif.exito('¡Producto creado exitosamente!')
    exitoso.value = true
    resetForm()
    limpiar()
    categoriaSeleccionadaId.value = ''
    camposExtra.value = {}
    unidadesForm.value = { caja: { habilitada: false, precio: '' }, tableta: { habilitada: false, precio: '' } }
    setTimeout(() => { exitoso.value = false }, 3000)
  } catch (err) {
    notif.error(err instanceof Error ? err.message : 'Error al guardar el producto')
  } finally {
    guardando.value = false
  }
})
</script>

<template>
  <div class="max-w-lg mx-auto">
    <h1 class="text-2xl font-bold text-text-primary mb-6 flex items-center gap-2">
      <IconCamera class="w-6 h-6" /> Capturar Producto
    </h1>

    <!-- Éxito -->
    <Transition name="fade">
      <div
        v-if="exitoso"
        class="bg-[var(--color-success-bg)] border border-success text-success rounded-lg p-4 mb-6 text-center font-medium"
      >
        <IconCheck class="w-4 h-4 inline-block mr-1" /> ¡Producto guardado exitosamente!
      </div>
    </Transition>

    <form class="flex flex-col gap-6" @submit.prevent="onSubmit">

      <!-- PASO 1: Foto -->
      <section class="card p-5">
        <h2 class="font-semibold text-text-primary mb-4 text-lg">1. Foto del producto</h2>

        <!-- Preview -->
        <div
          v-if="fotoPreview"
          class="w-full aspect-square rounded-xl overflow-hidden bg-surface-muted mb-4 relative"
        >
          <img :src="fotoPreview" alt="Preview" class="w-full h-full object-cover" />
          <button
            type="button"
            class="absolute top-2 right-2 bg-error text-text-inverse rounded-full w-8 h-8 flex items-center justify-center shadow-md"
            @click="limpiar"
          >
            <IconX class="w-4 h-4" />
          </button>
        </div>

        <!-- Botón cámara -->
        <label
          :class="[
            'flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed cursor-pointer transition-colors duration-base',
            fotoPreview ? 'border-primary bg-primary-50 py-3' : 'border-border bg-surface-subtle py-10 hover:border-primary hover:bg-primary-50',
          ]"
        >
          <input
            type="file"
            accept="image/*"
            capture="environment"
            class="sr-only"
            @change="manejarSeleccion"
          />
          <component :is="fotoPreview ? IconRefresh : IconCamera" class="w-10 h-10 text-text-muted" />
          <span class="text-sm font-medium text-text-secondary">
            {{ fotoPreview ? 'Cambiar foto' : 'Tomar foto' }}
          </span>
          <span class="text-xs text-text-muted">Usa la cámara trasera</span>
        </label>

        <p v-if="errorCaptura" class="text-xs text-error mt-2">{{ errorCaptura }}</p>
      </section>

      <!-- PASO 2: Categoría -->
      <section class="card p-5">
        <h2 class="font-semibold text-text-primary mb-4 text-lg">2. Categoría</h2>
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="cat in categorias"
            :key="cat.id"
            type="button"
            :class="[
              'p-3 rounded-lg border-2 text-sm font-medium text-center transition-colors duration-base',
              categoriaSeleccionadaId === cat.id
                ? 'border-primary bg-primary-50 text-primary'
                : 'border-border text-text-secondary hover:border-primary-300',
            ]"
            @click="categoriaSeleccionadaId = cat.id"
          >
            {{ cat.nombre }}
          </button>
        </div>
      </section>

      <!-- PASO 3: Datos comunes -->
      <section class="card p-5">
        <h2 class="font-semibold text-text-primary mb-4 text-lg">3. Datos del producto</h2>
        <div class="flex flex-col gap-4">
          <AppInput
            v-model="codigo"
            id="codigo"
            label="Código del producto"
            placeholder="Ej: MED-001"
            :error="errors.codigo"
          />
          <AppInput
            v-model="nombre"
            id="nombre"
            label="Nombre del producto"
            placeholder="Ej: Acetaminofén 500mg x 10"
            :error="errors.nombre"
            requerido
          />
          <div class="flex flex-col gap-1">
            <label for="descripcion" class="text-sm font-medium text-text-primary">
              Descripción <span class="text-error">*</span>
            </label>
            <textarea
              id="descripcion"
              v-model="descripcion"
              rows="3"
              placeholder="Descripción breve del producto"
              :class="['input-base resize-none', errors.descripcion ? 'border-error' : '']"
            />
            <p v-if="errors.descripcion" class="text-xs text-error">{{ errors.descripcion }}</p>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <AppInput
              v-model="precio"
              id="precio"
              label="Precio (COP)"
              tipo="number"
              placeholder="0"
              :error="errors.precio"
              requerido
            />
            <AppInput
              v-model="stock"
              id="stock"
              label="Stock"
              tipo="number"
              placeholder="0"
              :error="errors.stock"
              requerido
            />
          </div>
        </div>
      </section>

      <!-- PASO 4: Campos dinámicos de categoría -->
      <section v-if="categoriaActual" class="card p-5">
        <h2 class="font-semibold text-text-primary mb-4 text-lg">
          4. Información de {{ categoriaActual.nombre }}
        </h2>
        <div class="flex flex-col gap-4">
          <template v-for="campo in categoriaActual.campos_schema" :key="campo.nombre">
            <!-- Boolean -->
            <div v-if="campo.tipo === 'boolean'" class="flex items-center gap-3">
              <input
                :id="`campo-${campo.nombre}`"
                v-model="(camposExtra as Record<string, boolean>)[campo.nombre]"
                type="checkbox"
                class="w-5 h-5 rounded border-border text-primary focus:ring-primary-500"
              />
              <label :for="`campo-${campo.nombre}`" class="text-sm font-medium text-text-primary">
                {{ campo.label }}
              </label>
            </div>

            <!-- Select -->
            <div v-else-if="campo.tipo === 'select'" class="flex flex-col gap-1">
              <label :for="`campo-${campo.nombre}`" class="text-sm font-medium text-text-primary">
                {{ campo.label }}
                <span v-if="campo.requerido" class="text-error ml-0.5">*</span>
              </label>
              <select
                :id="`campo-${campo.nombre}`"
                v-model="(camposExtra as Record<string, string>)[campo.nombre]"
                class="input-base"
              >
                <option value="" disabled>Seleccionar...</option>
                <option v-for="opcion in campo.opciones" :key="opcion" :value="opcion">
                  {{ opcion }}
                </option>
              </select>
            </div>

            <!-- Number -->
            <div v-else-if="campo.tipo === 'number'" class="flex flex-col gap-1">
              <label :for="`campo-${campo.nombre}`" class="text-sm font-medium text-text-primary">
                {{ campo.label }}
                <span v-if="campo.requerido" class="text-error ml-0.5">*</span>
              </label>
              <input
                :id="`campo-${campo.nombre}`"
                v-model="(camposExtra as Record<string, string>)[campo.nombre]"
                type="number"
                class="input-base"
                :required="campo.requerido"
              />
            </div>

            <!-- Text -->
            <div v-else class="flex flex-col gap-1">
              <label :for="`campo-${campo.nombre}`" class="text-sm font-medium text-text-primary">
                {{ campo.label }}
                <span v-if="campo.requerido" class="text-error ml-0.5">*</span>
              </label>
              <input
                :id="`campo-${campo.nombre}`"
                v-model="(camposExtra as Record<string, string>)[campo.nombre]"
                type="text"
                class="input-base"
                :required="campo.requerido"
              />
            </div>
          </template>
        </div>
      </section>

      <!-- PASO 5: Unidades de venta -->
      <section class="card p-5">
        <h2 class="font-semibold text-text-primary mb-1 text-lg">5. Unidades de venta</h2>
        <p class="text-xs text-text-muted mb-4">Configura si el producto se puede vender por caja o por tableta individual, con su respectivo precio.</p>
        <div class="flex flex-col gap-4">
          <!-- Caja -->
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-3">
              <input
                id="uv-caja"
                v-model="unidadesForm.caja.habilitada"
                type="checkbox"
                class="w-4 h-4 rounded border-border text-primary"
              />
              <label for="uv-caja" class="text-sm font-medium text-text-primary">Vender por Caja</label>
            </div>
            <div v-if="unidadesForm.caja.habilitada" class="ml-7">
              <AppInput
                v-model="unidadesForm.caja.precio"
                id="uv-caja-precio"
                label="Precio por caja (COP)"
                tipo="number"
                placeholder="0"
              />
            </div>
          </div>
          <!-- Tableta -->
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-3">
              <input
                id="uv-tableta"
                v-model="unidadesForm.tableta.habilitada"
                type="checkbox"
                class="w-4 h-4 rounded border-border text-primary"
              />
              <label for="uv-tableta" class="text-sm font-medium text-text-primary">Vender por Tableta</label>
            </div>
            <div v-if="unidadesForm.tableta.habilitada" class="ml-7">
              <AppInput
                v-model="unidadesForm.tableta.precio"
                id="uv-tableta-precio"
                label="Precio por tableta (COP)"
                tipo="number"
                placeholder="0"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- Botón guardar -->
      <AppButton
        tipo="submit"
        tamano="lg"
        bloque
        :cargando="guardando || subiendo"
        class="sticky bottom-4"
      >
        {{ subiendo ? 'Subiendo imagen...' : guardando ? 'Guardando...' : 'Guardar producto' }}
      </AppButton>
    </form>
  </div>
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
