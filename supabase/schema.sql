create extension if not exists pgcrypto;
create table if not exists public.articles(
 id uuid primary key default gen_random_uuid(),
 title text not null check(char_length(title) between 5 and 180),
 slug text not null unique check(char_length(slug) between 3 and 120),
 summary text not null check(char_length(summary) between 10 and 400),
 content text not null check(char_length(content)>=20),
 category text not null default 'Tarija',
 cover_image text,
 author text not null default 'Redacción EL LENTE TARIJEÑO',
 status text not null default 'draft' check(status in('draft','published')),
 featured boolean not null default false,
 published_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists articles_status_published_idx on public.articles(status,published_at desc);
alter table public.articles enable row level security;
drop policy if exists "Public reads published articles" on public.articles;
create policy "Public reads published articles" on public.articles for select to anon,authenticated using(status='published' and published_at is not null and published_at<=now());
drop policy if exists "Authenticated editors read all articles" on public.articles;
create policy "Authenticated editors read all articles" on public.articles for select to authenticated using(auth.uid() is not null);
drop policy if exists "Authenticated editors insert" on public.articles;
create policy "Authenticated editors insert" on public.articles for insert to authenticated with check(auth.uid() is not null);
drop policy if exists "Authenticated editors update" on public.articles;
create policy "Authenticated editors update" on public.articles for update to authenticated using(auth.uid() is not null) with check(auth.uid() is not null);
drop policy if exists "Authenticated editors delete" on public.articles;
create policy "Authenticated editors delete" on public.articles for delete to authenticated using(auth.uid() is not null);
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('article-images','article-images',true,8388608,array['image/jpeg','image/png','image/webp','image/avif']) on conflict(id) do update set public=true,file_size_limit=8388608,allowed_mime_types=array['image/jpeg','image/png','image/webp','image/avif'];
drop policy if exists "Public reads news images" on storage.objects;
create policy "Public reads news images" on storage.objects for select to public using(bucket_id='article-images');
drop policy if exists "Authenticated upload news images" on storage.objects;
create policy "Authenticated upload news images" on storage.objects for insert to authenticated with check(bucket_id='article-images');
drop policy if exists "Authenticated update news images" on storage.objects;
create policy "Authenticated update news images" on storage.objects for update to authenticated using(bucket_id='article-images') with check(bucket_id='article-images');
drop policy if exists "Authenticated delete news images" on storage.objects;
create policy "Authenticated delete news images" on storage.objects for delete to authenticated using(bucket_id='article-images');
