# folio. — Portfolio Template Generator

Create, save, preview, edit, and delete personal portfolios using three distinct templates: Simple, Modern, and Creative. Portfolio records are stored in PostgreSQL; the app does not use browser-only storage as a substitute for the online database.

## Run locally

1. Create a PostgreSQL database and set `DATABASE_URL` in `.env.local` to its connection string.
2. If the database requires TLS, also set `PGSSLMODE=require`.
3. Install dependencies and start Next.js:

   ```bash
   npm install
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000). The portfolio table is created automatically on the first API request.

If `DATABASE_URL` is missing or the database is unavailable, the app displays a connection error and does not report unsaved data as saved.

## Deploy with Railway

1. Push this project to a GitHub repository and create a Railway project from that repository.
2. Add a **PostgreSQL** service to the Railway project.
3. In the web service's variables, add `DATABASE_URL` with a reference to the PostgreSQL service's `DATABASE_URL` variable (Railway's **Add Reference** control). If using an external TLS-required PostgreSQL endpoint, also set `PGSSLMODE=require`.
4. Deploy the web service. Its build and start commands are `npm run build` and `npm run start`; Railway can detect Next.js automatically.
5. In the web service's settings, generate a public domain and open it to test creating, editing, refreshing, and deleting portfolios.

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
