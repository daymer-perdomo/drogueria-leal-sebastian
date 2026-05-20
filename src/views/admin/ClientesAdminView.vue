<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as clientesService from '../../services/clientes.service'
import type { Cliente } from '../../types/cliente.types'
import { useNotification } from '../../composables/useNotification'
import { IconUsers, IconToggleLeft, IconToggleRight } from '@tabler/icons-vue'

const notif = useNotification()
const clientes = ref<Cliente[]>([])
const cargando = ref(false)

onMounted(async () => {
  cargando.value = true
  try {
    clientes.value = await clientesService.listarClientes()
  } catch {
    notif.error('Error al cargar los clientes')
  } finally {
    cargando.value = false
  }
})

async function toggleActivo(cliente: Cliente) {
  const nuevoEstado = !cliente.activo
  try {
    await clientesService.toggleActivo(cliente.id, nuevoEstado)
    cliente.activo = nuevoEstado
    notif.exito(nuevoEstado ? 'Cliente activado' : 'Cliente desactivado')
  } catch {
    notif.error('Error al actualizar el cliente')
  }
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-text-primary mb-6 flex items-center gap-2">
      <IconUsers class="w-6 h-6" /> Clientes
    </h1>

    <div v-if="cargando" class="text-text-muted text-sm">Cargando clientes...</div>

    <div v-else-if="clientes.length === 0" class="card p-8 text-center text-text-muted">
      No hay clientes registrados aún.
    </div>

    <div v-else class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-surface-muted border-b border-border">
            <tr>
              <th class="text-left px-4 py-3 font-medium text-text-secondary">Nombre</th>
              <th class="text-left px-4 py-3 font-medium text-text-secondary">Correo</th>
              <th class="text-left px-4 py-3 font-medium text-text-secondary">Teléfono</th>
              <th class="text-left px-4 py-3 font-medium text-text-secondary">Registro</th>
              <th class="text-center px-4 py-3 font-medium text-text-secondary">Estado</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr
              v-for="cliente in clientes"
              :key="cliente.id"
              :class="['transition-colors duration-base', !cliente.activo ? 'opacity-50' : 'hover:bg-surface-subtle']"
            >
              <td class="px-4 py-3 font-medium text-text-primary">{{ cliente.nombre }}</td>
              <td class="px-4 py-3 text-text-secondary">{{ cliente.email }}</td>
              <td class="px-4 py-3 text-text-secondary">{{ cliente.telefono ?? '—' }}</td>
              <td class="px-4 py-3 text-text-muted">{{ formatFecha(cliente.created_at) }}</td>
              <td class="px-4 py-3 text-center">
                <button
                  :title="cliente.activo ? 'Desactivar cliente' : 'Activar cliente'"
                  class="inline-flex items-center justify-center transition-colors duration-base"
                  @click="toggleActivo(cliente)"
                >
                  <IconToggleRight v-if="cliente.activo" class="w-7 h-7 text-success" />
                  <IconToggleLeft v-else class="w-7 h-7 text-text-muted" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="text-xs text-text-muted px-4 py-3 border-t border-border">
        {{ clientes.length }} cliente{{ clientes.length !== 1 ? 's' : '' }} en total
      </p>
    </div>
  </div>
</template>
