<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCamera } from '../../composables/useCamera'
import { useNotification } from '../../composables/useNotification'
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import type { Categoria } from '../../types/category.types'
import * as categoriasService from '../../services/categories.service'
import * as productsService from '../../services/products.service'
import AppButton from '../../components/ui/AppButton.vue'
import AppInput from '../../components/ui/AppInput.vue'
import { IconEdit, IconRefresh, IconX, IconArrowLeft } from '@tabler/icons-vue'

const route = useRoute()
const router = useRouter()
const productoId = route.params.id as string

const { fotoPreview, archivoSeleccionado, subiendo, errorCaptura, manejarSeleccion, subirFoto, limpiar } = useCamera()
const notif = useNotification()

const cargando = ref(true)
const imagenExistente = ref<string | null>(null)
const categorias = ref<Categoria[]>([])
const categoriaSeleccionadaId = ref<string>('')
const camposExtraProducto = ref<Record<string, unknown>>({})

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

const { handleSubmit, errors, setValues } = useForm({
  validationSchema: toTypedSchema(schemaBase),
})

const { value: codigo } = useField<string>('codigo')
const { value: nombre } = useField<string>('nombre')
const { value: descripcion } = useField<string>('descripcion')
const { value: precio } = useField<string>('precio')
const { value: stock } = useField<string>('stock')

const camposExtra = ref<Record<string, string | boolean>>({})

watch(categoriaActual, (nueva) => {
  camposExtra.value = {}
  if (nueva) {
    for (const campo of nueva.campos_schema) {
      const valorExistente = camposExtraProducto.value[campo.nombre]
      camposExtra.value[campo.nombre] = valorExistente !== undefined
        ? (valorExistente as string | boolean)
        : (campo.tipo === 'boolean' ? false : '')
    }
  }
})

onMounted(async () => {
  try {
    const [producto, cats] = await Promise.all([
      productsService.obtenerProducto(productoId),
      categoriasService.listarCategorias(),
    ])

    categorias.value = cats
    imagenExistente.value = producto.imagenes?.[0] ?? null
    camposExtraProducto.value = producto.campos_extra ?? {}

    setValues({
      codigo: producto.codigo ?? '',
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: String(producto.precio),
      stock: String(producto.stock),
    })

    categoriaSeleccionadaId.value = producto.categoria_id
  } catch {
    notif.error('Error al cargar el producto')
    router.push({ name: 'admin-productos' })
  } finally {
    cargando.value = false
  }
})

const guardando = ref(false)

const onSubmit = handleSubmit(async (valores) => {
  if (!categoriaSeleccionadaId.value) {
    notif.advertencia('Selecciona una categoría')
    return
  }

  guardando.value = true
  try {
    let imagenes: string[] | undefined

    if (archivoSeleccionado.value) {
      const url = await subirFoto(productoId)
      if (!url) {
        notif.error('No se pudo subir la imagen')
        return
      }
      imagenes = [url]
    }

    await productsService.actualizarProducto({
      id: productoId,
      codigo: valores.codigo || null,
      nombre: valores.nombre,
      descripcion: valores.descripcion,
      precio: Number(valores.precio),
      stock: Number(valores.stock),
      categoria_id: categoriaSeleccionadaId.value,
      campos_extra: { ...camposExtra.value },
      ...(imagenes && { imagenes }),
    })

    notif.exito('Producto actualizado')
    router.push({ name: 'admin-productos' })
  } catch (err) {
    notif.error(err instanceof Error ? err.message : 'Error al actualizar')
  } finally {
    guardando.value = false
  }
})

const imagenMostrada = computed(() => fotoPreview.value ?? imagenExistente.value)
</script>

<template>
  <div class="max-w-lg mx-auto">
    <div class="flex items-center gap-3 mb-6">
      <button
        type="button"
        class="text-text-muted hover:text-text-primary transition-colors"
        @click="router.push({ name: 'admin-productos' })"
      >
        <IconArrowLeft class="w-5 h-5" />
      </button>
      <h1 class="text-2xl font-bold text-text-primary flex items-center gap-2">
        <IconEdit class="w-6 h-6" /> Editar Producto
      </h1>
    </div>

    <div v-if="cargando" class="flex flex-col gap-4">
      <div v-for="n in 3" :key="n" class="card p-5 animate-pulse">
        <div class="h-4 bg-surface-muted rounded w-1/3 mb-4" />
        <div class="h-32 bg-surface-muted rounded" />
      </div>
    </div>

    <form v-else class="flex flex-col gap-6" @submit.prevent="onSubmit">

      <!-- Foto -->
      <section class="card p-5">
        <h2 class="font-semibold text-text-primary mb-4 text-lg">1. Foto del producto</h2>

        <div
          v-if="imagenMostrada"
          class="w-full aspect-square rounded-xl overflow-hidden bg-surface-muted mb-4 relative"
        >
          <img :src="imagenMostrada" alt="Preview" class="w-full h-full object-cover" />
          <button
            v-if="fotoPreview"
            type="button"
            class="absolute top-2 right-2 bg-error text-text-inverse rounded-full w-8 h-8 flex items-center justify-center shadow-md"
            @click="limpiar"
          >
            <IconX class="w-4 h-4" />
          </button>
        </div>

        <label
          :class="[
            'flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed cursor-pointer transition-colors duration-base',
            imagenMostrada ? 'border-primary bg-primary-50 py-3' : 'border-border bg-surface-subtle py-10 hover:border-primary hover:bg-primary-50',
          ]"
        >
          <input
            type="file"
            accept="image/*"
            capture="environment"
            class="sr-only"
            @change="manejarSeleccion"
          />
          <IconRefresh class="w-10 h-10 text-text-muted" />
          <span class="text-sm font-medium text-text-secondary">Cambiar foto</span>
        </label>

        <p v-if="errorCaptura" class="text-xs text-error mt-2">{{ errorCaptura }}</p>
      </section>

      <!-- Categoría -->
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

      <!-- Datos -->
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

      <!-- Campos dinámicos de categoría -->
      <section v-if="categoriaActual" class="card p-5">
        <h2 class="font-semibold text-text-primary mb-4 text-lg">
          4. Información de {{ categoriaActual.nombre }}
        </h2>
        <div class="flex flex-col gap-4">
          <template v-for="campo in categoriaActual.campos_schema" :key="campo.nombre">
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

      <AppButton
        tipo="submit"
        tamano="lg"
        bloque
        :cargando="guardando || subiendo"
        class="sticky bottom-4"
      >
        {{ subiendo ? 'Subiendo imagen...' : guardando ? 'Guardando...' : 'Guardar cambios' }}
      </AppButton>
    </form>
  </div>
</template>
