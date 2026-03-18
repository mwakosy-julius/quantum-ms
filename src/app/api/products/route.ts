import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const products = await prisma.product.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
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
    const { name, category, supplier, purchasePrice, sellingPrice, stockQuantity, minStockLevel } = body;

    if (!name || purchasePrice == null || sellingPrice == null) {
      return NextResponse.json({ error: "Name, purchase price, and selling price required" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        category: category ?? "General",
        supplier: supplier ?? "",
        purchasePrice: Number(purchasePrice),
        sellingPrice: Number(sellingPrice),
        stockQuantity: Number(stockQuantity ?? 0),
        minStockLevel: Number(minStockLevel ?? 0),
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
