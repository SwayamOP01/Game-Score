import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: Request) {
  console.time("user_by_email_handler");
  const url = new URL(req.url);
  const email = url.searchParams.get("email");
  if (!email) {
    console.warn("/api/user/by-email: missing email param");
    console.timeEnd("user_by_email_handler");
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.warn("/api/user/by-email: not found", { email });
    console.timeEnd("user_by_email_handler");
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  console.timeEnd("user_by_email_handler");
  console.info("/api/user/by-email: resolved", { id: user.id, email: user.email });
  return NextResponse.json({ id: user.id, email: user.email, name: user.name });
}