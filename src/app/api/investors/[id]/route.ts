import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const investor = await prisma.investor.findUnique({
      where: { id },
      include: { dividends: true },
    });

    if (!investor) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const role = (session.user as { role?: string }).role;
    if (role === "INVESTOR") {
      const userInvestor = await prisma.investor.findFirst({
        where: { email: session.user.email ?? "" },
      });
      if (userInvestor?.id !== id)
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(investor);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch investor" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if ((session.user as { role?: string }).role !== "ADMIN")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const body = await request.json();

    const investor = await prisma.investor.update({
      where: { id },
      data: {
        ...(body.name != null && { name: body.name }),
        ...(body.email != null && { email: body.email }),
        ...(body.phone != null && { phone: body.phone }),
        ...(body.investmentAmount != null && { investmentAmount: Number(body.investmentAmount) }),
        ...(body.units != null && { units: Number(body.units) }),
        ...(body.profitSharePct != null && { profitSharePct: Number(body.profitSharePct) }),
      },
    });

    return NextResponse.json(investor);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update investor" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if ((session.user as { role?: string }).role !== "ADMIN")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    await prisma.investor.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete investor" }, { status: 500 });
  }
}
