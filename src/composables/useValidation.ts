import { toTypedSchema } from '@vee-validate/zod'
import type { ZodSchema } from 'zod'

/**
 * Convierte un schema Zod al formato que acepta VeeValidate.
 */
export function useValidation<T extends ZodSchema>(schema: T) {
  return {
    validationSchema: toTypedSchema(schema),
  }
}
