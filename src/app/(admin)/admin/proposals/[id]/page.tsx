import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, formatTime } from "@/lib/utils";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Building2,
  User,
  Users,
  Package,
  Clock,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Card, CardContent } from "@/components/ui/Card";
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

export default async function ProposalDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const isAdmin = session.user.role === "ADMIN";

  const proposal = await prisma.event.findUnique({
    where: { id: params.id, isExternal: true },
    include: {
      organizer: {
        select: { id: true, name: true, email: true, organization: true },
      },
    },
  });

  if (!proposal) notFound();

  // Community users can only view their own proposals
  if (session.user.role === "COMMUNITY" && proposal.organizerId !== session.user.id) {
    redirect("/admin/proposals");
  }

  return (
    <Container size="md">
      {/* Back link */}
      <Link
        href="/admin/proposals"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Proposals
      </Link>

      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold text-primary-900">
              {proposal.title}
            </h1>
            <StatusBadge status={proposal.status} />
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
            <User className="h-3.5 w-3.5" />
            Submitted by {proposal.organizer.name} ({proposal.organizer.email})
          </p>
        </div>
        {isAdmin && (
          <div className="ml-4 flex-shrink-0">
            <ProposalActions proposalId={proposal.id} status={proposal.status} />
          </div>
        )}
      </div>

      {/* Details Card */}
      <Card>
        <CardContent className="space-y-6 py-6">
          {/* Organization */}
          {(proposal.organizer.organization || proposal.externalOrganizer) && (
            <div className="flex items-start gap-3">
              <Building2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">Organization</p>
                <p className="text-primary-900">
                  {proposal.organizer.organization || proposal.externalOrganizer}
                </p>
              </div>
            </div>
          )}

          {/* Date & Time */}
          <div className="flex items-start gap-3">
            <Calendar className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-500">Date &amp; Time</p>
              <p className="text-primary-900">
                {formatDate(proposal.date)} at {formatTime(proposal.date)}
              </p>
            </div>
          </div>

          {/* End Date */}
          {proposal.endDate && (
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">End Date &amp; Time</p>
                <p className="text-primary-900">
                  {formatDate(proposal.endDate)} at {formatTime(proposal.endDate)}
                </p>
              </div>
            </div>
          )}

          {/* Location */}
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-500">Location</p>
              <p className="text-primary-900">{proposal.location}</p>
              {proposal.address && (
                <p className="text-sm text-gray-500">{proposal.address}</p>
              )}
            </div>
          </div>

          {/* Max Volunteers */}
          {proposal.maxVolunteers && (
            <div className="flex items-start gap-3">
              <Users className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">Max Volunteers</p>
                <p className="text-primary-900">{proposal.maxVolunteers}</p>
              </div>
            </div>
          )}

          {/* What to Bring */}
          {proposal.whatToBring.length > 0 && (
            <div className="flex items-start gap-3">
              <Package className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">What to Bring</p>
                <ul className="mt-1 list-inside list-disc text-primary-900">
                  {proposal.whatToBring.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Description */}
          {proposal.description && (
            <div className="border-t pt-6">
              <p className="mb-2 text-sm font-medium text-gray-500">Description</p>
              <p className="whitespace-pre-wrap text-primary-900">
                {proposal.description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
