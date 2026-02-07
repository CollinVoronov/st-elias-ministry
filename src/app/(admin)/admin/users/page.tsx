import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { UserRoleSelect } from "@/components/admin/UserRoleSelect";

export const dynamic = "force-dynamic";

const roleBadgeVariant: Record<string, "success" | "info" | "default"> = {
  ADMIN: "success",
  ORGANIZER: "info",
  COMMUNITY: "default",
};

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/admin/events");

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      organization: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <Container>
      <SectionHeader
        title="Users"
        description="Manage registered users and their roles."
      />

      {users.length > 0 ? (
        <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full">
            <thead className="bg-cream">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                  Organization
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                  Current Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                  Change Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-cream">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {user.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {user.email}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {user.organization || <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={roleBadgeVariant[user.role] || "default"}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <UserRoleSelect
                      userId={user.id}
                      currentRole={user.role}
                      isSelf={user.id === session.user.id}
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-6">
          <EmptyState
            icon={Users}
            title="No users"
            description="No registered users found."
          />
        </div>
      )}
    </Container>
  );
}
