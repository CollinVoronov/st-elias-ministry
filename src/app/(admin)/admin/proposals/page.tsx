import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Calendar, MapPin, Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { ProposalActions } from "@/components/proposals/ProposalActions";

export const dynamic = "force-dynamic";

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    PUBLISHED: { label: "Approved", className: "bg-green-100 text-green-800" },
    CANCELLED: { label: "Declined", className: "bg-red-100 text-red-800" },
  };

  const { label, className } = config[status] || { label: status, className: "bg-gray-100 text-gray-800" };

  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

export default async function AdminProposalsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const pendingProposals = await prisma.event.findMany({
    where: {
      isExternal: true,
      status: "DRAFT",
    },
    include: {
      organizer: { select: { name: true, organization: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const pastProposals = await prisma.event.findMany({
    where: {
      isExternal: true,
      status: { in: ["PUBLISHED", "CANCELLED"] },
    },
    include: {
      organizer: { select: { name: true, organization: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 20,
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-primary-900">Community Proposals</h1>
        <p className="mt-1 text-sm text-gray-600">
          Review and approve event proposals from community organizations.
        </p>
      </div>

      {/* Pending Proposals */}
      <h2 className="mb-3 text-lg font-semibold text-primary-900">
        Pending Review ({pendingProposals.length})
      </h2>

      {pendingProposals.length === 0 ? (
        <Card className="mb-8">
          <CardContent className="py-8 text-center">
            <p className="text-gray-500">No pending proposals.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="mb-8 space-y-3">
          {pendingProposals.map((proposal) => (
            <Card key={proposal.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-primary-900">{proposal.title}</h3>
                  <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5" />
                      {proposal.organizer.organization || proposal.externalOrganizer || proposal.organizer.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {proposal.date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {proposal.location}
                    </span>
                  </div>
                  {proposal.description && (
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                      {proposal.description}
                    </p>
                  )}
                </div>
                <div className="ml-4 flex-shrink-0">
                  <ProposalActions proposalId={proposal.id} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* History */}
      {pastProposals.length > 0 && (
        <>
          <h2 className="mb-3 text-lg font-semibold text-primary-900">History</h2>
          <div className="space-y-3">
            {pastProposals.map((proposal) => (
              <Card key={proposal.id} className="opacity-75">
                <CardContent className="flex items-center justify-between py-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-primary-900">{proposal.title}</h3>
                      <StatusBadge status={proposal.status} />
                    </div>
                    <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5" />
                        {proposal.organizer.organization || proposal.externalOrganizer || proposal.organizer.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {proposal.date.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
