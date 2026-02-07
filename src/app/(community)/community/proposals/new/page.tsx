import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { NewProposalForm } from "@/components/proposals/NewProposalForm";

export const dynamic = "force-dynamic";

export default async function NewProposalPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <NewProposalForm organizationName={session.user.organization || ""} />
  );
}
