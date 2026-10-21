# folio. — Portfolio Template Generator

Create, save, preview, edit, and delete personal portfolios using three distinct templates: Simple, Modern, and Creative. Portfolio records are stored in PostgreSQL; the app does not use browser-only storage as a substitute for the online database.

## Run locally

1. Create a PostgreSQL database and set `DATABASE_URL` in `.env.local` to its connection string. The app also accepts `DATABASE_POSTGRES_URL`.
2. If the database requires TLS, also set `PGSSLMODE=require`.
3. Install dependencies and start Next.js:

   ```bash
   npm install
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000). The portfolio table is created automatically on the first API request.

If `DATABASE_URL` is missing or the database is unavailable, the app displays a connection error and does not report unsaved data as saved.

## Deploy with Neon and Vercel

1. Create a Neon PostgreSQL database through Vercel's **Storage** page and connect it to the project for the **Production** environment.
2. If you use the integration's custom environment variable prefix `DATABASE`, it creates `DATABASE_POSTGRES_URL`. The app accepts this variable directly; alternatively, set `DATABASE_URL` to the same pooled Neon connection string.
3. Keep the generated connection string secret. Set `PGSSLMODE=require` if required by the provider.
4. Redeploy after connecting the database. The PostgreSQL client pool is limited to one connection per Vercel instance.
5. Test creating, retrieving, editing, and deleting a portfolio. A new Neon database starts empty; existing Railway or Supabase rows are not copied automatically.

The API creates the `portfolios` table automatically. Each portfolio is saved as a JSONB record with a UUID and database-managed created/updated timestamps.

## Features

- Responsive landing page and portfolio information form.
- Personal details, profile image URL, education, skills, projects, experience, and social/site links.
- Exactly three distinct designs: Simple, Modern, and Creative.
- Live portfolio preview and browser print/save.
- PostgreSQL-backed create, retrieve, update, and delete API.
- Manage page for reopening, editing, and deleting saved portfolios.
- Per-browser portfolio ownership using an HTTP-only cookie; portfolios are not shared across browsers or devices. Anyone using the same browser profile can access its saved portfolios.
- Download the portfolio preview as PNG or JPEG.

Older rows created before per-browser ownership was introduced have no owner ID and are intentionally omitted from the private portfolio list. They remain in the database unless separately removed.

## Useful commands

```bash
npm run dev
npm run lint
npm run build
```
# portfolio-generator
