import type { ItemOrden } from '../types/order.types'

const EDGE_FUNCTION_URL = import.meta.env.VITE_SUPABASE_URL
  ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`
  : null

interface ConfirmacionOrdenPayload {
  destinatario: string
  nombreCliente: string
  ordenId: string
  items: ItemOrden[]
  total: number
}

/**
 * Envía un correo de confirmación de orden via Edge Function.
 */
export async function enviarConfirmacionOrden(payload: ConfirmacionOrdenPayload): Promise<void> {
  if (!EDGE_FUNCTION_URL) throw new Error('URL de Supabase no configurada')

  const { supabase } = await import('../lib/supabase')
  const { data: { session } } = await supabase.auth.getSession()

  const respuesta = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.access_token ?? ''}`,
    },
    body: JSON.stringify({
      tipo: 'confirmacion_orden',
      ...payload,
    }),
  })

  if (!respuesta.ok) {
    const error = await respuesta.text()
    throw new Error(`Error al enviar correo: ${error}`)
  }
}
