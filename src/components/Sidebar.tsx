"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  FileText,
  LogOut,
  Bell,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/investors", label: "Investors", icon: Users },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/sales", label: "Sales", icon: ShoppingCart },
  { href: "/dividends", label: "Dividends", icon: TrendingUp },
  { href: "/reports", label: "Reports", icon: FileText },
];

const staffNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/sales", label: "Sales", icon: ShoppingCart },
];

const investorNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/investors", label: "My Investment", icon: Users },
  { href: "/dividends", label: "Dividends", icon: TrendingUp },
  { href: "/reports", label: "Reports", icon: FileText },
];

export default function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const items =
    role === "ADMIN"
      ? navItems
      : role === "STAFF"
        ? staffNavItems
        : investorNavItems;

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-56 border-r border-[var(--border)] bg-[var(--card-bg)]">
      <div className="flex h-full flex-col">
        <div className="flex h-14 items-center border-b border-[var(--border)] px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-lg font-semibold text-[var(--metallic-silver-light)]">
              Quantum Razer
            </span>
          </Link>
        </div>
        <nav className="flex-1 space-y-1 p-2">
          {items.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname?.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-[var(--midnight-green)] text-white"
                    : "text-[var(--metallic-silver)] hover:bg-[var(--border)] hover:text-[var(--metallic-silver-light)]"
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-[var(--border)] p-2">
          <button
            onClick={() => signOut()}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-[var(--metallic-silver)] hover:bg-[var(--border)] hover:text-red-400"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}
