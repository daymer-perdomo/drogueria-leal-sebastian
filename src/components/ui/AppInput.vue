<script setup lang="ts">
defineProps<{
  modelValue?: string | number
  label?: string
  placeholder?: string
  tipo?: string
  error?: string
  ayuda?: string
  disabled?: boolean
  requerido?: boolean
  id?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="flex flex-col gap-1">
    <label
      v-if="label"
      :for="id"
      class="text-sm font-medium text-text-primary"
    >
      {{ label }}
      <span v-if="requerido" class="text-error ml-0.5">*</span>
    </label>

    <input
      :id="id"
      :type="tipo ?? 'text'"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="requerido"
      :class="[
        'input-base',
        error ? 'border-error focus:ring-red-200' : '',
        disabled ? 'opacity-50 cursor-not-allowed bg-surface-muted' : '',
      ]"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />

    <p v-if="error" class="text-xs text-error">{{ error }}</p>
    <p v-else-if="ayuda" class="text-xs text-text-muted">{{ ayuda }}</p>
  </div>
</template>
