import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import StatCard from "@/components/StatCard";
import {
  DollarSign,
  Package,
  TrendingUp,
  Users,
  AlertTriangle,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const role = (session.user as { role?: string }).role ?? "STAFF";

  // Fetch dashboard data
  const [
    investors,
    products,
    sales,
    dividends,
  ] = await Promise.all([
    prisma.investor.findMany(),
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
  const totalInventoryCost = sales.reduce((s, sa) => s + sa.quantity * sa.product.purchasePrice, 0);
  const totalProfit = totalSalesRevenue - totalInventoryCost;
  const totalDividendsPaid = dividends.reduce((s, d) => s + d.amount, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(today);
  monthAgo.setDate(monthAgo.getDate() - 30);

  const todaySales = sales
    .filter((s) => new Date(s.saleDate) >= today)
    .reduce((s, x) => s + x.totalValue, 0);
  const weeklySales = sales
    .filter((s) => new Date(s.saleDate) >= weekAgo)
    .reduce((s, x) => s + x.totalValue, 0);
  const monthlySales = sales
    .filter((s) => new Date(s.saleDate) >= monthAgo)
    .reduce((s, x) => s + x.totalValue, 0);

  const lowStockProducts = products.filter(
    (p) => p.stockQuantity <= p.minStockLevel
  );
  const totalProducts = products.reduce((s, p) => s + p.stockQuantity, 0);

  // Most sold products
  const productSalesMap = new Map<string, { name: string; qty: number }>();
  sales.forEach((s) => {
    const key = s.productId;
    const existing = productSalesMap.get(key);
    if (existing) {
      existing.qty += s.quantity;
    } else {
      productSalesMap.set(key, { name: s.product.name, qty: s.quantity });
    }
  });
  const mostSold = Array.from(productSalesMap.entries())
    .sort((a, b) => b[1].qty - a[1].qty)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--metallic-silver-light)]">
          Dashboard
        </h1>
        <p className="text-[var(--metallic-silver)] mt-1">
          Overview of Quantum Razer operations
        </p>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${role === "ADMIN" ? "lg:grid-cols-5" : "lg:grid-cols-3"}`}>
        {role === "ADMIN" && (
          <StatCard
            title="Total Investment Capital"
            value={formatCurrency(totalCapital)}
            icon={DollarSign}
          />
        )}
        <StatCard
          title="Inventory Value"
          value={formatCurrency(totalInventoryValue)}
          icon={Package}
        />
        <StatCard
          title="Sales Revenue"
          value={formatCurrency(totalSalesRevenue)}
          icon={TrendingUp}
        />
        <StatCard
          title="Total Profit"
          value={formatCurrency(totalProfit)}
          icon={DollarSign}
        />
        {role === "ADMIN" && (
          <StatCard
            title="Dividends Paid"
            value={formatCurrency(totalDividendsPaid)}
            icon={Users}
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`rounded-lg border border-[var(--border)] bg-[var(--card-bg)] p-6 ${role !== "ADMIN" ? "lg:col-span-2" : ""}`}>
          <h2 className="text-lg font-medium text-[var(--metallic-silver-light)] mb-4">
            Sales Overview
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--metallic-silver)]">Today</span>
              <span className="text-[var(--metallic-silver-light)] font-medium">
                {formatCurrency(todaySales)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--metallic-silver)]">This Week</span>
              <span className="text-[var(--metallic-silver-light)] font-medium">
                {formatCurrency(weeklySales)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--metallic-silver)]">This Month</span>
              <span className="text-[var(--metallic-silver-light)] font-medium">
                {formatCurrency(monthlySales)}
              </span>
            </div>
          </div>
        </div>

        {role === "ADMIN" && (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card-bg)] p-6">
            <h2 className="text-lg font-medium text-[var(--metallic-silver-light)] mb-4">
              Investor Overview
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--metallic-silver)]">Total Investors</span>
                <span className="text-[var(--metallic-silver-light)] font-medium">{investors.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--metallic-silver)]">Capital Raised</span>
                <span className="text-[var(--metallic-silver-light)] font-medium">
                  {formatCurrency(totalCapital)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card-bg)] p-6">
          <h2 className="text-lg font-medium text-[var(--metallic-silver-light)] mb-4 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Inventory Summary
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--metallic-silver)]">Products in Stock</span>
              <span className="text-[var(--metallic-silver-light)] font-medium">{totalProducts}</span>
            </div>
            {lowStockProducts.length > 0 && (
              <div className="mt-3 p-3 rounded border border-[#b45309]/50 bg-[#b45309]/10">
                <p className="text-[#f59e0b] text-sm font-medium flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  Low Stock ({lowStockProducts.length} items)
                </p>
                <ul className="mt-2 text-xs text-[var(--metallic-silver)] space-y-1">
                  {lowStockProducts.slice(0, 3).map((p) => (
                    <li key={p.id}>
                      {p.name}: {p.stockQuantity} left (min: {p.minStockLevel})
                    </li>
                  ))}
                  {lowStockProducts.length > 3 && (
                    <li>+{lowStockProducts.length - 3} more</li>
                  )}
                </ul>
                <Link
                  href="/inventory"
                  className="text-[var(--midnight-green-light)] text-sm hover:underline mt-2 inline-block"
                >
                  View inventory →
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-[var(--border)] bg-[var(--card-bg)] p-6">
          <h2 className="text-lg font-medium text-[var(--metallic-silver-light)] mb-4 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Most Sold Products
          </h2>
          {mostSold.length > 0 ? (
            <ul className="space-y-2 text-sm">
              {mostSold.map(([, v], i) => (
                <li key={i} className="flex justify-between text-[var(--metallic-silver)]">
                  <span>{v.name}</span>
                  <span className="text-[var(--metallic-silver-light)]">{v.qty} sold</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[var(--metallic-silver-dark)] text-sm">No sales yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
