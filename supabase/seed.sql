insert into public.homepage_modules (name, slug, sort_order) values
  ('New & Upcoming', 'new-upcoming', 1),
  ('Linery Press', 'linery-press', 2),
  ('Linery Picks', 'linery-picks', 3),
  ('Grab & Save', 'grab-save', 4)
on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order;

insert into public.taxonomy_terms (kind, name, slug, sort_order) values
  ('category', 'Fiction', 'fiction', 1),
  ('category', 'Non-fiction', 'non-fiction', 2),
  ('genre', 'International Literature', 'international-literature', 1),
  ('genre', 'Biography & Memoir', 'biography-memoir', 2),
  ('genre', 'Fiction', 'fiction', 3),
  ('genre', 'memoir', 'memoir', 4),
  ('topic', 'Available as E-Book', 'available-as-e-book', 1),
  ('topic', 'Italian Literature', 'italian-literature', 2),
  ('topic', 'French Literature', 'french-literature', 3),
  ('topic', 'International Literature', 'international-literature', 4),
  ('topic', 'Family', 'family', 5),
  ('topic', 'Politics', 'politics', 6),
  ('format', 'Paperback', 'paperback', 1),
  ('format', 'Hardback', 'hardback', 2),
  ('format', 'Hardcover', 'hardcover', 3),
  ('format', 'Essay', 'essay', 4),
  ('line', 'NYRB Classics', 'nyrb-classics', 1),
  ('line', 'Nonfiction', 'nonfiction', 2),
  ('line', 'non-fiction', 'non-fiction', 3),
  ('publisher', 'New York Review Books', 'new-york-review-books', 1),
  ('publisher', 'Penguin Random House', 'penguin-random-house', 2),
  ('publisher', 'Macmillan', 'macmillan', 3),
  ('publisher', 'Penguin Books', 'penguin-books', 4),
  ('imprint', 'Random House Trade Paperbacks', 'random-house-trade-paperbacks', 1),
  ('imprint', 'Picador', 'picador', 2),
  ('language', 'English', 'english', 1)
on conflict (kind, slug) do update set name = excluded.name, sort_order = excluded.sort_order;

insert into public.creators (display_name, slug, birth_year, death_year, awards) values
  ('Natalia Ginzburg', 'natalia-ginzburg', 1916, 1991, null),
  ('Tara Westover', 'tara-westover', 1986, null, null),
  ('François-René de Chateaubriand', 'francois-rene-de-chateaubriand', 1768, 1848, null),
  ('Sloane Crosley', 'sloane-crosley', 1978, null, null),
  ('Julio Ramón Ribeyro', 'julio-ramon-ribeyro', 1929, 1994, null)
on conflict (slug) do update set display_name = excluded.display_name;

insert into public.creator_roles (creator_id, role)
select id, 'author'::public.creator_role from public.creators where slug in ('natalia-ginzburg', 'tara-westover', 'francois-rene-de-chateaubriand', 'sloane-crosley', 'julio-ramon-ribeyro')
on conflict do nothing;

insert into public.books (isbn, title, slug, path, sale_price_vnd, page_count, weight, publication_date, status, is_visible_website, inventory_quantity, reserved_inventory_quantity, cover_storage_path, description_html)
values
  ('9781681374741', 'Valentino and Sagittarius', 'valentino-and-sagittarius', '/books/valentino-and-sagittarius', 409000, 144, '159g', '2020-09-15', 'active', true, 1, 1, '/media/assets/f1624fa0-efeb-4c07-a4b1-75bd3c9e18f4-9781681374741.jpg', '<p>September 2020 selection of the NYRB Classics Book Club.</p>'),
  ('9780399590528', 'Educated', 'educated', '/books/educated', 512000, 368, '266g', '2022-02-08', 'active', true, 1, 0, '/media/assets/0b7e4e63-8447-434b-aebf-f67250ac95ab-9780399590528.jpg', '<p>An unforgettable memoir about education, family and self-invention.</p>'),
  ('9781681379616', 'Memoirs from Beyond the Grave', 'memoirs-from-beyond-the-grave', '/books/memoirs-from-beyond-the-grave', 767000, 592, '839g', '2025-12-02', 'active', true, 1, 0, '/media/assets/0509008d-35c3-43cb-b707-ff19ea0957b2-9781681379616.jpg', '<p>The third volume of Chateaubriand\'s memoirs in a new translation.</p>'),
  ('9781250371782', 'Grief Is for People', 'grief-is-for-people', '/books/grief-is-for-people', 461000, 208, '—', '2027-01-02', 'active', true, 1, 0, '/media/assets/5f3c49fb-20d1-449c-bf82-5fd045b64c98-9781250371782.avif', '<p>A memoir about friendship, grief and the afterlife of loss.</p>'),
  ('9781681373232', 'The Word of the Speechless', 'the-word-of-the-speechless', '/books/the-word-of-the-speechless', 511000, 272, '272g', '2019-10-22', 'active', true, 1, 0, '/media/assets/3bbaeb75-6c2e-4f94-92c1-2ebe1f5068b1-9781681373232.jpg', '<p>A collection introducing readers to Julio Ramón Ribeyro\'s short fiction.</p>')
on conflict (isbn) do update set title = excluded.title, sale_price_vnd = excluded.sale_price_vnd, updated_at = now();

insert into public.book_images (book_id, storage_path, sort_order, is_primary)
select b.id, b.cover_storage_path, 1, true
from public.books b
where b.cover_storage_path is not null
on conflict do nothing;

insert into public.book_creators (book_id, creator_id, role, sort_order)
select b.id, c.id, 'author'::public.creator_role, 1
from public.books b join public.creators c on c.slug = case b.slug
  when 'valentino-and-sagittarius' then 'natalia-ginzburg'
  when 'educated' then 'tara-westover'
  when 'memoirs-from-beyond-the-grave' then 'francois-rene-de-chateaubriand'
  when 'grief-is-for-people' then 'sloane-crosley'
  when 'the-word-of-the-speechless' then 'julio-ramon-ribeyro'
end
on conflict do nothing;

insert into public.book_taxonomy_terms (book_id, term_id)
select b.id, t.id from public.books b join public.taxonomy_terms t on
  (b.slug = 'valentino-and-sagittarius' and t.slug in ('international-literature', 'italian-literature', 'paperback', 'nyrb-classics', 'new-york-review-books', 'english')) or
  (b.slug = 'educated' and t.slug in ('biography-memoir', 'nonfiction', 'paperback', 'random-house-trade-paperbacks', 'penguin-random-house', 'english')) or
  (b.slug = 'memoirs-from-beyond-the-grave' and t.slug in ('biography-memoir', 'french-literature', 'international-literature', 'paperback', 'nyrb-classics', 'new-york-review-books', 'english')) or
  (b.slug = 'grief-is-for-people' and t.slug in ('memoir', 'family', 'non-fiction', 'essay', 'picador', 'macmillan', 'english')) or
  (b.slug = 'the-word-of-the-speechless' and t.slug in ('fiction', 'international-literature', 'paperback', 'nyrb-classics', 'new-york-review-books', 'english'))
on conflict do nothing;

insert into public.book_homepage_modules (book_id, module_id)
select b.id, m.id from public.books b cross join public.homepage_modules m
where (b.slug = 'valentino-and-sagittarius' and m.slug in ('new-upcoming', 'grab-save'))
   or (b.slug = 'educated' and m.slug = 'linery-press')
   or (b.slug in ('memoirs-from-beyond-the-grave', 'grief-is-for-people', 'the-word-of-the-speechless') and m.slug = 'linery-picks')
on conflict do nothing;
