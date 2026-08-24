-- RAIZEY STORE — Catalog V2
-- Additive migration only
-- Category → Subcategory → Product → Variant → optional Suboption
-- Existing games and legacy product relation are retained for rollback compatibility

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text check (description is null or char_length(description) <= 1200),
  image_url text check (image_url is null or char_length(image_url) <= 1000),
  status public.product_status not null default 'active',
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.subcategories (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete restrict,
  name text not null check (char_length(trim(name)) between 2 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text check (description is null or char_length(description) <= 1200),
  image_url text check (image_url is null or char_length(image_url) <= 1000),
  status public.product_status not null default 'active',
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (category_id, name)
);

alter table public.products
  alter column game_id drop not null,
  add column subcategory_id uuid references public.subcategories(id) on delete restrict,
  add column image_url text check (image_url is null or char_length(image_url) <= 1000),
  add column suboptions_required boolean not null default false;

alter table public.products
  add constraint products_catalog_parent_check
  check (game_id is not null or subcategory_id is not null);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete restrict,
  name text not null check (char_length(trim(name)) between 1 and 120),
  sku text unique check (sku is null or char_length(sku) <= 80),
  price_usd numeric(14,4) not null check (price_usd >= 0),
  status public.product_status not null default 'active',
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, name)
);

create table public.product_suboptions (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.product_variants(id) on delete restrict,
  name text not null check (char_length(trim(name)) between 1 and 120),
  price_usd numeric(14,4) not null check (price_usd >= 0),
  status public.product_status not null default 'active',
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (variant_id, name)
);

create table public.product_input_fields (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete restrict,
  field_key text not null check (field_key ~ '^[a-z][a-z0-9_]{0,39}$'),
  label text not null check (char_length(trim(label)) between 1 and 80),
  input_type text not null default 'text' check (input_type in ('text','number','email','tel')),
  placeholder text check (placeholder is null or char_length(placeholder) <= 120),
  is_required boolean not null default false,
  min_length integer check (min_length is null or min_length >= 0),
  max_length integer check (max_length is null or max_length between 1 and 500),
  status public.product_status not null default 'active',
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, field_key),
  check (min_length is null or max_length is null or min_length <= max_length)
);

create table public.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) between 2 and 120),
  subtitle text check (subtitle is null or char_length(subtitle) <= 240),
  image_url text check (image_url is null or char_length(image_url) <= 1000),
  mobile_image_url text check (mobile_image_url is null or char_length(mobile_image_url) <= 1000),
  link_url text check (link_url is null or char_length(link_url) <= 1000),
  status public.product_status not null default 'active',
  sort_order integer not null default 0 check (sort_order >= 0),
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (starts_at is null or ends_at is null or starts_at < ends_at)
);

alter table public.order_items
  add column variant_id uuid references public.product_variants(id) on delete restrict,
  add column suboption_id uuid references public.product_suboptions(id) on delete restrict,
  add column variant_name text,
  add column suboption_name text,
  add column customer_inputs jsonb not null default '{}'::jsonb check (jsonb_typeof(customer_inputs) = 'object');

create index categories_status_sort_idx on public.categories (status, sort_order, name);
create index subcategories_category_status_sort_idx on public.subcategories (category_id, status, sort_order, name);
create index products_subcategory_status_sort_idx on public.products (subcategory_id, status, sort_order, name) where subcategory_id is not null;
create index product_variants_product_status_sort_idx on public.product_variants (product_id, status, sort_order, name);
create index product_suboptions_variant_status_sort_idx on public.product_suboptions (variant_id, status, sort_order, name);
create index product_input_fields_product_status_sort_idx on public.product_input_fields (product_id, status, sort_order, field_key);
create index banners_status_sort_idx on public.banners (status, sort_order);
create index banners_schedule_idx on public.banners (starts_at, ends_at) where status = 'active';
create index order_items_variant_id_idx on public.order_items (variant_id) where variant_id is not null;
create index order_items_suboption_id_idx on public.order_items (suboption_id) where suboption_id is not null;

create trigger categories_set_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

create trigger subcategories_set_updated_at
before update on public.subcategories
for each row execute function public.set_updated_at();

create trigger product_variants_set_updated_at
before update on public.product_variants
for each row execute function public.set_updated_at();

create trigger product_suboptions_set_updated_at
before update on public.product_suboptions
for each row execute function public.set_updated_at();

create trigger product_input_fields_set_updated_at
before update on public.product_input_fields
for each row execute function public.set_updated_at();

create trigger banners_set_updated_at
before update on public.banners
for each row execute function public.set_updated_at();

alter table public.categories enable row level security;
alter table public.subcategories enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_suboptions enable row level security;
alter table public.product_input_fields enable row level security;
alter table public.banners enable row level security;

revoke all on table public.categories from anon, authenticated;
revoke all on table public.subcategories from anon, authenticated;
revoke all on table public.product_variants from anon, authenticated;
revoke all on table public.product_suboptions from anon, authenticated;
revoke all on table public.product_input_fields from anon, authenticated;
revoke all on table public.banners from anon, authenticated;

grant select on table public.categories to anon, authenticated;
grant select on table public.subcategories to anon, authenticated;
grant select on table public.product_variants to anon, authenticated;
grant select on table public.product_suboptions to anon, authenticated;
grant select on table public.product_input_fields to anon, authenticated;
grant select on table public.banners to anon, authenticated;

create policy categories_public_read_active
on public.categories for select
to anon, authenticated
using (status = 'active'::public.product_status);

create policy subcategories_public_read_active
on public.subcategories for select
to anon, authenticated
using (
  status = 'active'::public.product_status
  and exists (
    select 1 from public.categories c
    where c.id = subcategories.category_id
      and c.status = 'active'::public.product_status
  )
);

create policy product_variants_public_read_active
on public.product_variants for select
to anon, authenticated
using (
  status = 'active'::public.product_status
  and exists (
    select 1
    from public.products p
    join public.subcategories s on s.id = p.subcategory_id
    join public.categories c on c.id = s.category_id
    where p.id = product_variants.product_id
      and p.status = 'active'::public.product_status
      and s.status = 'active'::public.product_status
      and c.status = 'active'::public.product_status
  )
);

create policy product_suboptions_public_read_active
on public.product_suboptions for select
to anon, authenticated
using (
  status = 'active'::public.product_status
  and exists (
    select 1 from public.product_variants v
    where v.id = product_suboptions.variant_id
      and v.status = 'active'::public.product_status
  )
);

create policy product_input_fields_public_read_active
on public.product_input_fields for select
to anon, authenticated
using (
  status = 'active'::public.product_status
  and exists (
    select 1 from public.products p
    where p.id = product_input_fields.product_id
      and p.status = 'active'::public.product_status
  )
);

create policy banners_public_read_active
on public.banners for select
to anon, authenticated
using (
  status = 'active'::public.product_status
  and (starts_at is null or starts_at <= now())
  and (ends_at is null or ends_at > now())
);

comment on table public.categories is 'Catalog V2 top-level visual sections displayed as homepage headings/containers';
comment on table public.subcategories is 'Catalog V2 cards that belong to one category and open a single product-selection page';
comment on table public.product_variants is 'Final selectable product choices such as 60, 325 or 660 with absolute USD prices';
comment on table public.product_suboptions is 'Optional conditional child choices; when selected their absolute price overrides the variant price';
comment on column public.products.suboptions_required is 'When true checkout must require a valid suboption for the selected variant';
comment on table public.product_input_fields is 'Admin-configurable customer data fields required by a product';

notify pgrst, 'reload schema';
