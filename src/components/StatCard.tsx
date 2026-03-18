import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtext?: string;
}

export default function StatCard({ title, value, icon: Icon, subtext }: StatCardProps) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card-bg)] p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[var(--metallic-silver)]">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-[var(--metallic-silver-light)]">
            {value}
          </p>
          {subtext && (
            <p className="mt-1 text-xs text-[var(--metallic-silver-dark)]">
              {subtext}
            </p>
          )}
        </div>
        <div className="rounded-lg bg-[var(--midnight-green)] p-2">
          <Icon className="text-[var(--metallic-silver-light)]" size={20} />
        </div>
      </div>
    </div>
  );
}
