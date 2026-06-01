<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  IconShield,
  IconUser,
  IconEdit,
  IconTrash,
  IconKey,
  IconX,
  IconCheck,
  IconLoader2,
  IconSearch,
  IconUserPlus,
} from '@tabler/icons-vue'
import * as usuariosService from '../../services/usuarios.service'
import type { UsuarioAdmin } from '../../services/usuarios.service'
import { useNotification } from '../../composables/useNotification'

const notif = useNotification()

const usuarios = ref<UsuarioAdmin[]>([])
const cargando = ref(false)

// Filtros
const filtroRol = ref<'admin' | 'cliente' | 'todos'>('admin')
const busqueda = ref('')

const usuariosFiltrados = computed(() => {
  let lista = usuarios.value
  if (filtroRol.value !== 'todos') {
    lista = lista.filter((u) => u.rol === filtroRol.value)
  }
  const q = busqueda.value.trim().toLowerCase()
  if (q) {
    lista = lista.filter(
      (u) =>
        u.nombre.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.telefono ?? '').toLowerCase().includes(q),
    )
  }
  return lista
})

// Modal crear
const modalCrear = ref(false)
const creando = ref(false)
const formCrear = ref({ email: '', password: '', nombre: '', telefono: '', rol: 'cliente' })

// Modal editar
const modalEditar = ref(false)
const guardando = ref(false)
const form = ref({ id: '', nombre: '', telefono: '', rol: 'cliente', password: '' })

// Confirmación eliminar
const confirmandoEliminar = ref<string | null>(null)
const eliminando = ref(false)

onMounted(cargar)

async function cargar() {
  cargando.value = true
  try {
    usuarios.value = await usuariosService.listarUsuarios()
  } catch {
    notif.error('Error al cargar los usuarios')
  } finally {
    cargando.value = false
  }
}

function abrirEditar(u: UsuarioAdmin) {
  form.value = { id: u.id, nombre: u.nombre, telefono: u.telefono ?? '', rol: u.rol, password: '' }
  modalEditar.value = true
}

function cerrarModal() {
  modalEditar.value = false
}

async function guardar() {
  if (!form.value.nombre.trim()) {
    notif.error('El nombre es obligatorio')
    return
  }
  guardando.value = true
  try {
    await usuariosService.actualizarUsuario(
      form.value.id,
      form.value.nombre.trim(),
      form.value.telefono.trim(),
      form.value.rol,
    )
    if (form.value.password.trim()) {
      await usuariosService.cambiarPassword(form.value.id, form.value.password.trim())
    }
    notif.exito('Usuario actualizado')
    modalEditar.value = false
    await cargar()
  } catch {
    notif.error('Error al actualizar el usuario')
  } finally {
    guardando.value = false
  }
}

async function eliminar(id: string) {
  eliminando.value = true
  try {
    await usuariosService.eliminarUsuario(id)
    notif.exito('Usuario eliminado')
    confirmandoEliminar.value = null
    usuarios.value = usuarios.value.filter((u) => u.id !== id)
  } catch (e: any) {
    notif.error(e?.message ?? 'Error al eliminar el usuario')
  } finally {
    eliminando.value = false
  }
}

function formatFecha(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

function contarPorRol(rol: string) {
  return usuarios.value.filter((u) => u.rol === rol).length
}

function abrirCrear() {
  formCrear.value = { email: '', password: '', nombre: '', telefono: '', rol: 'cliente' }
  modalCrear.value = true
}

async function crear() {
  if (!formCrear.value.email.trim() || !formCrear.value.password.trim() || !formCrear.value.nombre.trim()) {
    notif.error('Email, contraseña y nombre son obligatorios')
    return
  }
  creando.value = true
  try {
    await usuariosService.crearUsuario(
      formCrear.value.email.trim(),
      formCrear.value.password.trim(),
      formCrear.value.nombre.trim(),
      formCrear.value.telefono.trim(),
      formCrear.value.rol,
    )
    notif.exito('Usuario creado exitosamente')
    modalCrear.value = false
    await cargar()
  } catch (e: any) {
    notif.error(e?.message ?? 'Error al crear el usuario')
  } finally {
    creando.value = false
  }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-text-primary flex items-center gap-2">
        <IconShield class="w-6 h-6" /> Usuarios
      </h1>
      <button class="btn-primary flex items-center gap-2" @click="abrirCrear">
        <IconUserPlus class="w-4 h-4" /> Nuevo usuario
      </button>
    </div>

    <!-- Filtros -->
    <div class="flex flex-col sm:flex-row gap-3 mb-4">
      <!-- Tabs de rol -->
      <div class="flex rounded-lg border border-border overflow-hidden text-sm">
        <button
          v-for="tab in [
            { key: 'admin', label: 'Admins' },
            { key: 'cliente', label: 'Clientes' },
            { key: 'todos', label: 'Todos' },
          ]"
          :key="tab.key"
          :class="[
            'px-4 py-2 font-medium transition-colors',
            filtroRol === tab.key
              ? 'bg-brand-blue text-white'
              : 'bg-white text-text-secondary hover:bg-surface-subtle',
          ]"
          @click="filtroRol = tab.key as any"
        >
          {{ tab.label }}
          <span
            v-if="tab.key !== 'todos'"
            :class="[
              'ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full text-xs',
              filtroRol === tab.key ? 'bg-white/20 text-white' : 'bg-surface-muted text-text-muted',
            ]"
          >
            {{ contarPorRol(tab.key) }}
          </span>
          <span
            v-else
            :class="[
              'ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full text-xs',
              filtroRol === tab.key ? 'bg-white/20 text-white' : 'bg-surface-muted text-text-muted',
            ]"
          >
            {{ usuarios.length }}
          </span>
        </button>
      </div>

      <!-- Búsqueda -->
      <div class="relative flex-1 max-w-xs">
        <IconSearch class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          v-model="busqueda"
          type="text"
          placeholder="Buscar por nombre, correo..."
          class="input w-full pl-9"
        />
      </div>
    </div>

    <div v-if="cargando" class="text-text-muted text-sm">Cargando usuarios...</div>

    <div v-else-if="usuariosFiltrados.length === 0" class="card p-8 text-center text-text-muted">
      No hay usuarios que coincidan con los filtros.
    </div>

    <div v-else class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-surface-muted border-b border-border">
            <tr>
              <th class="text-left px-4 py-3 font-medium text-text-secondary">Nombre</th>
              <th class="text-left px-4 py-3 font-medium text-text-secondary">Correo</th>
              <th class="text-left px-4 py-3 font-medium text-text-secondary">Teléfono</th>
              <th class="text-left px-4 py-3 font-medium text-text-secondary">Rol</th>
              <th class="text-left px-4 py-3 font-medium text-text-secondary">Registro</th>
              <th class="text-left px-4 py-3 font-medium text-text-secondary">Último acceso</th>
              <th class="text-center px-4 py-3 font-medium text-text-secondary">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr
              v-for="u in usuariosFiltrados"
              :key="u.id"
              class="hover:bg-surface-subtle transition-colors duration-base"
            >
              <td class="px-4 py-3 font-medium text-text-primary">
                <div class="flex items-center gap-2">
                  <IconShield v-if="u.rol === 'admin'" class="w-4 h-4 text-brand-turquoise flex-shrink-0" />
                  <IconUser v-else class="w-4 h-4 text-text-muted flex-shrink-0" />
                  {{ u.nombre || '—' }}
                </div>
              </td>
              <td class="px-4 py-3 text-text-secondary">{{ u.email }}</td>
              <td class="px-4 py-3 text-text-secondary">{{ u.telefono ?? '—' }}</td>
              <td class="px-4 py-3">
                <span
                  :class="[
                    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                    u.rol === 'admin'
                      ? 'bg-brand-turquoise/10 text-brand-turquoise'
                      : 'bg-surface-muted text-text-secondary',
                  ]"
                >
                  {{ u.rol === 'admin' ? 'Admin' : 'Cliente' }}
                </span>
              </td>
              <td class="px-4 py-3 text-text-muted">{{ formatFecha(u.created_at) }}</td>
              <td class="px-4 py-3 text-text-muted">{{ formatFecha(u.last_sign_in_at) }}</td>
              <td class="px-4 py-3 text-center">
                <div class="flex items-center justify-center gap-2">
                  <button
                    title="Editar usuario"
                    class="p-1.5 rounded hover:bg-surface-muted text-text-secondary hover:text-brand-blue transition-colors"
                    @click="abrirEditar(u)"
                  >
                    <IconEdit class="w-4 h-4" />
                  </button>

                  <template v-if="confirmandoEliminar === u.id">
                    <button
                      title="Confirmar eliminación"
                      :disabled="eliminando"
                      class="p-1.5 rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                      @click="eliminar(u.id)"
                    >
                      <IconLoader2 v-if="eliminando" class="w-4 h-4 animate-spin" />
                      <IconCheck v-else class="w-4 h-4" />
                    </button>
                    <button
                      title="Cancelar"
                      class="p-1.5 rounded hover:bg-surface-muted text-text-muted transition-colors"
                      @click="confirmandoEliminar = null"
                    >
                      <IconX class="w-4 h-4" />
                    </button>
                  </template>
                  <button
                    v-else
                    title="Eliminar usuario"
                    class="p-1.5 rounded hover:bg-red-50 text-text-muted hover:text-red-600 transition-colors"
                    @click="confirmandoEliminar = u.id"
                  >
                    <IconTrash class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="text-xs text-text-muted px-4 py-3 border-t border-border">
        {{ usuariosFiltrados.length }} de {{ usuarios.length }} usuario{{ usuarios.length !== 1 ? 's' : '' }}
      </p>
    </div>

    <!-- Modal crear -->
    <Teleport to="body">
      <div
        v-if="modalCrear"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="modalCrear = false"
      >
        <div class="bg-white rounded-xl shadow-xl w-full max-w-md">
          <div class="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 class="font-semibold text-text-primary flex items-center gap-2">
              <IconUserPlus class="w-4 h-4" /> Nuevo usuario
            </h2>
            <button class="p-1 rounded hover:bg-surface-muted text-text-muted transition-colors" @click="modalCrear = false">
              <IconX class="w-5 h-5" />
            </button>
          </div>

          <form class="px-6 py-5 space-y-4" @submit.prevent="crear">
            <div>
              <label class="block text-sm font-medium text-text-secondary mb-1">Nombre</label>
              <input v-model="formCrear.nombre" type="text" class="input w-full" placeholder="Nombre completo" required />
            </div>

            <div>
              <label class="block text-sm font-medium text-text-secondary mb-1">Correo electrónico</label>
              <input v-model="formCrear.email" type="email" class="input w-full" placeholder="correo@ejemplo.com" required />
            </div>

            <div>
              <label class="block text-sm font-medium text-text-secondary mb-1">Teléfono</label>
              <input v-model="formCrear.telefono" type="tel" class="input w-full" placeholder="Teléfono (opcional)" />
            </div>

            <div>
              <label class="block text-sm font-medium text-text-secondary mb-1">Rol</label>
              <select v-model="formCrear.rol" class="input w-full">
                <option value="cliente">Cliente</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-text-secondary mb-1 flex items-center gap-1">
                <IconKey class="w-3.5 h-3.5" /> Contraseña
              </label>
              <input
                v-model="formCrear.password"
                type="password"
                class="input w-full"
                placeholder="Mínimo 6 caracteres"
                autocomplete="new-password"
                required
              />
            </div>

            <div class="flex gap-3 pt-2">
              <button type="button" class="btn-secondary flex-1" @click="modalCrear = false">Cancelar</button>
              <button
                type="submit"
                :disabled="creando"
                class="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <IconLoader2 v-if="creando" class="w-4 h-4 animate-spin" />
                {{ creando ? 'Creando...' : 'Crear usuario' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal editar -->
    <Teleport to="body">
      <div
        v-if="modalEditar"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="cerrarModal"
      >
        <div class="bg-white rounded-xl shadow-xl w-full max-w-md">
          <div class="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 class="font-semibold text-text-primary flex items-center gap-2">
              <IconEdit class="w-4 h-4" /> Editar usuario
            </h2>
            <button
              class="p-1 rounded hover:bg-surface-muted text-text-muted transition-colors"
              @click="cerrarModal"
            >
              <IconX class="w-5 h-5" />
            </button>
          </div>

          <form class="px-6 py-5 space-y-4" @submit.prevent="guardar">
            <div>
              <label class="block text-sm font-medium text-text-secondary mb-1">Nombre</label>
              <input v-model="form.nombre" type="text" class="input w-full" placeholder="Nombre completo" required />
            </div>

            <div>
              <label class="block text-sm font-medium text-text-secondary mb-1">Teléfono</label>
              <input v-model="form.telefono" type="tel" class="input w-full" placeholder="Teléfono (opcional)" />
            </div>

            <div>
              <label class="block text-sm font-medium text-text-secondary mb-1">Rol</label>
              <select v-model="form.rol" class="input w-full">
                <option value="cliente">Cliente</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-text-secondary mb-1 flex items-center gap-1">
                <IconKey class="w-3.5 h-3.5" /> Nueva contraseña
                <span class="text-text-muted font-normal">(dejar vacío para no cambiar)</span>
              </label>
              <input
                v-model="form.password"
                type="password"
                class="input w-full"
                placeholder="Nueva contraseña"
                autocomplete="new-password"
              />
            </div>

            <div class="flex gap-3 pt-2">
              <button type="button" class="btn-secondary flex-1" @click="cerrarModal">Cancelar</button>
              <button
                type="submit"
                :disabled="guardando"
                class="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <IconLoader2 v-if="guardando" class="w-4 h-4 animate-spin" />
                {{ guardando ? 'Guardando...' : 'Guardar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>
