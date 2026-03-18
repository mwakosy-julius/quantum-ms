import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const INVESTOR_SHARE = 0.6;
const BUSINESS_SHARE = 0.4;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dividends = await prisma.dividend.findMany({
      include: { investor: true },
      orderBy: { paidDate: "desc" },
    });

    const role = (session.user as { role?: string }).role;
    if (role === "INVESTOR") {
      const userInvestor = await prisma.investor.findFirst({
        where: { email: session.user.email ?? "" },
      });
      if (!userInvestor) return NextResponse.json([]);
      return NextResponse.json(dividends.filter((d) => d.investorId === userInvestor.id));
    }

    return NextResponse.json(dividends);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch dividends" }, { status: 500 });
  }
}

// Use POST /api/dividends/distribute for dividend distribution
