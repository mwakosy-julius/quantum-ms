"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

const CATEGORIES = ["Laptops", "Accessories", "Storage Devices", "Peripherals", "General"];

export default function AddProductForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    category: "General",
    supplier: "",
    purchasePrice: "",
    sellingPrice: "",
    stockQuantity: "0",
    minStockLevel: "5",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          category: form.category,
          supplier: form.supplier || undefined,
          purchasePrice: Number(form.purchasePrice),
          sellingPrice: Number(form.sellingPrice),
          stockQuantity: Number(form.stockQuantity),
          minStockLevel: Number(form.minStockLevel),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to add product");
        return;
      }
      setForm({ name: "", category: "General", supplier: "", purchasePrice: "", sellingPrice: "", stockQuantity: "0", minStockLevel: "5" });
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
        className="flex items-center gap-2 rounded-lg bg-[var(--midnight-green)] px-4 py-2 text-sm font-medium text-[var(--metallic-silver-light)] hover:bg-[var(--midnight-green-light)] transition"
      >
        <Plus size={18} />
        Add Product
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md rounded-lg border border-[var(--border)] bg-[var(--card-bg)] p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-medium text-[var(--metallic-silver-light)] mb-4">Add Product</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--metallic-silver)] mb-1">Product Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--metallic-silver)] mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full rounded border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)]"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-[var(--metallic-silver)] mb-1">Supplier</label>
                <input
                  type="text"
                  value={form.supplier}
                  onChange={(e) => setForm((f) => ({ ...f, supplier: e.target.value }))}
                  className="w-full rounded border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[var(--metallic-silver)] mb-1">Purchase Price</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.purchasePrice}
                    onChange={(e) => setForm((f) => ({ ...f, purchasePrice: e.target.value }))}
                    className="w-full rounded border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--metallic-silver)] mb-1">Selling Price</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.sellingPrice}
                    onChange={(e) => setForm((f) => ({ ...f, sellingPrice: e.target.value }))}
                    className="w-full rounded border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)]"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[var(--metallic-silver)] mb-1">Stock Qty</label>
                  <input
                    type="number"
                    min="0"
                    value={form.stockQuantity}
                    onChange={(e) => setForm((f) => ({ ...f, stockQuantity: e.target.value }))}
                    className="w-full rounded border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--metallic-silver)] mb-1">Min Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={form.minStockLevel}
                    onChange={(e) => setForm((f) => ({ ...f, minStockLevel: e.target.value }))}
                    className="w-full rounded border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)]"
                  />
                </div>
              </div>
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
                  {loading ? "Adding..." : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
