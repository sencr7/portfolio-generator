import { Pool } from "pg";

const globalForPostgres = globalThis as typeof globalThis & { portfolioPool?: Pool };

export function getPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured. Add your Railway PostgreSQL connection string to the deployment environment.");
  }

  if (!globalForPostgres.portfolioPool) {
    globalForPostgres.portfolioPool = new Pool({
      connectionString,
      ssl: process.env.PGSSLMODE === "require" ? { rejectUnauthorized: false } : undefined,
    });
  }
  return globalForPostgres.portfolioPool;
}

export async function ensurePortfolioTable() {
  await getPool().query(`
    CREATE TABLE IF NOT EXISTS portfolios (
      id UUID PRIMARY KEY,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}
