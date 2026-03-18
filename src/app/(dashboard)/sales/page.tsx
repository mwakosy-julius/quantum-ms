import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SalesTable from "@/components/SalesTable";
import RecordSaleForm from "@/components/RecordSaleForm";

export default async function SalesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const role = (session.user as { role?: string }).role ?? "STAFF";

  const sales = await prisma.sale.findMany({
    include: { product: true, salesperson: true },
    orderBy: { saleDate: "desc" },
    take: 100,
  });

  const products = await prisma.product.findMany({
    where: { stockQuantity: { gt: 0 } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--metallic-silver-light)]">
            Sales
          </h1>
          <p className="text-[var(--metallic-silver)] mt-1">
            Record and view sales transactions
          </p>
        </div>
        {(role === "ADMIN" || role === "STAFF") && (
          <RecordSaleForm products={products} />
        )}
      </div>

      <SalesTable sales={sales} />
    </div>
  );
}
