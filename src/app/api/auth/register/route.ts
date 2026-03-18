import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, password, name, role } = await req.json();
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name required" },
        { status: 400 }
      );
    }
    const existing = await prisma.user.findUnique({
      where: { email },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }
    const passwordHash = await hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        password: passwordHash,
        name,
        role: (role as "ADMIN" | "STAFF" | "INVESTOR") || "STAFF",
      },
    });
    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (e) {
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
