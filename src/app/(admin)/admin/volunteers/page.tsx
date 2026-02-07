import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import { auth } from "@/lib/auth";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { VolunteersList } from "@/components/admin/VolunteersList";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminVolunteersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/admin/events");

  const volunteers = await prisma.volunteer.findMany({
    include: {
      _count: { select: { rsvps: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const serialized = volunteers.map((v) => ({
    id: v.id,
    name: v.name,
    email: v.email,
    phone: v.phone,
    createdAt: v.createdAt.toISOString(),
    eventCount: v._count.rsvps,
  }));

  return (
    <Container>
      <SectionHeader
        title="Volunteers"
        description={`${volunteers.length} total volunteers registered. Click a name to see their event history.`}
      />

      {volunteers.length > 0 ? (
        <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
          <VolunteersList volunteers={serialized} />
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
