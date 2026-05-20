import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') ?? 'noreply@drogueria.com'

interface ConfirmacionOrdenPayload {
  tipo: 'confirmacion_orden'
  destinatario: string
  nombreCliente: string
  ordenId: string
  items: Array<{ nombre: string; cantidad: number; precio: number }>
  total: number
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, content-type',
      },
    })
  }

  try {
    const payload = (await req.json()) as ConfirmacionOrdenPayload

    if (payload.tipo !== 'confirmacion_orden') {
      return new Response(JSON.stringify({ error: 'Tipo no soportado' }), { status: 400 })
    }

    const itemsHtml = payload.items
      .map((item) => `<tr><td>${item.nombre}</td><td>${item.cantidad}</td><td>$${item.precio.toLocaleString('es-CO')}</td></tr>`)
      .join('')

    const html = `
      <h2>¡Gracias por tu pedido, ${payload.nombreCliente}!</h2>
      <p>Tu pedido <strong>#${payload.ordenId.slice(0, 8).toUpperCase()}</strong> ha sido recibido.</p>
      <table border="1" cellpadding="8">
        <thead><tr><th>Producto</th><th>Cantidad</th><th>Precio</th></tr></thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <p><strong>Total: $${payload.total.toLocaleString('es-CO')}</strong></p>
      <p>Droguería Leal Sebastián</p>
    `

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [payload.destinatario],
        subject: `Confirmación de pedido #${payload.ordenId.slice(0, 8).toUpperCase()} — Droguería Leal Sebastián`,
        html,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      return new Response(JSON.stringify({ error: err }), { status: 500 })
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
