import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const role = (session.user as { role?: string }).role;

    const investors = await prisma.investor.findMany({
      include: { dividends: true },
      orderBy: { createdAt: "desc" },
    });

    if (role === "INVESTOR") {
      const userInvestor = await prisma.investor.findFirst({
        where: { email: session.user.email ?? "" },
        include: { dividends: true },
      });
      if (!userInvestor) return NextResponse.json([]);
      return NextResponse.json([userInvestor]);
    }

    return NextResponse.json(investors);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch investors" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if ((session.user as { role?: string }).role !== "ADMIN")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const { name, email, phone, investmentAmount, units, profitSharePct } = body;

    if (!name || !email || investmentAmount == null) {
      return NextResponse.json({ error: "Name, email, and investment amount required" }, { status: 400 });
    }

    const investor = await prisma.investor.create({
      data: {
        name,
        email,
        phone: phone ?? "",
        investmentAmount: Number(investmentAmount),
        units: Number(units ?? 1),
        profitSharePct: Number(profitSharePct ?? 100),
      },
    });

    return NextResponse.json(investor);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create investor" }, { status: 500 });
  }
}
