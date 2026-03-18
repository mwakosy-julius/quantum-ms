import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import InventoryTable from "@/components/InventoryTable";
import AddProductForm from "@/components/AddProductForm";

export default async function InventoryPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const role = (session.user as { role?: string }).role ?? "STAFF";

  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--metallic-silver-light)]">
            Inventory
          </h1>
          <p className="text-[var(--metallic-silver)] mt-1">
            Products and stock levels
          </p>
        </div>
        {(role === "ADMIN" || role === "STAFF") && <AddProductForm />}
      </div>

      <InventoryTable products={products} role={role} />
    </div>
  );
}
