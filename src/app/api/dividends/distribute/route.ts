import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const INVESTOR_SHARE = 0.6; // 60% to investors
const BUSINESS_SHARE = 0.4; // 40% to business

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const role = (session.user as { role?: string }).role;
    if (role !== "ADMIN") return NextResponse.json({ error: "Admin only" }, { status: 403 });

    const { totalProfit, distributionDate } = await req.json();
    if (!totalProfit || totalProfit <= 0) {
      return NextResponse.json({ error: "Invalid profit amount" }, { status: 400 });
    }

    const investors = await prisma.investor.findMany();
    const totalCapital = investors.reduce((sum, inv) => sum + inv.investmentAmount, 0);
    if (totalCapital === 0) return NextResponse.json({ error: "No active investors" }, { status: 400 });

    const investorPool = totalProfit * INVESTOR_SHARE;
    const date = distributionDate ? new Date(distributionDate) : new Date();

    const dividendRecords = investors.map((inv) => {
      const share = inv.investmentAmount / totalCapital;
      const amount = Math.round(investorPool * share);
      return {
        investorId: inv.id,
        amount,
        profitShare: share,
        paidDate: date,
      };
    });

    await prisma.$transaction(
      dividendRecords.map((d) =>
        prisma.dividend.create({
          data: {
            investorId: d.investorId,
            amount: d.amount,
            profitShare: d.profitShare,
            paidDate: d.paidDate,
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      distributed: investorPool,
      businessShare: totalProfit * BUSINESS_SHARE,
      records: dividendRecords.length,
    });
  } catch (error) {
    console.error("[DIVIDEND_DISTRIBUTE]", error);
    return NextResponse.json({ error: "Failed to distribute" }, { status: 500 });
  }
}
