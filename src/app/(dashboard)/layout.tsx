import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const role = (session.user as { role?: string }).role ?? "STAFF";

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar role={role} />
      <main className="ml-56 min-h-screen p-6">{children}</main>
    </div>
  );
}
