<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import * as productsService from '../../services/products.service'
import * as ordersService from '../../services/orders.service'
import type { Orden, EstadoOrden } from '../../types/order.types'
import AppBadge from '../../components/ui/AppBadge.vue'
import {
  IconPackage, IconShoppingBag, IconNews, IconArrowRight,
  IconCurrencyDollar, IconClockHour4, IconCircleCheck, IconTruck,
} from '@tabler/icons-vue'

// ── Data ────────────────────────────────────────────────────────────────────
const ordenes    = ref<Orden[]>([])
const totalProds = ref(0)
const cargando   = ref(false)

onMounted(async () => {
  cargando.value = true
  try {
    const [prods, ords] = await Promise.all([
      productsService.contarProductos({ soloActivos: false }),
      ordersService.listarTodasLasOrdenes(1, 500),
    ])
    totalProds.value = prods
    ordenes.value    = ords
  } finally {
    cargando.value = false
  }
})

// ── KPIs ────────────────────────────────────────────────────────────────────
const totalIngresos = computed(() => ordenes.value.reduce((s, o) => s + o.total, 0))
const totalPedidos  = computed(() => ordenes.value.length)
const pendientes    = computed(() => ordenes.value.filter(o => o.estado === 'pendiente').length)
const entregados    = computed(() => ordenes.value.filter(o => o.estado === 'entregado').length)

function fmtPrecio(n: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)
}

// ── Donut por estado ─────────────────────────────────────────────────────────
const ESTADOS: { key: EstadoOrden; label: string; variante: 'warning'|'info'|'success'|'error'|'default'; color: string }[] = [
  { key: 'pendiente',  label: 'Pendiente',  variante: 'warning', color: '#d97706' },
  { key: 'confirmado', label: 'Confirmado', variante: 'info',    color: '#0F4FA8' },
  { key: 'enviado',    label: 'Enviado',    variante: 'default', color: '#13A8B8' },
  { key: 'entregado',  label: 'Entregado',  variante: 'success', color: '#7CC244' },
  { key: 'cancelado',  label: 'Cancelado',  variante: 'error',   color: '#dc2626' },
]

const conteoEstados = computed(() =>
  ESTADOS.map(e => ({ ...e, count: ordenes.value.filter(o => o.estado === e.key).length }))
         .filter(e => e.count > 0)
)

const donutSegments = computed(() => {
  const total = conteoEstados.value.reduce((s, e) => s + e.count, 0)
  if (total === 0) return []
  const R = 58, circ = 2 * Math.PI * R
  let offset = 0
  return conteoEstados.value.map(e => {
    const dash = (e.count / total) * circ
    const seg  = { ...e, dash, gap: circ - dash, offset: circ - offset }
    offset += dash
    return seg
  })
})

// ── Barras diarias ───────────────────────────────────────────────────────────
const dias7 = computed(() => {
  const hoy = new Date()
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(hoy); d.setDate(hoy.getDate() - (6 - i))
    const key   = d.toISOString().slice(0, 10)
    const label = d.toLocaleDateString('es-CO', { weekday: 'short' })
    const count = ordenes.value.filter(o => (o.created_at ?? '').slice(0, 10) === key).length
    return { key, label, count }
  })
})
const maxDia = computed(() => Math.max(...dias7.value.map(d => d.count), 1))

// ── Top productos ────────────────────────────────────────────────────────────
const topProductos = computed(() => {
  const mapa: Record<string, { nombre: string; total: number }> = {}
  for (const o of ordenes.value)
    for (const item of o.items) {
      if (!mapa[item.nombre]) mapa[item.nombre] = { nombre: item.nombre, total: 0 }
      ;(mapa[item.nombre] as { nombre: string; total: number }).total += item.cantidad
    }
  return Object.values(mapa).sort((a, b) => b.total - a.total).slice(0, 5)
})
const maxTop = computed(() => Math.max(...topProductos.value.map(p => p.total), 1))

// ── Sparkline ingresos ───────────────────────────────────────────────────────
const ingresos7 = computed(() => {
  const hoy = new Date()
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(hoy); d.setDate(hoy.getDate() - (6 - i))
    const key   = d.toISOString().slice(0, 10)
    const label = `${d.getDate()}/${d.getMonth() + 1}`
    const value = ordenes.value
      .filter(o => (o.created_at ?? '').slice(0, 10) === key)
      .reduce((s, o) => s + o.total, 0)
    return { label, value }
  })
})
const maxIngreso = computed(() => Math.max(...ingresos7.value.map(d => d.value), 1))

function fmtCompacto(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `$${Math.round(n / 1_000)}K`
  return `$${n}`
}

const tendencia = computed(() => {
  const vals = ingresos7.value.map(d => d.value)
  const primera = vals.slice(0, 3).reduce((s, v) => s + v, 0)
  const ultima  = vals.slice(4).reduce((s, v) => s + v, 0)
  if (primera === 0 && ultima === 0) return null
  if (primera === 0) return { pct: 100, positivo: true }
  const pct = Math.round(((ultima - primera) / primera) * 100)
  return { pct, positivo: pct >= 0 }
})

const sparkPath = computed(() => {
  const pts  = ingresos7.value
  const n    = pts.length
  const VW   = 340, VH = 96
  const pL   = 50, pR = 10, pT = 8, pB = 20
  const cW   = VW - pL - pR
  const cH   = VH - pT - pB
  const maxV = maxIngreso.value
  const botY = pT + cH

  const xs = pts.map((_, i) => pL + (n > 1 ? i / (n - 1) : 0.5) * cW)
  const ys = pts.map(p  => pT + cH - (p.value / maxV) * cH)

  // Curva suave Catmull-Rom → Cubic Bezier
  let line = `M${xs[0]!.toFixed(1)},${ys[0]!.toFixed(1)}`
  for (let i = 1; i < n; i++) {
    const x0 = xs[i - 2] ?? xs[i - 1]!, y0 = ys[i - 2] ?? ys[i - 1]!
    const x1 = xs[i - 1]!,              y1 = ys[i - 1]!
    const x2 = xs[i]!,                  y2 = ys[i]!
    const x3 = xs[i + 1] ?? x2,         y3 = ys[i + 1] ?? y2
    const cp1x = x1 + (x2 - x0) / 6,   cp1y = y1 + (y2 - y0) / 6
    const cp2x = x2 - (x3 - x1) / 6,   cp2y = y2 - (y3 - y1) / 6
    line += ` C${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`
  }

  const area = `${line} L${xs[n-1]!.toFixed(1)},${botY} L${xs[0]!.toFixed(1)},${botY} Z`

  const gridLines = [0, 0.5, 1].map(pct => ({
    y:     pT + (1 - pct) * cH,
    label: fmtCompacto(pct * maxV),
  }))

  return {
    line, area, gridLines,
    lastPt: { x: xs[n - 1] ?? pL, y: ys[n - 1] ?? botY },
    xLabels: pts.map((p, i) => ({ x: xs[i]!, label: p.label, y: botY + 12 })),
    botY, pL,
  }
})
</script>

<template>
  <div class="flex flex-col gap-5">

    <!-- ── Cabecera con gradiente de marca ── -->
    <div class="brand-header">
      <div>
        <h1 class="text-xl font-bold text-white">Dashboard</h1>
        <p class="text-sm mt-0.5" style="color: rgba(255,255,255,0.72)">Droguería Leal Sebastián — resumen operacional</p>
      </div>
      <RouterLink :to="{ name: 'admin-ordenes' }" class="header-btn">
        Ver órdenes <IconArrowRight class="w-3.5 h-3.5" />
      </RouterLink>
    </div>

    <!-- ── KPI Cards ── -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">

      <div class="card p-5 flex flex-col gap-3">
        <div class="kpi-icon-wrap" style="background: var(--color-primary-light)">
          <IconCurrencyDollar class="w-5 h-5" style="color: var(--color-brand-green-dark)" />
        </div>
        <div>
          <p class="kpi-label">Ingresos totales</p>
          <p class="kpi-val">{{ cargando ? '…' : fmtPrecio(totalIngresos) }}</p>
        </div>
      </div>

      <div class="card p-5 flex flex-col gap-3">
        <div class="kpi-icon-wrap" style="background: #e0f0ff">
          <IconShoppingBag class="w-5 h-5" style="color: var(--color-brand-blue)" />
        </div>
        <div>
          <p class="kpi-label">Total pedidos</p>
          <p class="kpi-val">{{ cargando ? '…' : totalPedidos }}</p>
        </div>
      </div>

      <div class="card p-5 flex flex-col gap-3">
        <div class="kpi-icon-wrap" style="background: var(--color-warning-bg)">
          <IconClockHour4 class="w-5 h-5" style="color: var(--color-warning)" />
        </div>
        <div>
          <p class="kpi-label">Pendientes</p>
          <p class="kpi-val">{{ cargando ? '…' : pendientes }}</p>
        </div>
      </div>

      <div class="card p-5 flex flex-col gap-3">
        <div class="kpi-icon-wrap" style="background: var(--color-success-bg)">
          <IconCircleCheck class="w-5 h-5" style="color: var(--color-success)" />
        </div>
        <div>
          <p class="kpi-label">Entregados</p>
          <p class="kpi-val">{{ cargando ? '…' : entregados }}</p>
        </div>
      </div>

    </div>

    <!-- ── Fila 2: Donut + Barras ── -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

      <!-- Donut estado -->
      <div class="card p-5">
        <p class="section-title">Pedidos por estado</p>
        <div v-if="cargando" class="shimmer h-40 rounded-lg" />
        <div v-else-if="conteoEstados.length === 0" class="empty-state">Sin pedidos registrados</div>
        <div v-else class="flex items-center justify-center gap-8 flex-wrap mt-2">
          <svg width="144" height="144" viewBox="0 0 144 144" class="shrink-0">
            <circle cx="72" cy="72" r="58" fill="none" stroke="var(--color-surface-muted)" stroke-width="16" />
            <circle
              v-for="seg in donutSegments" :key="seg.key"
              cx="72" cy="72" r="58" fill="none"
              :stroke="seg.color" stroke-width="16" stroke-linecap="butt"
              :stroke-dasharray="`${seg.dash - 1.5} ${seg.gap + 1.5}`"
              :stroke-dashoffset="seg.offset"
              style="transition: all 0.7s cubic-bezier(.22,1,.36,1)"
            />
            <text x="72" y="67" text-anchor="middle" font-size="26" font-weight="700" fill="var(--color-text-primary)">{{ totalPedidos }}</text>
            <text x="72" y="84" text-anchor="middle" font-size="10" fill="var(--color-text-muted)">pedidos</text>
          </svg>
          <ul class="flex flex-col gap-2.5">
            <li v-for="seg in donutSegments" :key="seg.key" class="flex items-center gap-2.5 text-sm">
              <span class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ background: seg.color }" />
              <span style="color: var(--color-text-secondary)">{{ seg.label }}</span>
              <AppBadge :variante="seg.variante" class="ml-auto">{{ seg.count }}</AppBadge>
            </li>
          </ul>
        </div>
      </div>

      <!-- Barras pedidos 7 días -->
      <div class="card p-5">
        <p class="section-title">Pedidos — últimos 7 días</p>
        <div v-if="cargando" class="shimmer h-40 rounded-lg" />
        <div v-else class="flex items-end gap-1.5 mt-2" style="height:128px">
          <div v-for="d in dias7" :key="d.key" class="flex-1 flex flex-col items-center gap-1">
            <span
              class="text-xs font-bold transition-opacity"
              style="color: var(--color-brand-green-dark)"
              :style="{ opacity: d.count > 0 ? 1 : 0 }"
            >{{ d.count }}</span>
            <div class="w-full rounded-t-md" style="background: var(--color-surface-muted); height: 88px; position: relative; overflow: hidden">
              <div
                class="bar-fill absolute bottom-0 left-0 right-0 rounded-t-md"
                :style="{
                  height: `${(d.count / maxDia) * 100}%`,
                  background: d.count > 0 ? 'var(--gradient-brand)' : 'transparent'
                }"
              />
            </div>
            <span class="text-center leading-none" style="font-size:10px; color: var(--color-text-muted)">{{ d.label }}</span>
          </div>
        </div>
      </div>

    </div>

    <!-- ── Fila 3: Top productos + Sparkline ── -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

      <!-- Top productos -->
      <div class="card p-5">
        <p class="section-title">Productos más pedidos</p>
        <div v-if="cargando" class="shimmer h-40 rounded-lg" />
        <div v-else-if="topProductos.length === 0" class="empty-state">Sin datos aún</div>
        <ul v-else class="flex flex-col gap-3.5 mt-2">
          <li v-for="(p, i) in topProductos" :key="p.nombre">
            <div class="flex items-center gap-2 mb-1.5">
              <span class="rank" :class="['rank', i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : 'rank-n']">{{ i + 1 }}</span>
              <span class="flex-1 text-sm font-medium truncate" style="color: var(--color-text-primary)">{{ p.nombre }}</span>
              <span class="text-xs font-semibold shrink-0 pl-2" style="color: var(--color-text-muted)">{{ p.total }} ud.</span>
            </div>
            <div class="h-1.5 rounded-full" style="background: var(--color-surface-muted)">
              <div
                class="h-full rounded-full top-bar-fill"
                :style="{
                  width: `${(p.total / maxTop) * 100}%`,
                  background: i === 0
                    ? 'var(--gradient-brand)'
                    : i === 1
                    ? 'linear-gradient(to right, var(--color-brand-blue), var(--color-brand-turquoise))'
                    : 'linear-gradient(to right, var(--color-brand-turquoise), var(--color-brand-green))'
                }"
              />
            </div>
          </li>
        </ul>
      </div>

      <!-- Sparkline ingresos -->
      <div class="card p-5">
        <!-- Cabecera: título + total + tendencia en una sola fila -->
        <div class="flex items-center justify-between gap-2 mb-3">
          <p class="section-title">Ingresos — últimos 7 días</p>
          <div class="flex items-center gap-2">
            <span class="text-base font-bold leading-none" style="color: var(--color-text-primary)">
              {{ fmtPrecio(ingresos7.reduce((s, d) => s + d.value, 0)) }}
            </span>
            <span
              v-if="tendencia"
              class="trend-badge"
              :class="tendencia.positivo ? 'trend-up' : 'trend-down'"
            >
              {{ tendencia.positivo ? '▲' : '▼' }} {{ Math.abs(tendencia.pct) }}%
            </span>
          </div>
        </div>

        <div v-if="cargando" class="shimmer h-28 rounded-lg" />
        <div v-else>
          <!-- Área del gráfico -->
          <svg
            width="100%"
            viewBox="0 0 340 96"
            preserveAspectRatio="xMidYMid meet"
            style="display:block; overflow:visible"
          >
            <defs>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%"   stop-color="#0F4FA8" />
                <stop offset="50%"  stop-color="#13A8B8" />
                <stop offset="100%" stop-color="#7CC244" />
              </linearGradient>
              <linearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stop-color="#0F4FA8" stop-opacity="0.10" />
                <stop offset="80%"  stop-color="#7CC244" stop-opacity="0.03" />
                <stop offset="100%" stop-color="#7CC244" stop-opacity="0" />
              </linearGradient>
              <clipPath id="chartClip">
                <rect :x="sparkPath.pL" y="0" width="280" :height="sparkPath.botY + 2" />
              </clipPath>
            </defs>

            <!-- Líneas de grilla horizontales -->
            <line
              v-for="gl in sparkPath.gridLines" :key="gl.y"
              :x1="sparkPath.pL" :y1="gl.y" x2="330" :y2="gl.y"
              stroke="var(--color-border)" stroke-width="0.75" stroke-dasharray="4 3"
            />

            <!-- Etiquetas eje Y -->
            <text
              v-for="gl in sparkPath.gridLines" :key="`lbl-${gl.y}`"
              :x="sparkPath.pL - 6" :y="gl.y + 4"
              text-anchor="end" font-size="9"
              fill="var(--color-text-muted)"
              style="font-family: var(--font-mono)"
            >{{ gl.label }}</text>

            <!-- Área de relleno -->
            <path :d="sparkPath.area" fill="url(#fillGrad)" clip-path="url(#chartClip)" />

            <!-- Línea principal -->
            <path
              :d="sparkPath.line"
              fill="none"
              stroke="url(#lineGrad)"
              stroke-width="1.75"
              stroke-linejoin="round"
              stroke-linecap="round"
            />

            <!-- Etiquetas eje X -->
            <text
              v-for="xl in sparkPath.xLabels" :key="xl.label"
              :x="xl.x" :y="xl.y"
              text-anchor="middle" font-size="9"
              fill="var(--color-text-muted)"
            >{{ xl.label }}</text>

            <!-- Punto final animado -->
            <circle
              :cx="sparkPath.lastPt.x" :cy="sparkPath.lastPt.y" r="6"
              fill="#0F4FA8" fill-opacity="0.10"
            >
              <animate attributeName="r" values="4;11;4" dur="2.2s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1" />
              <animate attributeName="fill-opacity" values="0.12;0.02;0.12" dur="2.2s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1" />
            </circle>
            <circle
              :cx="sparkPath.lastPt.x" :cy="sparkPath.lastPt.y" r="4"
              fill="var(--color-surface)" stroke="url(#lineGrad)" stroke-width="2"
            />
          </svg>
        </div>
      </div>

    </div>

    <!-- ── Accesos rápidos ── -->
    <div class="card p-5">
      <p class="section-title">Accesos rápidos</p>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
        <RouterLink
          v-for="link in [
            { name: 'admin-productos', label: 'Gestionar productos', icon: IconPackage },
            { name: 'admin-ordenes',   label: 'Ver órdenes',          icon: IconShoppingBag },
            { name: 'admin-noticias',  label: 'Publicar noticias',    icon: IconNews },
          ]"
          :key="link.name"
          :to="{ name: link.name }"
          class="quick-link"
        >
          <component :is="link.icon" class="w-4 h-4 shrink-0" />
          <span class="flex-1">{{ link.label }}</span>
          <IconArrowRight class="w-3.5 h-3.5 shrink-0 opacity-40" />
        </RouterLink>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* ── Header ── */
.brand-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  border-radius: var(--radius-lg);
  background: var(--gradient-brand);
  box-shadow: 0 4px 16px rgba(15, 79, 168, 0.22);
}
.header-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.4rem 1rem;
  background: rgba(255,255,255,0.18);
  border: 1px solid rgba(255,255,255,0.35);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: #fff;
  text-decoration: none;
  transition: background var(--transition-fast);
}
.header-btn:hover { background: rgba(255,255,255,0.28); }

/* ── KPI ── */
.kpi-icon-wrap {
  width: 2.5rem; height: 2.5rem;
  border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
}
.kpi-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  font-weight: var(--font-weight-medium);
  margin-bottom: 0.125rem;
}
.kpi-val {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  line-height: var(--line-height-tight);
}

/* ── Sección ── */
.section-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* ── Shimmer ── */
.shimmer {
  background: linear-gradient(90deg, var(--color-surface-muted) 25%, var(--color-border) 50%, var(--color-surface-muted) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}
@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

/* ── Empty ── */
.empty-state {
  height: 7rem;
  display: flex; align-items: center; justify-content: center;
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

/* ── Tendencia ── */
.trend-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  padding: 0.15rem 0.55rem;
  border-radius: var(--radius-full);
  font-size: 0.7rem;
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.03em;
}
.trend-up   { background: var(--color-success-bg); color: var(--color-success); }
.trend-down { background: var(--color-error-bg);   color: var(--color-error); }

/* ── Barras diarias ── */
.bar-fill { transition: height 0.55s cubic-bezier(.22,1,.36,1); }

/* ── Top productos ── */
.top-bar-fill { transition: width 0.65s cubic-bezier(.22,1,.36,1); }

.rank {
  width: 1.375rem; height: 1.375rem;
  border-radius: var(--radius-full);
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 0.65rem; font-weight: var(--font-weight-bold);
  flex-shrink: 0;
}
.rank-1 { background: var(--color-warning-bg); color: var(--color-warning); }
.rank-2 { background: var(--color-surface-muted); color: var(--color-text-secondary); }
.rank-3 { background: var(--color-accent-light); color: var(--color-accent); }
.rank-n { background: var(--color-surface-subtle); color: var(--color-text-muted); }

/* ── Accesos rápidos ── */
.quick-link {
  display: flex; align-items: center; gap: 0.625rem;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: background var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast);
}
.quick-link:hover {
  background: var(--color-primary-light);
  border-color: var(--color-brand-green);
  color: var(--color-brand-green-dark);
}
</style>
