import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfDay, subDays, subMonths } from "date-fns";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [investors, products, sales, dividends] = await Promise.all([
      prisma.investor.aggregate({ _sum: { investmentAmount: true }, _count: true }),
      prisma.product.findMany(),
      prisma.sale.findMany({ include: { product: true } }),
      prisma.dividend.aggregate({ _sum: { amount: true } }),
    ]);

    const totalInventoryValue = products.reduce(
      (s, p) => s + p.purchasePrice * p.stockQuantity,
      0
    );
    const totalSalesRevenue = sales.reduce((s, sale) => s + sale.totalValue, 0);
    const totalInventoryCost = sales.reduce(
      (s, sale) => s + sale.product.purchasePrice * sale.quantity,
      0
    );
    const totalProfit = totalSalesRevenue - totalInventoryCost;
    const totalDividends = dividends._sum.amount ?? 0;

    const today = startOfDay(new Date());
    const weekStart = subDays(today, 7);
    const monthStart = subMonths(today, 1);

    const todaySales = sales
      .filter((s) => new Date(s.saleDate) >= today)
      .reduce((s, sale) => s + sale.totalValue, 0);
    const weekSales = sales
      .filter((s) => new Date(s.saleDate) >= weekStart)
      .reduce((s, sale) => s + sale.totalValue, 0);
    const monthSales = sales
      .filter((s) => new Date(s.saleDate) >= monthStart)
      .reduce((s, sale) => s + sale.totalValue, 0);

    const lowStock = products.filter((p) => p.stockQuantity <= p.minStockLevel && p.minStockLevel > 0);

    const productSalesCount: Record<string, number> = {};
    sales.forEach((s) => {
      const n = s.product.name;
      productSalesCount[n] = (productSalesCount[n] ?? 0) + s.quantity;
    });
    const mostSold = Object.entries(productSalesCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return NextResponse.json({
      totalCapital: investors._sum.investmentAmount ?? 0,
      totalInventoryValue,
      totalSalesRevenue,
      totalProfit,
      totalDividends,
      totalProducts: products.length,
      totalStock: products.reduce((s, p) => s + p.stockQuantity, 0),
      investorCount: investors._count,
      lowStock,
      mostSold,
      todaySales,
      weekSales,
      monthSales,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
