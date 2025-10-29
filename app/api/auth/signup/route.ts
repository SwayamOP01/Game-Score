import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export const runtime = "nodejs";

export async function POST(req: Request) {
  console.time("signup_handler");
  const body = await req.json().catch(() => null);
  if (!body || typeof body.email !== "string" || typeof body.password !== "string") {
    console.warn("/api/auth/signup: invalid payload");
    console.timeEnd("signup_handler");
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const email = body.email.toLowerCase().trim();
  const password = body.password;
  if (password.length < 6) {
    console.warn("/api/auth/signup: short password", { email });
    console.timeEnd("signup_handler");
    return NextResponse.json({ error: "Password too short" }, { status: 400 });
  }
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return NextResponse.json({ error: "Email already registered" }, { status: 400 });
  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, passwordHash: hash } });
  console.timeEnd("signup_handler");
  console.info("/api/auth/signup: created user", { id: user.id, email: user.email });
  return NextResponse.json({ id: user.id, email: user.email });
}