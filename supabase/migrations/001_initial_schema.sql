-- ============================================================
-- Droguería Leal Sebastián — Schema inicial
-- ============================================================

-- Extensiones
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────
-- TABLA: categorias
-- ─────────────────────────────────────────────
create table if not exists public.categorias (
  id            uuid          primary key default uuid_generate_v4(),
  nombre        text          not null,
  slug          text          not null unique,
  campos_schema jsonb         not null default '[]'::jsonb,
  created_at    timestamptz   not null default now()
);

comment on table public.categorias is 'Categorías de productos con schema dinámico de campos';

-- ─────────────────────────────────────────────
-- TABLA: productos
-- ─────────────────────────────────────────────
create table if not exists public.productos (
  id           uuid          primary key default uuid_generate_v4(),
  nombre       text          not null,
  descripcion  text          not null default '',
  precio       numeric(12,2) not null check (precio >= 0),
  stock        integer       not null default 0 check (stock >= 0),
  categoria_id uuid          references public.categorias(id) on delete set null,
  imagenes     text[]        not null default '{}',
  campos_extra jsonb         not null default '{}'::jsonb,
  activo       boolean       not null default true,
  created_at   timestamptz   not null default now()
);

comment on table public.productos is 'Catálogo de productos de la droguería';

create index if not exists idx_productos_categoria on public.productos(categoria_id);
create index if not exists idx_productos_activo    on public.productos(activo);

-- ─────────────────────────────────────────────
-- TABLA: noticias
-- ─────────────────────────────────────────────
create table if not exists public.noticias (
  id         uuid        primary key default uuid_generate_v4(),
  titulo     text        not null,
  contenido  text        not null,
  imagen_url text,
  publicado  boolean     not null default false,
  created_at timestamptz not null default now()
);

comment on table public.noticias is 'Noticias y artículos de salud publicados en la tienda';

-- ─────────────────────────────────────────────
-- TABLA: ordenes
-- ─────────────────────────────────────────────
create table if not exists public.ordenes (
  id         uuid          primary key default uuid_generate_v4(),
  user_id    uuid          not null references auth.users(id) on delete cascade,
  items      jsonb         not null,
  total      numeric(12,2) not null check (total >= 0),
  estado     text          not null default 'pendiente'
                           check (estado in ('pendiente','confirmado','enviado','entregado','cancelado')),
  created_at timestamptz   not null default now()
);

comment on table public.ordenes is 'Órdenes de compra realizadas por los clientes';

create index if not exists idx_ordenes_user    on public.ordenes(user_id);
create index if not exists idx_ordenes_estado  on public.ordenes(estado);

-- ─────────────────────────────────────────────
-- TABLA: perfiles
-- ─────────────────────────────────────────────
create table if not exists public.perfiles (
  id       uuid primary key references auth.users(id) on delete cascade,
  nombre   text not null,
  rol      text not null default 'cliente'
                check (rol in ('admin','cliente')),
  telefono text
);

comment on table public.perfiles is 'Perfiles extendidos de los usuarios de auth.users';

-- ─────────────────────────────────────────────
-- FUNCIÓN: crea perfil automáticamente al registro
-- ─────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.perfiles (id, nombre, rol)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nombre', split_part(new.email, '@', 1)),
    'cliente'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────
-- RLS — Activar en todas las tablas
-- ─────────────────────────────────────────────
alter table public.categorias enable row level security;
alter table public.productos   enable row level security;
alter table public.noticias    enable row level security;
alter table public.ordenes     enable row level security;
alter table public.perfiles    enable row level security;

-- Helper: comprueba rol del usuario actual
create or replace function public.es_admin()
returns boolean
language sql stable
security definer
as $$
  select exists (
    select 1 from public.perfiles
    where id = auth.uid() and rol = 'admin'
  )
$$;

-- ─────────────────────────────────────────────
-- POLÍTICAS: categorias
-- ─────────────────────────────────────────────
-- Lectura pública
create policy "categorias_lectura_publica"
  on public.categorias for select
  using (true);

-- Solo admin puede escribir
create policy "categorias_admin_insert"
  on public.categorias for insert
  with check (public.es_admin());

create policy "categorias_admin_update"
  on public.categorias for update
  using (public.es_admin());

create policy "categorias_admin_delete"
  on public.categorias for delete
  using (public.es_admin());

-- ─────────────────────────────────────────────
-- POLÍTICAS: productos
-- ─────────────────────────────────────────────
-- Anónimo y cliente ven solo productos activos
create policy "productos_lectura_activos"
  on public.productos for select
  using (activo = true or public.es_admin());

create policy "productos_admin_insert"
  on public.productos for insert
  with check (public.es_admin());

create policy "productos_admin_update"
  on public.productos for update
  using (public.es_admin());

create policy "productos_admin_delete"
  on public.productos for delete
  using (public.es_admin());

-- ─────────────────────────────────────────────
-- POLÍTICAS: noticias
-- ─────────────────────────────────────────────
-- Anónimo y cliente ven solo publicadas
create policy "noticias_lectura_publicadas"
  on public.noticias for select
  using (publicado = true or public.es_admin());

create policy "noticias_admin_insert"
  on public.noticias for insert
  with check (public.es_admin());

create policy "noticias_admin_update"
  on public.noticias for update
  using (public.es_admin());

create policy "noticias_admin_delete"
  on public.noticias for delete
  using (public.es_admin());

-- ─────────────────────────────────────────────
-- POLÍTICAS: ordenes
-- ─────────────────────────────────────────────
-- Cliente solo ve sus propias órdenes
create policy "ordenes_cliente_lectura_propia"
  on public.ordenes for select
  using (user_id = auth.uid() or public.es_admin());

create policy "ordenes_cliente_insert"
  on public.ordenes for insert
  with check (user_id = auth.uid());

-- Solo admin puede cambiar estado
create policy "ordenes_admin_update"
  on public.ordenes for update
  using (public.es_admin());

create policy "ordenes_admin_delete"
  on public.ordenes for delete
  using (public.es_admin());

-- ─────────────────────────────────────────────
-- POLÍTICAS: perfiles
-- ─────────────────────────────────────────────
-- Cada usuario ve y edita su propio perfil; admin ve todos
create policy "perfiles_lectura_propia"
  on public.perfiles for select
  using (id = auth.uid() or public.es_admin());

create policy "perfiles_insert"
  on public.perfiles for insert
  with check (id = auth.uid());

create policy "perfiles_update_propio"
  on public.perfiles for update
  using (id = auth.uid() or public.es_admin());

-- ─────────────────────────────────────────────
-- STORAGE: bucket product-images
-- ─────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Lectura pública
create policy "product_images_lectura_publica"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- Solo autenticados pueden subir imágenes (admin verificado a nivel app)
create policy "product_images_upload_autenticado"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and auth.role() = 'authenticated');

create policy "product_images_update_autenticado"
  on storage.objects for update
  using (bucket_id = 'product-images' and auth.role() = 'authenticated');

create policy "product_images_delete_autenticado"
  on storage.objects for delete
  using (bucket_id = 'product-images' and auth.role() = 'authenticated');

-- ─────────────────────────────────────────────
-- DATOS INICIALES: categorías
-- ─────────────────────────────────────────────
insert into public.categorias (id, nombre, slug, campos_schema) values
  ('11111111-0000-0000-0000-000000000001', 'Medicamento', 'medicamentos',
   '[{"nombre":"principioActivo","label":"Principio Activo","tipo":"text","requerido":true},{"nombre":"presentacion","label":"Presentación","tipo":"select","requerido":true,"opciones":["Tabletas","Cápsulas","Jarabe","Suspensión","Inyectable","Crema","Gel","Gotas"]},{"nombre":"laboratorio","label":"Laboratorio","tipo":"text","requerido":true},{"nombre":"requiereFormula","label":"Requiere Fórmula Médica","tipo":"boolean","requerido":false}]'::jsonb),
  ('11111111-0000-0000-0000-000000000002', 'Cuidado Personal', 'cuidado-personal',
   '[{"nombre":"marca","label":"Marca","tipo":"text","requerido":true},{"nombre":"tipoProducto","label":"Tipo de Producto","tipo":"select","requerido":true,"opciones":["Shampoo","Jabón","Crema Corporal","Protector Solar","Desodorante"]}]'::jsonb),
  ('11111111-0000-0000-0000-000000000003', 'Suplemento / Vitamina', 'suplementos',
   '[{"nombre":"componentes","label":"Componentes","tipo":"text","requerido":true},{"nombre":"marca","label":"Marca","tipo":"text","requerido":true},{"nombre":"forma","label":"Forma","tipo":"select","requerido":true,"opciones":["Tabletas","Cápsulas","Polvo","Líquido"]}]'::jsonb),
  ('11111111-0000-0000-0000-000000000004', 'Dispositivo Médico', 'dispositivos-medicos',
   '[{"nombre":"marca","label":"Marca","tipo":"text","requerido":true},{"nombre":"tipoDispositivo","label":"Tipo","tipo":"select","requerido":true,"opciones":["Termómetro","Tensiómetro","Glucómetro","Oxímetro","Nebulizador"]}]'::jsonb),
  ('11111111-0000-0000-0000-000000000005', 'Bebé y Maternidad', 'bebe-maternidad',
   '[{"nombre":"marca","label":"Marca","tipo":"text","requerido":true},{"nombre":"edadRecomendada","label":"Edad Recomendada","tipo":"select","requerido":true,"opciones":["0-3 meses","3-6 meses","6-12 meses","1-3 años","Maternidad"]}]'::jsonb)
on conflict (id) do nothing;
