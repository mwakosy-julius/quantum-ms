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

    const { distributionDate } = await req.json().catch(() => ({}));

    const investors = await prisma.investor.findMany();
    const totalCapital = investors.reduce((sum, inv) => sum + inv.investmentAmount, 0);
    if (totalCapital === 0) return NextResponse.json({ error: "No active investors" }, { status: 400 });

    const [sales, dividends] = await Promise.all([
      prisma.sale.findMany({ include: { product: true } }),
      prisma.dividend.aggregate({ _sum: { amount: true } }),
    ]);

    const totalRevenue = sales.reduce((s, sa) => s + sa.totalValue, 0);
    const totalCost = sales.reduce((s, sa) => s + sa.quantity * sa.product.purchasePrice, 0);
    const totalProfit = totalRevenue - totalCost;
    const totalDividendsPaid = dividends._sum.amount ?? 0;
    const availableInvestorProfit = Math.max(0, totalProfit * INVESTOR_SHARE - totalDividendsPaid);
    if (availableInvestorProfit <= 0) {
      return NextResponse.json({ error: "No undistributed investor profit available" }, { status: 400 });
    }

    const investorPool = availableInvestorProfit;
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
      totalProfit,
      totalDividendsPaid: totalDividendsPaid + investorPool,
      records: dividendRecords.length,
    });
  } catch (error) {
    console.error("[DIVIDEND_DISTRIBUTE]", error);
    return NextResponse.json({ error: "Failed to distribute" }, { status: 500 });
  }
}
