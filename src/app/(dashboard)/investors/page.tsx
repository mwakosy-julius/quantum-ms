import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import InvestorsTable from "@/components/InvestorsTable";
import AddInvestorModal from "@/components/AddInvestorModal";

export default async function InvestorsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const role = (session.user as { role?: string }).role ?? "STAFF";

  let investors;
  if (role === "INVESTOR") {
    const inv = await prisma.investor.findFirst({
      where: { email: session.user.email ?? "" },
      include: { dividends: true },
    });
    investors = inv ? [inv] : [];
  } else {
    investors = await prisma.investor.findMany({
      include: { dividends: true },
      orderBy: { createdAt: "desc" },
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--metallic-silver-light)]">
            {role === "INVESTOR" ? "My Investment" : "Investors"}
          </h1>
          <p className="text-[var(--metallic-silver)] mt-1">
            {role === "INVESTOR"
              ? "Your investment and dividend history"
              : "Track investor contributions and dividends"}
          </p>
        </div>
        {role === "ADMIN" && <AddInvestorModal />}
      </div>

      <InvestorsTable investors={investors} role={role} />
    </div>
  );
}
