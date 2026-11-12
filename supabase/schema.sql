create extension if not exists pgcrypto;

create type public.catalog_status as enum ('draft', 'active', 'archived');
create type public.creator_role as enum ('author', 'translator', 'illustrator');
create type public.taxonomy_kind as enum ('category', 'topic', 'genre', 'format', 'line', 'publisher', 'imprint', 'language');

create table public.taxonomy_terms (
  id uuid primary key default gen_random_uuid(),
  kind public.taxonomy_kind not null,
  name text not null,
  slug text not null,
  parent_id uuid references public.taxonomy_terms(id) on delete restrict,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (kind, slug)
);

create table public.creators (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  slug text not null unique,
  bio_html text,
  gender text,
  birth_year integer,
  death_year integer,
  awards text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.creator_roles (
  creator_id uuid not null references public.creators(id) on delete cascade,
  role public.creator_role not null,
  primary key (creator_id, role)
);

create table public.creator_images (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.creators(id) on delete cascade,
  storage_path text not null,
  alt_text text,
  sort_order integer not null default 0,
  is_primary boolean not null default false
);

create table public.books (
  id uuid primary key default gen_random_uuid(),
  isbn text unique,
  title text not null,
  slug text not null unique,
  path text not null unique,
  description_html text,
  cover_price_usd numeric(12,2),
  sale_price_vnd numeric(12,0) not null default 0,
  compare_price_vnd numeric(12,0),
  page_count integer,
  book_size text,
  publication_date date,
  weight text,
  cover_storage_path text,
  status public.catalog_status not null default 'draft',
  is_visible_website boolean not null default false,
  inventory_quantity integer not null default 0,
  reserved_inventory_quantity integer not null default 0,
  seo_title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (page_count is null or page_count >= 0),
  check (isbn is null or isbn ~ '^[0-9]{13}$'),
  check (inventory_quantity >= 0),
  check (reserved_inventory_quantity >= 0),
  check (reserved_inventory_quantity <= inventory_quantity)
);

create table public.book_images (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  storage_path text not null,
  alt_text text,
  sort_order integer not null default 0,
  is_primary boolean not null default false
);

create table public.book_creators (
  book_id uuid not null references public.books(id) on delete cascade,
  creator_id uuid not null references public.creators(id) on delete restrict,
  role public.creator_role not null,
  sort_order integer not null default 0,
  primary key (book_id, creator_id, role)
);

create table public.book_taxonomy_terms (
  book_id uuid not null references public.books(id) on delete cascade,
  term_id uuid not null references public.taxonomy_terms(id) on delete restrict,
  primary key (book_id, term_id)
);

create table public.homepage_modules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sort_order integer not null default 0,
  is_active boolean not null default true
);

create table public.book_homepage_modules (
  book_id uuid not null references public.books(id) on delete cascade,
  module_id uuid not null references public.homepage_modules(id) on delete cascade,
  sort_order integer not null default 0,
  primary key (book_id, module_id)
);

create index taxonomy_terms_kind_parent_idx on public.taxonomy_terms(kind, parent_id, sort_order);
create index books_status_visible_idx on public.books(status, is_visible_website);
create index book_creators_creator_role_idx on public.book_creators(creator_id, role);
create index book_taxonomy_terms_term_idx on public.book_taxonomy_terms(term_id);
create unique index book_images_one_primary_idx on public.book_images(book_id) where is_primary;
create unique index creator_images_one_primary_idx on public.creator_images(creator_id) where is_primary;

alter table public.taxonomy_terms enable row level security;
alter table public.creators enable row level security;
alter table public.creator_roles enable row level security;
alter table public.creator_images enable row level security;
alter table public.books enable row level security;
alter table public.book_images enable row level security;
alter table public.book_creators enable row level security;
alter table public.book_taxonomy_terms enable row level security;
alter table public.homepage_modules enable row level security;
alter table public.book_homepage_modules enable row level security;

create policy "public reads active catalog terms" on public.taxonomy_terms for select using (is_active = true);
create policy "public reads active creators" on public.creators for select using (is_active = true);
create policy "public reads creator roles" on public.creator_roles for select using (true);
create policy "public reads creator images" on public.creator_images for select using (true);
create policy "public reads visible books" on public.books for select using (status = 'active' and is_visible_website = true);
create policy "public reads book images" on public.book_images for select using (true);
create policy "public reads book creators" on public.book_creators for select using (true);
create policy "public reads book terms" on public.book_taxonomy_terms for select using (true);
create policy "public reads active homepage modules" on public.homepage_modules for select using (is_active = true);
create policy "public reads book homepage modules" on public.book_homepage_modules for select using (true);
