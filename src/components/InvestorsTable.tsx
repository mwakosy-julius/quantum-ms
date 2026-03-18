"use client";

import { Investor, Dividend } from "@prisma/client";
import { format } from "date-fns";
import { Users } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type InvestorWithDividends = Investor & { dividends: Dividend[] };

interface InvestorsTableProps {
  investors: InvestorWithDividends[];
  role: string;
}

export default function InvestorsTable({ investors, role }: InvestorsTableProps) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card-bg)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--background)]">
              <th className="px-4 py-3 text-left font-medium text-[var(--metallic-silver)]">Investor</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--metallic-silver)]">Email</th>
              <th className="px-4 py-3 text-right font-medium text-[var(--metallic-silver)]">Capital</th>
              <th className="px-4 py-3 text-right font-medium text-[var(--metallic-silver)]">Units</th>
              <th className="px-4 py-3 text-right font-medium text-[var(--metallic-silver)]">Share %</th>
              <th className="px-4 py-3 text-right font-medium text-[var(--metallic-silver)]">Dividends Paid</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--metallic-silver)]">Join Date</th>
            </tr>
          </thead>
          <tbody>
            {investors.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[var(--metallic-silver-dark)]">
                  <Users className="mx-auto mb-2 h-10 w-10 opacity-50" />
                  <p>No investors yet</p>
                </td>
              </tr>
            ) : (
              investors.map((inv) => {
                const dividendsPaid = inv.dividends.reduce((s, d) => s + d.amount, 0);
                return (
                  <tr key={inv.id} className="border-b border-[var(--border)] hover:bg-[var(--border)]/30">
                    <td className="px-4 py-3 text-[var(--metallic-silver-light)]">{inv.name}</td>
                    <td className="px-4 py-3 text-[var(--metallic-silver)]">{inv.email}</td>
                    <td className="px-4 py-3 text-right text-[var(--metallic-silver)]">{formatCurrency(inv.investmentAmount)}</td>
                    <td className="px-4 py-3 text-right text-[var(--metallic-silver)]">{inv.units}</td>
                    <td className="px-4 py-3 text-right text-[var(--metallic-silver)]">{inv.profitSharePct}%</td>
                    <td className="px-4 py-3 text-right text-[var(--metallic-silver-light)]">{formatCurrency(dividendsPaid)}</td>
                    <td className="px-4 py-3 text-[var(--metallic-silver)]">{format(new Date(inv.joinDate), "MMM d, yyyy")}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
