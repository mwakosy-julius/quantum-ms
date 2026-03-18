import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DividendsTable from "@/components/DividendsTable";
import DistributeDividendForm from "@/components/DistributeDividendForm";

export default async function DividendsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const role = (session.user as { role?: string }).role ?? "STAFF";

  const dividends = await prisma.dividend.findMany({
    include: { investor: true },
    orderBy: { paidDate: "desc" },
  });

  const sales = await prisma.sale.findMany({ include: { product: true } });
  const totalRevenue = sales.reduce((s, sa) => s + sa.totalValue, 0);
  const totalCost = sales.reduce(
    (s, sa) => s + sa.quantity * sa.product.purchasePrice,
    0
  );
  const totalProfit = totalRevenue - totalCost;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--metallic-silver-light)]">
            Dividends
          </h1>
          <p className="text-[var(--metallic-silver)] mt-1">
            Dividend distribution history
          </p>
        </div>
        {role === "ADMIN" && <DistributeDividendForm totalProfit={totalProfit} />}
      </div>

      <DividendsTable dividends={dividends} role={role} />
    </div>
  );
}
