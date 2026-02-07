import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { NewProposalForm } from "@/components/proposals/NewProposalForm";

export const dynamic = "force-dynamic";

export default async function AdminNewProposalPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Only organizers submit proposals from the admin panel
  if (session.user.role === "ADMIN") redirect("/admin/proposals");

  return (
    <NewProposalForm
      organizationName={session.user.name || "Organizer"}
      backUrl="/admin/proposals"
    />
  );
}
