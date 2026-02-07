import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import { auth } from "@/lib/auth";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getVolunteers() {
  return prisma.volunteer.findMany({
    include: {
      rsvps: {
        include: {
          event: { select: { title: true, date: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { rsvps: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function AdminVolunteersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/admin/events");

  const volunteers = await getVolunteers();

  return (
    <Container>
      <SectionHeader
        title="Volunteers"
        description={`${volunteers.length} total volunteers registered.`}
      />

      {volunteers.length > 0 ? (
        <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
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
                  Phone
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                  Events
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {volunteers.map((vol) => (
                <tr key={vol.id} className="hover:bg-cream">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {vol.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{vol.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {vol.phone || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {vol._count.rsvps} event{vol._count.rsvps !== 1 ? "s" : ""}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {new Date(vol.createdAt).toLocaleDateString()}
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
            title="No volunteers yet"
            description="Volunteers will appear here once they sign up for events."
          />
        </div>
      )}
    </Container>
  );
}
