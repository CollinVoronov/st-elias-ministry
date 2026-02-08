import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { MinistryList } from "@/components/ministries/MinistryList";

export const dynamic = "force-dynamic";

export default async function AdminMinistriesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/admin/events");

  const ministries = await prisma.ministry.findMany({
    include: { _count: { select: { events: true } } },
    orderBy: { name: "asc" },
  });

  const serialized = ministries.map((m) => ({
    id: m.id,
    name: m.name,
    description: m.description,
    color: m.color,
    _count: m._count,
  }));

  return (
    <Container>
      <SectionHeader
        title="Ministries"
        description="Manage ministry names, colors, and descriptions."
      />
      <div className="mt-6">
        <MinistryList initialMinistries={serialized} />
      </div>
    </Container>
  );
}
