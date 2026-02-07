import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { NewEventForm } from "@/components/events/NewEventForm";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: { title?: string; description?: string; ideaId?: string };
}

export default async function NewEventPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/admin/events");

  return (
    <NewEventForm
      defaultTitle={searchParams.title}
      defaultDescription={searchParams.description}
      ideaId={searchParams.ideaId}
    />
  );
}
