import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Calendar, MapPin, Building2, Plus, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProposalActions } from "@/components/proposals/ProposalActions";

export const dynamic = "force-dynamic";

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    DRAFT: { label: "Pending Review", className: "bg-yellow-100 text-yellow-800" },
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

  const isAdmin = session.user.role === "ADMIN";

  const pendingProposals = await prisma.event.findMany({
    where: {
      isExternal: true,
      status: "DRAFT",
    },
    include: {
      organizer: { select: { id: true, name: true, email: true, organization: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const pastProposals = await prisma.event.findMany({
    where: {
      isExternal: true,
      status: { in: ["PUBLISHED", "CANCELLED"] },
    },
    include: {
      organizer: { select: { id: true, name: true, email: true, organization: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 20,
  });

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary-900">
            {isAdmin ? "Community Proposals" : "Proposals"}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {isAdmin
              ? "Review and approve event proposals from organizers and community organizations."
              : "Submit event proposals for the priest to review and approve."
            }
          </p>
        </div>
        {!isAdmin && (
          <Link href="/admin/proposals/new">
            <Button>
              <Plus className="h-4 w-4" />
              New Proposal
            </Button>
          </Link>
        )}
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
                  <div className="flex items-center gap-3">
                    <Link href={`/admin/proposals/${proposal.id}`} className="font-medium text-primary-900 hover:text-primary-700 hover:underline">
                      <h3>{proposal.title}</h3>
                    </Link>
                    <StatusBadge status={proposal.status} />
                  </div>
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
                  <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                    <User className="h-3 w-3" />
                    Submitted by {proposal.organizer.name} ({proposal.organizer.email})
                  </p>
                  {proposal.description && (
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                      {proposal.description}
                    </p>
                  )}
                </div>
                {isAdmin && (
                  <div className="ml-4 flex-shrink-0">
                    <ProposalActions proposalId={proposal.id} />
                  </div>
                )}
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
                      <Link href={`/admin/proposals/${proposal.id}`} className="font-medium text-primary-900 hover:text-primary-700 hover:underline">
                        <h3>{proposal.title}</h3>
                      </Link>
                      <StatusBadge status={proposal.status} />
                    </div>
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
                    </div>
                    <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                      <User className="h-3 w-3" />
                      Submitted by {proposal.organizer.name}
                    </p>
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
