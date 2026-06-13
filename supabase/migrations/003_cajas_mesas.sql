-- ============================================================
-- Droguería Leal — Cajas y Mesas
-- ============================================================

-- ─────────────────────────────────────────────
-- TABLA: cajas
-- ─────────────────────────────────────────────
create table if not exists public.cajas (
  id         uuid        primary key default uuid_generate_v4(),
  nombre     text        not null,
  activo     boolean     not null default true,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- TABLA: mesas
-- ─────────────────────────────────────────────
create table if not exists public.mesas (
  id         uuid        primary key default uuid_generate_v4(),
  nombre     text        not null,
  activo     boolean     not null default true,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- Columnas en ordenes
-- ─────────────────────────────────────────────
alter table public.ordenes
  add column if not exists caja_id uuid references public.cajas(id) on delete set null,
  add column if not exists mesa_id uuid references public.mesas(id) on delete set null;

-- ─────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────
alter table public.cajas enable row level security;
alter table public.mesas enable row level security;

create policy "cajas_lectura_publica"
  on public.cajas for select
  using (activo = true or public.es_admin());

create policy "cajas_admin_insert"
  on public.cajas for insert
  with check (public.es_admin());

create policy "cajas_admin_update"
  on public.cajas for update
  using (public.es_admin());

create policy "cajas_admin_delete"
  on public.cajas for delete
  using (public.es_admin());

create policy "mesas_lectura_publica"
  on public.mesas for select
  using (activo = true or public.es_admin());

create policy "mesas_admin_insert"
  on public.mesas for insert
  with check (public.es_admin());

create policy "mesas_admin_update"
  on public.mesas for update
  using (public.es_admin());

create policy "mesas_admin_delete"
  on public.mesas for delete
  using (public.es_admin());
