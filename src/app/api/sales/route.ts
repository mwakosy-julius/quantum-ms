import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period"); // today, week, month

    const where: { saleDate?: { gte?: Date } } = {};
    if (period === "today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      where.saleDate = { gte: today };
    } else if (period === "week") {
      const week = new Date();
      week.setDate(week.getDate() - 7);
      where.saleDate = { gte: week };
    } else if (period === "month") {
      const month = new Date();
      month.setMonth(month.getMonth() - 1);
      where.saleDate = { gte: month };
    }

    const sales = await prisma.sale.findMany({
      where,
      include: { product: true, salesperson: true },
      orderBy: { saleDate: "desc" },
    });

    return NextResponse.json(sales);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch sales" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const role = (session.user as { role?: string }).role;
    if (role !== "ADMIN" && role !== "STAFF")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const { productId, quantity, salePrice } = body;

    if (!productId || !quantity || quantity < 1) {
      return NextResponse.json({ error: "Product and quantity required" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    if (product.stockQuantity < quantity)
      return NextResponse.json({ error: "Insufficient stock" }, { status: 400 });

    const price = salePrice != null ? Number(salePrice) : product.sellingPrice;
    const totalValue = price * quantity;

    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email ?? "" },
    });

    const [sale] = await prisma.$transaction([
      prisma.sale.create({
        data: {
          productId,
          quantity,
          salePrice: price,
          totalValue,
          salespersonId: dbUser?.id ?? undefined,
        },
      }),
      prisma.product.update({
        where: { id: productId },
        data: { stockQuantity: { decrement: quantity } },
      }),
    ]);

    return NextResponse.json(sale);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to record sale" }, { status: 500 });
  }
}
