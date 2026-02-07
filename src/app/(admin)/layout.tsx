import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { OrganizerSidebar } from "@/components/layout/OrganizerSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = session.user.role;

  return (
    <div className="flex h-screen">
      {role === "ADMIN" ? <AdminSidebar /> : <OrganizerSidebar />}
      <main className="flex-1 overflow-y-auto bg-cream p-8">{children}</main>
    </div>
  );
}
