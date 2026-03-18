"use client";

import { Sale, Product, User } from "@prisma/client";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";

type SaleWithRelations = Sale & { product: Product; salesperson: User | null };

interface SalesTableProps {
  sales: SaleWithRelations[];
}

export default function SalesTable({ sales }: SalesTableProps) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card-bg)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--background)]">
              <th className="px-4 py-3 text-left font-medium text-[var(--metallic-silver)]">Date</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--metallic-silver)]">Product</th>
              <th className="px-4 py-3 text-right font-medium text-[var(--metallic-silver)]">Qty</th>
              <th className="px-4 py-3 text-right font-medium text-[var(--metallic-silver)]">Price</th>
              <th className="px-4 py-3 text-right font-medium text-[var(--metallic-silver)]">Total</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--metallic-silver)]">Salesperson</th>
            </tr>
          </thead>
          <tbody>
            {sales.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[var(--metallic-silver-dark)]">
                  No sales yet
                </td>
              </tr>
            ) : (
              sales.map((s) => (
                <tr key={s.id} className="border-b border-[var(--border)] hover:bg-[var(--border)]/30">
                  <td className="px-4 py-3 text-[var(--metallic-silver)]">{format(new Date(s.saleDate), "MMM d, yyyy HH:mm")}</td>
                  <td className="px-4 py-3 text-[var(--metallic-silver-light)]">{s.product.name}</td>
                  <td className="px-4 py-3 text-right text-[var(--metallic-silver)]">{s.quantity}</td>
                  <td className="px-4 py-3 text-right text-[var(--metallic-silver)]">{formatCurrency(s.salePrice)}</td>
                  <td className="px-4 py-3 text-right text-[var(--metallic-silver-light)]">{formatCurrency(s.totalValue)}</td>
                  <td className="px-4 py-3 text-[var(--metallic-silver)]">{s.salesperson?.name ?? s.salesperson?.email ?? "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
