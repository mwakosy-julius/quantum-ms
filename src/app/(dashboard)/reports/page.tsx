import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const role = (session.user as { role?: string }).role ?? "STAFF";

  const [investors, products, sales, dividends] = await Promise.all([
    prisma.investor.findMany({ include: { dividends: true } }),
    prisma.product.findMany(),
    prisma.sale.findMany({ include: { product: true } }),
    prisma.dividend.findMany({ include: { investor: true } }),
  ]);

  const totalCapital = investors.reduce((s, i) => s + i.investmentAmount, 0);
  const totalInventoryValue = products.reduce(
    (s, p) => s + p.purchasePrice * p.stockQuantity,
    0
  );
  const totalSalesRevenue = sales.reduce((s, sa) => s + sa.totalValue, 0);
  const totalCost = sales.reduce(
    (s, sa) => s + sa.quantity * sa.product.purchasePrice,
    0
  );
  const totalProfit = totalSalesRevenue - totalCost;
  const totalDividendsPaid = dividends.reduce((s, d) => s + d.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--metallic-silver-light)]">
          Reports
        </h1>
        <p className="text-[var(--metallic-silver)] mt-1">
          Summary reports (export coming soon)
        </p>
      </div>

      <div className="rounded-lg border border-[var(--border)] bg-[var(--card-bg)] overflow-hidden">
        <div className="p-6 border-b border-[var(--border)]">
          <h2 className="text-lg font-medium text-[var(--metallic-silver-light)]">
            Financial Summary Report
          </h2>
          <p className="text-sm text-[var(--metallic-silver)] mt-1">
            Generated {format(new Date(), "PPpp")}
          </p>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <p className="text-sm text-[var(--metallic-silver)]">Investment Capital</p>
            <p className="text-xl font-semibold text-[var(--metallic-silver-light)]">
              {formatCurrency(totalCapital)}
            </p>
          </div>
          <div>
            <p className="text-sm text-[var(--metallic-silver)]">Inventory Value</p>
            <p className="text-xl font-semibold text-[var(--metallic-silver-light)]">
              {formatCurrency(totalInventoryValue)}
            </p>
          </div>
          <div>
            <p className="text-sm text-[var(--metallic-silver)]">Sales Revenue</p>
            <p className="text-xl font-semibold text-[var(--metallic-silver-light)]">
              {formatCurrency(totalSalesRevenue)}
            </p>
          </div>
          <div>
            <p className="text-sm text-[var(--metallic-silver)]">Total Profit</p>
            <p className="text-xl font-semibold text-[var(--metallic-silver-light)]">
              {formatCurrency(totalProfit)}
            </p>
          </div>
          <div>
            <p className="text-sm text-[var(--metallic-silver)]">Dividends Paid</p>
            <p className="text-xl font-semibold text-[var(--metallic-silver-light)]">
              {formatCurrency(totalDividendsPaid)}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-[var(--border)] bg-[var(--card-bg)] overflow-hidden">
        <div className="p-6 border-b border-[var(--border)]">
          <h2 className="text-lg font-medium text-[var(--metallic-silver-light)]">
            Investor Dividend Report
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left p-3 text-[var(--metallic-silver)]">Investor</th>
                <th className="text-right p-3 text-[var(--metallic-silver)]">Capital</th>
                <th className="text-right p-3 text-[var(--metallic-silver)]">Units</th>
                <th className="text-right p-3 text-[var(--metallic-silver)]">Dividends Paid</th>
              </tr>
            </thead>
            <tbody>
              {investors.map((inv) => {
                const paid = inv.dividends.reduce((s, d) => s + d.amount, 0);
                return (
                  <tr key={inv.id} className="border-b border-[var(--border)] hover:bg-[var(--border)]/30">
                    <td className="p-3 text-[var(--metallic-silver-light)]">{inv.name}</td>
                    <td className="p-3 text-right text-[var(--metallic-silver)]">
                      {formatCurrency(inv.investmentAmount)}
                    </td>
                    <td className="p-3 text-right text-[var(--metallic-silver)]">{inv.units}</td>
                    <td className="p-3 text-right text-[var(--metallic-silver-light)]">
                      {formatCurrency(paid)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border border-[var(--border)] bg-[var(--card-bg)] overflow-hidden">
        <div className="p-6 border-b border-[var(--border)]">
          <h2 className="text-lg font-medium text-[var(--metallic-silver-light)]">
            Inventory Report
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left p-3 text-[var(--metallic-silver)]">Product</th>
                <th className="text-left p-3 text-[var(--metallic-silver)]">Category</th>
                <th className="text-right p-3 text-[var(--metallic-silver)]">Stock</th>
                <th className="text-right p-3 text-[var(--metallic-silver)]">Value</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-[var(--border)] hover:bg-[var(--border)]/30">
                  <td className="p-3 text-[var(--metallic-silver-light)]">{p.name}</td>
                  <td className="p-3 text-[var(--metallic-silver)]">{p.category}</td>
                  <td className="p-3 text-right text-[var(--metallic-silver)]">{p.stockQuantity}</td>
                  <td className="p-3 text-right text-[var(--metallic-silver-light)]">
                    {formatCurrency(p.purchasePrice * p.stockQuantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
