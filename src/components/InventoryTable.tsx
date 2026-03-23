"use client";

import { useState } from "react";
import { Product } from "@prisma/client";
import { AlertTriangle, Package, Pencil } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import EditProductForm from "./EditProductForm";

interface InventoryTableProps {
  products: Product[];
  role: string;
}

export default function InventoryTable({ products, role }: InventoryTableProps) {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const isAdmin = role === "ADMIN";

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card-bg)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--background)]">
              <th className="px-4 py-3 text-left font-medium text-[var(--metallic-silver)]">Product</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--metallic-silver)]">Category</th>
              <th className="px-4 py-3 text-right font-medium text-[var(--metallic-silver)]">Purchase</th>
              <th className="px-4 py-3 text-right font-medium text-[var(--metallic-silver)]">Selling</th>
              <th className="px-4 py-3 text-right font-medium text-[var(--metallic-silver)]">Stock</th>
              <th className="px-4 py-3 text-right font-medium text-[var(--metallic-silver)]">Value</th>
              {isAdmin && <th className="px-4 py-3 text-right font-medium text-[var(--metallic-silver)]">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 7 : 6} className="px-4 py-8 text-center text-[var(--metallic-silver-dark)]">
                  <Package className="mx-auto mb-2 h-10 w-10 opacity-50" />
                  <p>No products yet</p>
                </td>
              </tr>
            ) : (
              products.map((p) => {
                const value = p.purchasePrice * p.stockQuantity;
                const lowStock = p.minStockLevel > 0 && p.stockQuantity <= p.minStockLevel;
                return (
                  <tr key={p.id} className="border-b border-[var(--border)] hover:bg-[var(--border)]/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[var(--metallic-silver-light)]">{p.name}</span>
                        {lowStock && (
                          <span title="Low stock"><AlertTriangle className="h-4 w-4 text-[var(--amber-400)]" aria-label="Low stock" /></span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[var(--metallic-silver)]">{p.category}</td>
                    <td className="px-4 py-3 text-right text-[var(--metallic-silver)]">{formatCurrency(p.purchasePrice)}</td>
                    <td className="px-4 py-3 text-right text-[var(--metallic-silver)]">{formatCurrency(p.sellingPrice)}</td>
                    <td className="px-4 py-3 text-right text-[var(--metallic-silver-light)]">{p.stockQuantity}</td>
                    <td className="px-4 py-3 text-right text-[var(--metallic-silver-light)]">{formatCurrency(value)}</td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setEditingProduct(p)}
                          className="inline-flex items-center gap-1 rounded px-2 py-1 text-sm text-[var(--metallic-silver)] hover:bg-[var(--border)] hover:text-[var(--metallic-silver-light)] transition"
                          title="Edit product"
                        >
                          <Pencil size={14} />
                          Edit
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {editingProduct && (
        <EditProductForm
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
        />
      )}
    </div>
  );
}
