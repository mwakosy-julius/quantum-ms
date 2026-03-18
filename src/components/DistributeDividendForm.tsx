"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp } from "lucide-react";

interface DistributeDividendFormProps {
  totalProfit: number;
}

export default function DistributeDividendForm({ totalProfit }: DistributeDividendFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(String(Math.max(0, totalProfit)));

  const investorShare = Number(amount) * 0.6;
  const businessShare = Number(amount) * 0.4;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(amount);
    if (val <= 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/dividends/distribute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ totalProfit: val }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || "Failed to distribute dividends");
        return;
      }
      setOpen(false);
      setAmount(String(Math.max(0, totalProfit)));
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
        <TrendingUp size={18} />
        Distribute Dividends
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md rounded-lg border border-[var(--border)] bg-[var(--card-bg)] p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-medium text-[var(--metallic-silver-light)] mb-4">Distribute Dividends</h3>
            <p className="text-sm text-[var(--metallic-silver)] mb-4">
              Total profit available: <span className="font-medium text-[var(--metallic-silver-light)]">{formatCurrency(totalProfit)}</span>
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--metallic-silver)] mb-1">Profit to Distribute</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)]"
                  required
                />
              </div>
              <div className="rounded border border-[var(--border)] p-3 space-y-1 text-sm">
                <p className="text-[var(--metallic-silver)]">Investors (60%): <span className="text-[var(--metallic-silver-light)]">{formatCurrency(investorShare)}</span></p>
                <p className="text-[var(--metallic-silver)]">Business (40%): <span className="text-[var(--metallic-silver-light)]">{formatCurrency(businessShare)}</span></p>
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
                  {loading ? "Distributing..." : "Distribute"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
