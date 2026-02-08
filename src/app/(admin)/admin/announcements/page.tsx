import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AnnouncementsManager } from "@/components/announcements/AnnouncementsManager";

export const dynamic = "force-dynamic";

export default async function AdminAnnouncementsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const isAdmin = session.user.role === "ADMIN";

  return <AnnouncementsManager isAdmin={isAdmin} />;
}
