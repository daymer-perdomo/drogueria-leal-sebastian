<script setup lang="ts">
import { useForm, useField } from 'vee-validate'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import { useValidation } from '../../composables/useValidation'
import { loginSchema } from '../../validators/auth.validator'
import AppInput from '../../components/ui/AppInput.vue'
import AppButton from '../../components/ui/AppButton.vue'
import AppCard from '../../components/ui/AppCard.vue'
import logoUrl from '../../assets/logo-2.png'

const router = useRouter()
const route = useRoute()
const { login, cargando, esAdmin } = useAuth()
const { validationSchema } = useValidation(loginSchema)

const { handleSubmit, errors } = useForm({ validationSchema })
const { value: email } = useField<string>('email')
const { value: password } = useField<string>('password')

const onSubmit = handleSubmit(async (values) => {
  const ok = await login(values.email, values.password)
  if (ok) {
    const redirect = route.query.redirect as string | undefined
    if (redirect) {
      router.push(redirect)
    } else {
      router.push(esAdmin.value ? { name: 'admin-dashboard' } : { name: 'home' })
    }
  }
})
</script>

<template>
  <main class="min-h-screen flex items-center justify-center p-4 bg-background">
    <div class="w-full max-w-sm">
      <div class="text-center mb-8">
        <img :src="logoUrl" alt="Droguería Leal Sebastián" class="h-14 w-auto mx-auto" />
        <h1 class="text-2xl font-bold text-text-primary mt-4">Iniciar sesión</h1>
      </div>

      <AppCard>
        <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
          <AppInput
            v-model="email"
            id="email"
            label="Correo electrónico"
            tipo="email"
            placeholder="tu@correo.com"
            :error="errors.email"
            requerido
          />
          <AppInput
            v-model="password"
            id="password"
            label="Contraseña"
            tipo="password"
            placeholder="••••••••"
            :error="errors.password"
            requerido
          />
          <AppButton tipo="submit" bloque :cargando="cargando">
            Entrar
          </AppButton>
        </form>

        <p class="text-center text-sm text-text-secondary mt-4">
          ¿No tienes cuenta?
          <RouterLink :to="{ name: 'registro' }" class="text-brand-blue font-medium hover:underline">
            Regístrate
          </RouterLink>
        </p>
      </AppCard>
    </div>
  </main>
</template>
