import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FileText, CheckCircle, Clock, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CommunityDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const proposals = await prisma.event.findMany({
    where: {
      organizerId: session.user.id,
      isExternal: true,
    },
    select: { status: true },
  });

  const total = proposals.length;
  const approved = proposals.filter((p) => p.status === "PUBLISHED").length;
  const pending = proposals.filter((p) => p.status === "DRAFT").length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-primary-900">
          Welcome{session.user.organization ? `, ${session.user.organization}` : ""}
        </h1>
        <p className="mt-1 text-gray-600">
          Propose community service events for St. Elias to host.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary-50 p-2">
              <FileText className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary-900">{total}</p>
              <p className="text-sm text-gray-600">Total Proposals</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-50 p-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary-900">{approved}</p>
              <p className="text-sm text-gray-600">Approved</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-50 p-2">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary-900">{pending}</p>
              <p className="text-sm text-gray-600">Pending Review</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action */}
      <Link
        href="/community/proposals/new"
        className="inline-flex items-center gap-2 rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-700"
      >
        <Plus className="h-4 w-4" />
        Submit New Proposal
      </Link>
    </div>
  );
}
