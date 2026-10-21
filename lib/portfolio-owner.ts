import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";

const ownerCookie = "portfolio-owner";
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getPortfolioOwnerId() {
  const cookieStore = await cookies();
  const currentId = cookieStore.get(ownerCookie)?.value;
  if (currentId && uuidPattern.test(currentId)) return currentId;

  const ownerId = randomUUID();
  cookieStore.set(ownerCookie, ownerId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  return ownerId;
}
