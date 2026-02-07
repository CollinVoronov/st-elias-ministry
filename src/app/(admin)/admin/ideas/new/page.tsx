import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminNewIdeaForm } from "@/components/ideas/AdminNewIdeaForm";

export const dynamic = "force-dynamic";

export default async function AdminNewIdeaPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <AdminNewIdeaForm
      submitterName={session.user.name || ""}
      submitterEmail={session.user.email || ""}
    />
  );
}
