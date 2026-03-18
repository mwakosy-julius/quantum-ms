"use client";

import { Dividend, Investor } from "@prisma/client";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";

type DividendWithInvestor = Dividend & { investor: Investor };

interface DividendsTableProps {
  dividends: DividendWithInvestor[];
  role: string;
}

export default function DividendsTable({ dividends, role }: DividendsTableProps) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card-bg)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--background)]">
              <th className="px-4 py-3 text-left font-medium text-[var(--metallic-silver)]">Investor</th>
              <th className="px-4 py-3 text-right font-medium text-[var(--metallic-silver)]">Amount</th>
              <th className="px-4 py-3 text-right font-medium text-[var(--metallic-silver)]">Share %</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--metallic-silver)]">Paid Date</th>
            </tr>
          </thead>
          <tbody>
            {dividends.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-[var(--metallic-silver-dark)]">
                  No dividends distributed yet
                </td>
              </tr>
            ) : (
              dividends.map((d) => (
                <tr key={d.id} className="border-b border-[var(--border)] hover:bg-[var(--border)]/30">
                  <td className="px-4 py-3 text-[var(--metallic-silver-light)]">{d.investor.name}</td>
                  <td className="px-4 py-3 text-right text-[var(--metallic-silver-light)]">{formatCurrency(d.amount)}</td>
                  <td className="px-4 py-3 text-right text-[var(--metallic-silver)]">{(d.profitShare * 100).toFixed(1)}%</td>
                  <td className="px-4 py-3 text-[var(--metallic-silver)]">{format(new Date(d.paidDate), "MMM d, yyyy")}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
