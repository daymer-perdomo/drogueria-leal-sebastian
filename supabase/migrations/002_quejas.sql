-- ─────────────────────────────────────────────
-- TABLA: quejas
-- ─────────────────────────────────────────────
create table if not exists public.quejas (
  id         uuid        primary key default uuid_generate_v4(),
  user_id    uuid        references auth.users(id) on delete set null,
  nombre     text        not null,
  email      text        not null,
  asunto     text        not null,
  mensaje    text        not null,
  estado     text        not null default 'nueva'
             check (estado in ('nueva', 'en_proceso', 'resuelta')),
  respuesta  text,
  created_at timestamptz not null default now()
);

comment on table public.quejas is 'Quejas y solicitudes de los clientes';

create index if not exists idx_quejas_estado on public.quejas(estado);
create index if not exists idx_quejas_user   on public.quejas(user_id);

alter table public.quejas enable row level security;

-- Cualquiera puede enviar una queja (incluso sin cuenta)
create policy "quejas_insert_publico"
  on public.quejas for insert
  with check (true);

-- Usuario autenticado ve sus propias quejas; admin ve todas
create policy "quejas_select"
  on public.quejas for select
  using (
    (user_id is not null and user_id = auth.uid())
    or public.es_admin()
  );

-- Solo admin puede responder y cambiar estado
create policy "quejas_admin_update"
  on public.quejas for update
  using (public.es_admin());

create policy "quejas_admin_delete"
  on public.quejas for delete
  using (public.es_admin());
