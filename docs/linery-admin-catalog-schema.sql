-- Linery Admin Catalog – Supabase/PostgreSQL schema draft v0.1
-- Chưa chạy trên Supabase. Cần chốt các quyết định trong business analysis trước khi migrate.

create extension if not exists pgcrypto;

create type public.catalog_status as enum ('active', 'archived');
create type public.book_status as enum ('draft', 'active', 'out_of_stock', 'archived');
create type public.import_status as enum ('processing', 'completed', 'completed_with_errors', 'failed');
create type public.media_status as enum ('active', 'archived');
create type public.content_status as enum ('draft', 'published', 'archived');
create type public.payment_status as enum ('active', 'inactive', 'archived');

create table public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  role text not null check (role in ('admin', 'editor', 'warehouse')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  storage_path text not null unique,
  mime_type text not null,
  byte_size bigint not null check (byte_size > 0),
  width_px integer check (width_px is null or width_px > 0),
  height_px integer check (height_px is null or height_px > 0),
  alt_text text,
  status public.media_status not null default 'active',
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  setting_key text not null,
  value jsonb not null default '{}'::jsonb,
  locale text not null default 'vi',
  status public.content_status not null default 'published',
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (setting_key, locale)
);

create table public.content_blocks (
  id uuid primary key default gen_random_uuid(),
  placement text not null,
  locale text not null default 'vi',
  title text,
  body jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  status public.content_status not null default 'draft',
  published_at timestamptz,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (placement, locale)
);

create table public.site_media_slots (
  id uuid primary key default gen_random_uuid(),
  slot_key text not null,
  media_id uuid not null references public.media_assets(id) on delete restrict,
  locale text not null default 'vi',
  sort_order integer not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  unique (slot_key, media_id, locale)
);

create table public.chatbot_settings (
  id boolean primary key default true check (id),
  enabled boolean not null default true,
  provider text not null default 'gemini',
  model text not null default 'gemini-3.5-flash-lite',
  display_name text not null default 'Linbot',
  tagline text,
  greeting text not null default 'Hi, I am Linbot. I can help you find books, authors, and order information.',
  system_prompt text not null,
  fallback_message text not null default 'I could not find a clear answer for that request.',
  allow_image_upload boolean not null default true,
  max_image_bytes bigint not null default 5242880 check (max_image_bytes > 0),
  temperature numeric(3,2) not null default 0.2 check (temperature >= 0 and temperature <= 2),
  max_output_tokens integer not null default 800 check (max_output_tokens > 0),
  rate_limit_per_minute integer not null default 20 check (rate_limit_per_minute > 0),
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.chatbot_quick_prompts (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  prompt text not null,
  locale text not null default 'en',
  sort_order integer not null default 0,
  status public.content_status not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.chatbot_usage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  session_id text,
  model text,
  input_tokens integer,
  output_tokens integer,
  image_attached boolean not null default false,
  status text not null check (status in ('success', 'blocked', 'error', 'rate_limited')),
  error_code text,
  created_at timestamptz not null default now()
);

create table public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  method_type text not null check (method_type in ('bank_transfer', 'gateway', 'wallet')),
  icon_media_id uuid references public.media_assets(id) on delete set null,
  instructions jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  status public.payment_status not null default 'active',
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.payment_accounts (
  id uuid primary key default gen_random_uuid(),
  payment_method_id uuid not null references public.payment_methods(id) on delete restrict,
  label text not null,
  bank_name text,
  branch_name text,
  account_number text,
  account_holder text,
  merchant_id text,
  qr_media_id uuid references public.media_assets(id) on delete set null,
  transfer_template text,
  hold_minutes integer check (hold_minutes is null or hold_minutes > 0),
  is_default boolean not null default false,
  status public.payment_status not null default 'active',
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.payment_provider_settings (
  id uuid primary key default gen_random_uuid(),
  payment_method_id uuid not null references public.payment_methods(id) on delete cascade,
  environment text not null check (environment in ('sandbox', 'production')),
  public_config jsonb not null default '{}'::jsonb,
  secret_ref text,
  webhook_secret_ref text,
  status public.payment_status not null default 'inactive',
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (payment_method_id, environment)
);

create table public.authors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  bio text,
  status public.catalog_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.author_media (
  author_id uuid not null references public.authors(id) on delete cascade,
  media_id uuid not null references public.media_assets(id) on delete restrict,
  role text not null check (role in ('portrait', 'gallery', 'og')),
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  primary key (author_id, media_id, role)
);

create table public.publishers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  status public.catalog_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.sales_channels (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  status public.catalog_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.sales_points (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references public.sales_channels(id) on delete restrict,
  code text not null unique,
  name text not null,
  address_line text,
  phone text,
  opening_hours jsonb,
  status public.catalog_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.locations (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.locations(id) on delete restrict,
  code text not null unique,
  name text not null,
  level text not null check (level in ('country', 'province', 'district', 'ward')),
  status public.catalog_status not null default 'active'
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete set null,
  full_name text not null,
  email text,
  phone text,
  locale text not null default 'vi',
  marketing_consent boolean not null default false,
  marketing_consent_at timestamptz,
  status public.catalog_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  label text,
  recipient_name text not null,
  phone text not null,
  address_line text not null,
  location_id uuid references public.locations(id) on delete restrict,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.inventory_locations (
  id uuid primary key default gen_random_uuid(),
  sales_point_id uuid references public.sales_points(id) on delete restrict,
  name text not null,
  code text not null unique,
  status public.catalog_status not null default 'active'
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories(id) on delete restrict,
  name text not null,
  slug text not null unique,
  description text,
  status public.catalog_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  sort_order integer not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  status public.catalog_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.collection_media (
  collection_id uuid not null references public.collections(id) on delete cascade,
  media_id uuid not null references public.media_assets(id) on delete restrict,
  role text not null check (role in ('banner', 'mobile_banner', 'gallery', 'og')),
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  primary key (collection_id, media_id, role)
);

create table public.book_formats (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  status public.catalog_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.book_sizes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  label text not null,
  width_mm integer not null check (width_mm > 0),
  height_mm integer not null check (height_mm > 0),
  status public.catalog_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.books (
  id uuid primary key default gen_random_uuid(),
  isbn text not null unique,
  slug text not null unique,
  title text not null,
  author_id uuid not null references public.authors(id) on delete restrict,
  publisher_id uuid references public.publishers(id) on delete restrict,
  format_id uuid references public.book_formats(id) on delete restrict,
  size_id uuid not null references public.book_sizes(id) on delete restrict,
  language_code text,
  pages integer check (pages is null or pages > 0),
  publication_year integer check (publication_year is null or publication_year between 1000 and 3000),
  quantity integer not null default 0 check (quantity >= 0),
  unit_cost bigint check (unit_cost is null or unit_cost >= 0),
  sale_price bigint check (sale_price is null or sale_price >= 0),
  source_url text,
  description text,
  status public.book_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.book_inventory (
  book_id uuid not null references public.books(id) on delete cascade,
  inventory_location_id uuid not null references public.inventory_locations(id) on delete restrict,
  quantity integer not null default 0 check (quantity >= 0),
  reserved_quantity integer not null default 0 check (reserved_quantity >= 0 and reserved_quantity <= quantity),
  updated_at timestamptz not null default now(),
  primary key (book_id, inventory_location_id)
);

create table public.book_media (
  book_id uuid not null references public.books(id) on delete cascade,
  media_id uuid not null references public.media_assets(id) on delete restrict,
  role text not null check (role in ('cover', 'gallery', 'og')),
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  primary key (book_id, media_id, role)
);

create table public.book_categories (
  book_id uuid not null references public.books(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete restrict,
  primary key (book_id, category_id)
);

create table public.book_collections (
  book_id uuid not null references public.books(id) on delete cascade,
  collection_id uuid not null references public.collections(id) on delete cascade,
  sort_order integer not null default 0,
  primary key (book_id, collection_id)
);

create table public.news_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  body text,
  status public.catalog_status not null default 'active',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.news_media (
  news_id uuid not null references public.news_posts(id) on delete cascade,
  media_id uuid not null references public.media_assets(id) on delete restrict,
  role text not null check (role in ('hero', 'content', 'og')),
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  primary key (news_id, media_id, role)
);

create table public.book_import_batches (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  status public.import_status not null default 'processing',
  total_rows integer not null default 0 check (total_rows >= 0),
  valid_rows integer not null default 0 check (valid_rows >= 0),
  invalid_rows integer not null default 0 check (invalid_rows >= 0),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table public.book_import_errors (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.book_import_batches(id) on delete cascade,
  row_number integer not null check (row_number >= 2),
  field_name text,
  error_code text not null,
  error_message text not null,
  raw_value text,
  created_at timestamptz not null default now()
);

create table public.book_import_rows (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.book_import_batches(id) on delete cascade,
  row_number integer not null check (row_number >= 2),
  status text not null check (status in ('pending', 'valid', 'invalid', 'created')),
  book_id uuid references public.books(id) on delete set null,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (batch_id, row_number)
);

create index books_title_search_idx on public.books using gin (to_tsvector('simple', title));
create index books_author_idx on public.books(author_id);
create index books_status_idx on public.books(status);
create index book_import_errors_batch_idx on public.book_import_errors(batch_id, row_number);
create index book_import_rows_batch_idx on public.book_import_rows(batch_id, status);
create index book_collections_collection_idx on public.book_collections(collection_id, sort_order);
create index book_media_book_idx on public.book_media(book_id, role, sort_order);
create unique index author_media_primary_idx on public.author_media(author_id, role) where is_primary;
create unique index book_media_primary_idx on public.book_media(book_id, role) where is_primary;
create unique index collection_media_primary_idx on public.collection_media(collection_id, role) where is_primary;
create unique index news_media_primary_idx on public.news_media(news_id, role) where is_primary;
create index media_assets_status_idx on public.media_assets(status);
create index chatbot_quick_prompts_lookup_idx on public.chatbot_quick_prompts(locale, status, sort_order);
create index chatbot_usage_logs_created_idx on public.chatbot_usage_logs(created_at);
create index payment_methods_display_idx on public.payment_methods(status, sort_order);
create index payment_accounts_method_idx on public.payment_accounts(payment_method_id, status, is_default);
create index site_media_slots_lookup_idx on public.site_media_slots(slot_key, locale, status, sort_order);
create index sales_points_channel_idx on public.sales_points(channel_id, status);
create index customers_email_idx on public.customers(email);
create index customer_addresses_customer_idx on public.customer_addresses(customer_id, is_default);
create index book_inventory_location_idx on public.book_inventory(inventory_location_id);

-- RLS policy draft: enable only after helper functions for role checks are defined.
-- alter table public.books enable row level security;
-- alter table public.categories enable row level security;
-- alter table public.book_import_batches enable row level security;
-- alter table public.book_import_errors enable row level security;

