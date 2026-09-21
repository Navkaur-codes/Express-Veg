# Express Vegetarian — menu API

A one-page site plus a Vercel serverless API for the à la carte menu.

```
api/menu.js               GET + POST handler
public/index.html         the page that calls them
public/docs.html          Swagger UI, at /docs.html
public/openapi.json       the spec Swagger UI reads
supabase/menu_items.sql   table + sample rows
.env.example              which env vars you need
```

## Swagger UI

Once the site is running, open `/docs.html`. Both endpoints are listed with
their request and response shapes, and **Try it out** sends real requests to
`/api/menu` — a POST there really does add a row.

## 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor**, paste all of `supabase/menu_items.sql`, and run it.
   That creates the table and inserts 7 sample rows.
3. Still in the SQL editor, add the access policies. New tables have Row Level
   Security on, and the anon key obeys it — without these, GET returns `[]`
   and POST fails:

   ```sql
   alter table menu_items enable row level security;

   create policy "public read" on menu_items
     for select using (true);

   create policy "public insert" on menu_items
     for insert with check (true);
   ```

4. Go to **Project Settings -> API** and copy two values:
   - **Project URL** -> `SUPABASE_URL`
   - **anon public** key -> `SUPABASE_ANON_KEY`

Use the **anon** key, not the `service_role` one. The service_role key ignores
RLS entirely and must never reach the browser or a public git repo.

## 2. Run it locally

```bash
npm install
cp .env.example .env.local     # then paste your two values in
npx vercel dev
```

Open http://localhost:3000 — the sample items should appear, and the form
should add a new one.

## 3. Deploy to Vercel

1. Push this folder to GitHub.
2. In Vercel: **Add New -> Project**, import the repo. Leave the framework as
   "Other" — no build step is needed.
3. Before the first deploy, open **Environment Variables** and add both:

   | Name                | Value                        |
   | ------------------- | ---------------------------- |
   | `SUPABASE_URL`      | your project URL             |
   | `SUPABASE_ANON_KEY` | your anon public key         |

   Tick all three environments (Production, Preview, Development).
4. Deploy. Your page is at `/`, the API at `/api/menu`.

Changing an env variable later does **not** update the live site on its own —
go to **Deployments**, open the newest one, and choose **Redeploy**.

## Testing the API directly

```bash
curl https://YOUR-APP.vercel.app/api/menu
```

```bash
curl -X POST https://YOUR-APP.vercel.app/api/menu -H "Content-Type: application/json" -d "{\"name\":\"Veg Manchurian\",\"category\":\"Starter\",\"price\":210,\"available\":true}"
```

## If something goes wrong

| What you see                             | Cause                                                    |
| ---------------------------------------- | -------------------------------------------------------- |
| `Supabase is not configured...`          | Env vars missing, or set after deploy without a redeploy |
| Empty list, but rows exist in Supabase   | The `public read` policy is missing                      |
| POST fails with a row-level security error | The `public insert` policy is missing                   |
| `Could not reach the API`                | Opened `index.html` as a file — use `vercel dev`         |

## Note on the insert policy

`public insert` lets anyone who finds the endpoint add menu items. That is fine
while testing. For a real site, drop that policy and do inserts with the
`service_role` key from the server only, or put them behind Supabase Auth.
