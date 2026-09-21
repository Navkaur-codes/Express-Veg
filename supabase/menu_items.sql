-- Express Vegetarian — à la carte menu items
-- Run this in the Supabase SQL editor.

create extension if not exists "pgcrypto";

create table if not exists menu_items (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  category   text not null,
  price      numeric(10, 2) not null,
  available  boolean not null default true,
  created_at timestamptz not null default now()
);

-- Access policies. RLS is on by default for new tables and the anon key
-- obeys it, so without these GET returns [] and POST fails.
-- "public insert" is for testing only — see the note in README.md.
alter table menu_items enable row level security;

drop policy if exists "public read" on menu_items;
create policy "public read" on menu_items
  for select using (true);

drop policy if exists "public insert" on menu_items;
create policy "public insert" on menu_items
  for insert with check (true);

-- Sample data for testing the API
insert into menu_items (name, category, price, available) values
  ('Paneer Tikka',        'Starter',     220.00, true),
  ('Hara Bhara Kabab',    'Starter',     180.00, true),
  ('Dal Makhani',         'Main Course', 260.00, true),
  ('Palak Paneer',        'Main Course', 280.00, true),
  ('Veg Biryani',         'Main Course', 240.00, false),
  ('Gulab Jamun',         'Dessert',      90.00, true),
  ('Rasmalai',            'Dessert',     120.00, true);
