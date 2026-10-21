import { NextResponse } from "next/server";
import { ensurePortfolioTable, getPool } from "@/lib/db";
import { getPortfolioOwnerId } from "@/lib/portfolio-owner";
import { readPortfolio } from "@/lib/portfolio-validation";

type RouteContext = { params: Promise<{ id: string }> };

function invalidId(id: string) {
  return !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "An unexpected database error occurred.";
  if (message.startsWith("DATABASE_URL is not configured.")) {
    return NextResponse.json({ error: message }, { status: 503 });
  }
  if (message.includes("must be") || message.startsWith("Choose one") || message.startsWith("Portfolio information")) {
    return NextResponse.json({ error: message }, { status: 400 });
  }
  console.error("Portfolio API error:", error);
  return NextResponse.json({ error: "The portfolio could not be updated. Check the database connection and try again." }, { status: 500 });
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  if (invalidId(id)) return NextResponse.json({ error: "Portfolio not found." }, { status: 404 });
  try {
    const ownerId = await getPortfolioOwnerId();
    const data = readPortfolio(await request.json());
    await ensurePortfolioTable();
    const { rows } = await getPool().query(
      "UPDATE portfolios SET data = $3::jsonb, updated_at = NOW() WHERE id = $1 AND owner_id = $2 RETURNING id, data, updated_at",
      [id, ownerId, JSON.stringify(data)],
    );
    if (!rows[0]) return NextResponse.json({ error: "Portfolio not found." }, { status: 404 });
    return NextResponse.json({
      portfolio: { ...rows[0].data, id: rows[0].id, updatedAt: rows[0].updated_at },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  if (invalidId(id)) return NextResponse.json({ error: "Portfolio not found." }, { status: 404 });
  try {
    const ownerId = await getPortfolioOwnerId();
    await ensurePortfolioTable();
    const { rowCount } = await getPool().query("DELETE FROM portfolios WHERE id = $1 AND owner_id = $2", [id, ownerId]);
    if (!rowCount) return NextResponse.json({ error: "Portfolio not found." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
