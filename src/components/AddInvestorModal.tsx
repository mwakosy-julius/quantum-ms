"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

export default function AddInvestorModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    investmentAmount: "",
    units: "1",
    profitSharePct: "100",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/investors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone || undefined,
          investmentAmount: Number(form.investmentAmount),
          units: Number(form.units),
          profitSharePct: Number(form.profitSharePct),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to add investor");
        return;
      }
      setForm({ name: "", email: "", phone: "", investmentAmount: "", units: "1", profitSharePct: "100" });
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
        Add Investor
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md rounded-lg border border-[var(--border)] bg-[var(--card-bg)] p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-medium text-[var(--metallic-silver-light)] mb-4">Add Investor</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--metallic-silver)] mb-1">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--metallic-silver)] mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full rounded border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--metallic-silver)] mb-1">Phone</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full rounded border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)]"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--metallic-silver)] mb-1">Investment Amount</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.investmentAmount}
                  onChange={(e) => setForm((f) => ({ ...f, investmentAmount: e.target.value }))}
                  className="w-full rounded border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)]"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[var(--metallic-silver)] mb-1">Units</label>
                  <input
                    type="number"
                    min="1"
                    value={form.units}
                    onChange={(e) => setForm((f) => ({ ...f, units: e.target.value }))}
                    className="w-full rounded border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--metallic-silver)] mb-1">Profit Share %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={form.profitSharePct}
                    onChange={(e) => setForm((f) => ({ ...f, profitSharePct: e.target.value }))}
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
                  {loading ? "Adding..." : "Add Investor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
