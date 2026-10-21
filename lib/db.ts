import { Pool } from "pg";

const globalForPostgres = globalThis as typeof globalThis & { portfolioPool?: Pool };

export function getPool() {
  const connectionString = process.env.DATABASE_URL ?? process.env.DATABASE_POSTGRES_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL or DATABASE_POSTGRES_URL is not configured. Add your PostgreSQL connection string to the deployment environment.");
  }

  if (!globalForPostgres.portfolioPool) {
    globalForPostgres.portfolioPool = new Pool({
      connectionString,
      max: process.env.VERCEL ? 1 : 10,
      ssl: process.env.PGSSLMODE === "require" ? { rejectUnauthorized: false } : undefined,
    });
  }
  return globalForPostgres.portfolioPool;
}

export async function ensurePortfolioTable() {
  await getPool().query(`
    CREATE TABLE IF NOT EXISTS portfolios (
      id UUID PRIMARY KEY,
      owner_id UUID,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await getPool().query("ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS owner_id UUID");
  await getPool().query("CREATE INDEX IF NOT EXISTS portfolios_owner_updated_idx ON portfolios (owner_id, updated_at DESC)");
}
