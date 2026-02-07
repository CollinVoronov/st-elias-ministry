import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Plus, Calendar, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";

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

export default async function CommunityProposalsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const proposals = await prisma.event.findMany({
    where: {
      organizerId: session.user.id,
      isExternal: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary-900">My Proposals</h1>
          <p className="mt-1 text-sm text-gray-600">
            Events you&apos;ve proposed for the community calendar.
          </p>
        </div>
        <Link
          href="/community/proposals/new"
          className="inline-flex items-center gap-2 rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-700"
        >
          <Plus className="h-4 w-4" />
          New Proposal
        </Link>
      </div>

      {proposals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No proposals yet.</p>
            <p className="mt-1 text-sm text-gray-400">
              Submit your first event proposal to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {proposals.map((proposal) => (
            <Card key={proposal.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium text-primary-900">{proposal.title}</h3>
                    <StatusBadge status={proposal.status} />
                  </div>
                  <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
