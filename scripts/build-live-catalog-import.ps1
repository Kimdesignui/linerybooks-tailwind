$ErrorActionPreference = 'Stop'

function SqlQuote([AllowNull()][object]$Value) {
  if ($null -eq $Value -or [string]::IsNullOrWhiteSpace([string]$Value)) { return 'null' }
  return "'" + ([string]$Value).Replace("'", "''") + "'"
}

function Slugify([string]$Value) {
  if ([string]::IsNullOrWhiteSpace($Value)) { return '' }
  $normalized = $Value.Normalize([Text.NormalizationForm]::FormD) -replace '\p{Mn}', ''
  return (($normalized.ToLowerInvariant() -replace '[^a-z0-9]+', '-') -replace '(^-|-$)', '')
}

$items = @()
$page = 1
$cursor = $null
do {
  $uri = "https://linerybooks.vn/api/products?page=$page&limit=100"
  if ($cursor) { $uri += "&cursor=$([uri]::EscapeDataString($cursor))" }
  $response = Invoke-RestMethod -Uri $uri -Method Get
  $items += @($response.data)
  $cursor = $response.pagination.nextCursor
  $page++
} while ($response.pagination.hasMore -and $page -lt 20)

$items = @($items | Group-Object isbn | ForEach-Object { $_.Group | Select-Object -First 1 })
$creators = @($items | Where-Object { $_.vendor } | Group-Object vendor | ForEach-Object {
  $name = $_.Name
  [pscustomobject]@{ name = $name; slug = (Slugify $name) }
})
$terms = @{}
foreach ($item in $items) {
  foreach ($category in @($item.categories)) {
    foreach ($term in ([string]$category -split ',') ) {
      $name = $term.Trim()
      if ($name) { $terms["genre|$(Slugify $name)"] = [pscustomobject]@{ name = $name; slug = (Slugify $name) } }
    }
  }
}

$out = [Text.StringBuilder]::new()
[void]$out.AppendLine('-- Generated from https://linerybooks.vn/api/products on ' + (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'))
[void]$out.AppendLine('-- Public catalog only: no customer, order, account, audit, or other sensitive operational data.')
[void]$out.AppendLine('begin;')
[void]$out.AppendLine('')

foreach ($creator in $creators) {
  [void]$out.AppendLine("insert into public.creators (display_name, slug) values ($(SqlQuote $creator.name), $(SqlQuote $creator.slug)) on conflict (slug) do update set display_name = excluded.display_name, updated_at = now();")
}
[void]$out.AppendLine("insert into public.creator_roles (creator_id, role) select id, 'author'::public.creator_role from public.creators where slug in ($((@($creators | ForEach-Object { SqlQuote $_.slug }) -join ', '))) on conflict do nothing;")

$sort = 1
foreach ($entry in $terms.GetEnumerator() | Sort-Object Name) {
  $term = $entry.Value
  [void]$out.AppendLine("insert into public.taxonomy_terms (kind, name, slug, sort_order) values ('genre', $(SqlQuote $term.name), $(SqlQuote $term.slug), $sort) on conflict (kind, slug) do update set name = excluded.name;")
  $sort++
}

foreach ($item in $items) {
  $slug = if ($item.href) { ([string]$item.href).TrimStart('/') } else { [string]$item.isbn }
  $path = "/books/$slug"
  $status = 'active'
  $visible = 'true'
  $inventory = if ($item.available -eq $true) { 1 } else { 0 }
  $cover = if ($item.imageUrl) { [string]$item.imageUrl } else { $null }
  $date = if ($item.year) { "$(([int]$item.year))-01-01" } else { $null }
  [void]$out.AppendLine("insert into public.books (isbn, title, slug, path, sale_price_vnd, publication_date, status, is_visible_website, inventory_quantity, cover_storage_path, seo_title) values ($(SqlQuote $item.isbn), $(SqlQuote $item.title), $(SqlQuote $slug), $(SqlQuote $path), $([int]$item.priceValue), $(SqlQuote $date), '$status', $visible, $inventory, $(SqlQuote $cover), $(SqlQuote $item.title)) on conflict (isbn) do update set title = excluded.title, slug = excluded.slug, path = excluded.path, sale_price_vnd = excluded.sale_price_vnd, publication_date = excluded.publication_date, is_visible_website = excluded.is_visible_website, inventory_quantity = excluded.inventory_quantity, cover_storage_path = excluded.cover_storage_path, seo_title = excluded.seo_title, updated_at = now();")
  if ($cover) {
    [void]$out.AppendLine("insert into public.book_images (book_id, storage_path, alt_text, sort_order, is_primary) select id, $(SqlQuote $cover), $(SqlQuote $item.imageAlt), 0, true from public.books where isbn = $(SqlQuote $item.isbn) and not exists (select 1 from public.book_images bi where bi.book_id = public.books.id and bi.storage_path = $(SqlQuote $cover));")
  }
  if ($item.vendor) {
    [void]$out.AppendLine("insert into public.book_creators (book_id, creator_id, role, sort_order) select b.id, c.id, 'author'::public.creator_role, 0 from public.books b join public.creators c on c.slug = $(SqlQuote (Slugify $item.vendor)) where b.isbn = $(SqlQuote $item.isbn) on conflict do nothing;")
  }
  foreach ($category in @($item.categories)) {
    foreach ($term in ([string]$category -split ',') ) {
      $name = $term.Trim()
      if ($name) {
        $termSlug = Slugify $name
        [void]$out.AppendLine("insert into public.book_taxonomy_terms (book_id, term_id) select b.id, t.id from public.books b join public.taxonomy_terms t on t.kind = 'genre'::public.taxonomy_kind and t.slug = $(SqlQuote $termSlug) where b.isbn = $(SqlQuote $item.isbn) on conflict do nothing;")
      }
    }
  }
}
[void]$out.AppendLine('commit;')
$out.ToString()
