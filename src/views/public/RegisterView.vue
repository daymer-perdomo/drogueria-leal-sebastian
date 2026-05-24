<script setup lang="ts">
import { useForm, useField } from 'vee-validate'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import { useValidation } from '../../composables/useValidation'
import { registroSchema } from '../../validators/auth.validator'
import AppInput from '../../components/ui/AppInput.vue'
import AppButton from '../../components/ui/AppButton.vue'
import AppCard from '../../components/ui/AppCard.vue'
import logoUrl from '../../assets/logo-2.png'

const router = useRouter()
const { registro, cargando, estaAutenticado } = useAuth()
const { validationSchema } = useValidation(registroSchema)

const { handleSubmit, errors } = useForm({ validationSchema })
const { value: nombre } = useField<string>('nombre')
const { value: email } = useField<string>('email')
const { value: telefono } = useField<string>('telefono')
const { value: password } = useField<string>('password')
const { value: confirmarPassword } = useField<string>('confirmarPassword')

const onSubmit = handleSubmit(async (values) => {
  const ok = await registro(values.email, values.password, values.nombre, values.telefono)
  if (ok) {
    router.push(estaAutenticado.value ? { name: 'home' } : { name: 'login' })
  }
})
</script>

<template>
  <main class="min-h-screen flex items-center justify-center p-4 bg-background">
    <div class="w-full max-w-sm">
      <div class="text-center mb-8">
        <img :src="logoUrl" alt="Droguería Leal" class="h-14 w-auto mx-auto" />
        <h1 class="text-2xl font-bold text-text-primary mt-4">Crear cuenta</h1>
      </div>

      <AppCard>
        <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
          <AppInput v-model="nombre" id="nombre" label="Nombre completo" placeholder="Juan Pérez" :error="errors.nombre" requerido />
          <AppInput v-model="email" id="email" label="Correo electrónico" tipo="email" placeholder="tu@correo.com" :error="errors.email" requerido />
          <AppInput v-model="telefono" id="telefono" label="Teléfono" tipo="tel" placeholder="+57 300 000 0000" :error="errors.telefono" />
          <AppInput v-model="password" id="password" label="Contraseña" tipo="password" placeholder="Mínimo 6 caracteres" :error="errors.password" requerido />
          <AppInput v-model="confirmarPassword" id="confirmarPassword" label="Confirmar contraseña" tipo="password" placeholder="Repite tu contraseña" :error="errors.confirmarPassword" requerido />

          <AppButton tipo="submit" bloque :cargando="cargando">
            Crear cuenta
          </AppButton>
        </form>

        <p class="text-center text-sm text-text-secondary mt-4">
          ¿Ya tienes cuenta?
          <RouterLink :to="{ name: 'login' }" class="text-brand-blue font-medium hover:underline">
            Inicia sesión
          </RouterLink>
        </p>
      </AppCard>
    </div>
  </main>
</template>
