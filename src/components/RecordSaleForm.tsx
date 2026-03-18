"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { Product } from "@prisma/client";
import { ShoppingCart } from "lucide-react";

interface RecordSaleFormProps {
  products: Product[];
}

export default function RecordSaleForm({ products }: RecordSaleFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [salePrice, setSalePrice] = useState("");

  const selectedProduct = products.find((p) => p.id === productId);
  const total = selectedProduct
    ? (salePrice ? Number(salePrice) : selectedProduct.sellingPrice) * Number(quantity || 0)
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || !quantity || Number(quantity) < 1) return;
    setLoading(true);
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          quantity: Number(quantity),
          salePrice: salePrice ? Number(salePrice) : undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to record sale");
        return;
      }
      setProductId("");
      setQuantity("1");
      setSalePrice("");
      setOpen(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        disabled={products.length === 0}
        className="flex items-center gap-2 rounded-lg bg-[var(--midnight-green)] px-4 py-2 text-sm font-medium text-[var(--metallic-silver-light)] hover:bg-[var(--midnight-green-light)] transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ShoppingCart size={18} />
        Record Sale
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md rounded-lg border border-[var(--border)] bg-[var(--card-bg)] p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-medium text-[var(--metallic-silver-light)] mb-4">Record Sale</h3>
            {products.length === 0 ? (
              <p className="text-[var(--metallic-silver)]">No products in stock. Add inventory first.</p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-[var(--metallic-silver)] mb-1">Product</label>
                  <select
                    value={productId}
                    onChange={(e) => {
                      setProductId(e.target.value);
                      const p = products.find((x) => x.id === e.target.value);
                      setSalePrice(p ? String(p.sellingPrice) : "");
                    }}
                    className="w-full rounded border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)]"
                    required
                  >
                    <option value="">Select product</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Stock: {p.stockQuantity})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[var(--metallic-silver)] mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedProduct?.stockQuantity ?? 1}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full rounded border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--metallic-silver)] mb-1">
                    Sale Price {selectedProduct && `(default: ${selectedProduct.sellingPrice})`}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    placeholder={selectedProduct ? String(selectedProduct.sellingPrice) : ""}
                    className="w-full rounded border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)]"
                  />
                </div>
                {total > 0 && (
                  <p className="text-[var(--metallic-silver-light)] font-medium">Total: {formatCurrency(total)}</p>
                )}
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="flex-1 rounded border border-[var(--border)] py-2 text-[var(--metallic-silver)] hover:bg-[var(--border)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 rounded bg-[var(--midnight-green)] py-2 font-medium text-white hover:bg-[var(--midnight-green-light)] disabled:opacity-50"
                  >
                    {loading ? "Recording..." : "Record Sale"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
