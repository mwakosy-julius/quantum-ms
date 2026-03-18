import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const role = (session.user as { role?: string }).role;
    if (role !== "ADMIN" && role !== "STAFF")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const body = await request.json();

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(body.name != null && { name: body.name }),
        ...(body.category != null && { category: body.category }),
        ...(body.supplier != null && { supplier: body.supplier }),
        ...(body.purchasePrice != null && { purchasePrice: Number(body.purchasePrice) }),
        ...(body.sellingPrice != null && { sellingPrice: Number(body.sellingPrice) }),
        ...(body.stockQuantity != null && { stockQuantity: Number(body.stockQuantity) }),
        ...(body.minStockLevel != null && { minStockLevel: Number(body.minStockLevel) }),
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}
