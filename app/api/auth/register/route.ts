import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  name: z.string().max(100).optional(),
});

export async function POST(request: NextRequest) {
  const parsed = await request.json().catch(() => null);
  const body = registerSchema.safeParse(parsed);
  if (!body.success) {
    return NextResponse.json(
      { code: "BAD_REQUEST", message: "Dados inválidos", details: body.error.flatten() },
      { status: 400 }
    );
  }
  const existing = await prisma.user.findUnique({
    where: { email: body.data.email },
  });
  if (existing) {
    return NextResponse.json(
      { code: "CONFLICT", message: "E-mail já cadastrado" },
      { status: 409 }
    );
  }
  const passwordHash = await hash(body.data.password, 10);
  const user = await prisma.user.create({
    data: {
      email: body.data.email,
      name: body.data.name ?? null,
      passwordHash,
    },
    select: { id: true, email: true, name: true },
  });
  return NextResponse.json(user, { status: 201 });
}
