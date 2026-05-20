import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'
import * as authService from '../services/auth.service'
import type { AuthUser, Perfil } from '../types/user.types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const cargando = ref(false)
  const inicializado = ref(false)

  const estaAutenticado = computed(() => user.value !== null)
  const esAdmin = computed(() => user.value?.perfil?.rol === 'admin')
  const esCliente = computed(() => user.value?.perfil?.rol === 'cliente')

  async function inicializar() {
    cargando.value = true
    try {
      const sesion = await authService.obtenerSesion()
      if (sesion?.user) {
        const perfil = await authService.obtenerPerfil(sesion.user.id)
        user.value = { id: sesion.user.id, email: sesion.user.email!, perfil }
      }
    } catch {
      user.value = null
    } finally {
      cargando.value = false
      inicializado.value = true
    }
  }

  async function login(email: string, password: string) {
    cargando.value = true
    try {
      const datos = await authService.iniciarSesion(email, password)
      if (datos.user) {
        const perfil = await authService.obtenerPerfil(datos.user.id)
        user.value = { id: datos.user.id, email: datos.user.email!, perfil }
      }
    } finally {
      cargando.value = false
    }
  }

  async function registro(email: string, password: string, nombre: string, telefono?: string) {
    cargando.value = true
    try {
      await authService.registrarUsuario(email, password, nombre, telefono)
    } finally {
      cargando.value = false
    }
  }

  async function logout() {
    await authService.cerrarSesion()
    user.value = null
  }

  function actualizarPerfil(perfil: Perfil) {
    if (user.value) {
      user.value = { ...user.value, perfil }
    }
  }

  // Escucha cambios de sesión en tiempo real
  supabase.auth.onAuthStateChange(async (event, sesion) => {
    if (event === 'SIGNED_IN' && sesion?.user) {
      try {
        const perfil = await authService.obtenerPerfil(sesion.user.id)
        user.value = { id: sesion.user.id, email: sesion.user.email!, perfil }
      } catch {
        user.value = null
      }
    } else if (event === 'SIGNED_OUT') {
      user.value = null
    }
  })

  return {
    user,
    cargando,
    inicializado,
    estaAutenticado,
    esAdmin,
    esCliente,
    inicializar,
    login,
    registro,
    logout,
    actualizarPerfil,
  }
})
