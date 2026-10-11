import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { ensurePortfolioTable, getPool } from "@/lib/db";
import { readPortfolio } from "@/lib/portfolio-validation";

function responseError(error: unknown) {
  const message = error instanceof Error ? error.message : "An unexpected database error occurred.";
  if (message.startsWith("DATABASE_URL is not configured.")) {
    return NextResponse.json({ error: message }, { status: 503 });
  }
  if (message.includes("must be") || message.startsWith("Choose one") || message.startsWith("Portfolio information")) {
    return NextResponse.json({ error: message }, { status: 400 });
  }
  console.error("Portfolio API error:", error);
  return NextResponse.json({ error: "The portfolio could not be saved. Check the database connection and try again." }, { status: 500 });
}

export async function GET() {
  try {
    await ensurePortfolioTable();
    const { rows } = await getPool().query(
      "SELECT id, data, updated_at FROM portfolios ORDER BY updated_at DESC",
    );
    const portfolios = rows.map((row) => ({
      ...row.data,
      id: row.id,
      updatedAt: row.updated_at,
    }));
    return NextResponse.json({ portfolios });
  } catch (error) {
    return responseError(error);
  }
}

export async function POST(request: Request) {
  try {
    const data = readPortfolio(await request.json());
    await ensurePortfolioTable();
    const id = randomUUID();
    const { rows } = await getPool().query(
      "INSERT INTO portfolios (id, data) VALUES ($1, $2::jsonb) RETURNING id, data, updated_at",
      [id, JSON.stringify(data)],
    );
    return NextResponse.json({
      portfolio: { ...rows[0].data, id: rows[0].id, updatedAt: rows[0].updated_at },
    }, { status: 201 });
  } catch (error) {
    return responseError(error);
  }
}
