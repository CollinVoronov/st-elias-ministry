import type { Metadata } from "next";
import Link from "next/link";
import { Lightbulb, ThumbsUp, MessageCircle } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Idea Board",
  description: "Share and vote on community service ideas at St. Elias Orthodox Church.",
};

const statusBadgeVariant: Record<string, "default" | "info" | "success" | "warning"> = {
  SUBMITTED: "default",
  UNDER_REVIEW: "info",
  APPROVED: "success",
  IN_PLANNING: "warning",
};

async function getIdeas() {
  return prisma.idea.findMany({
    where: {
      status: { not: "DECLINED" },
    },
    include: {
      _count: { select: { votes: true, comments: true } },
    },
    orderBy: [
      { votes: { _count: "desc" } },
      { createdAt: "desc" },
    ],
  });
}

export default async function IdeasPage() {
  const ideas = await getIdeas();

  return (
    <div className="py-12">
      <Container>
        <SectionHeader
          title="Community Idea Board"
          description="Have an idea for a community service event? Share it here and let others vote!"
          action={
            <Link href="/ideas/new">
              <Button>
                <Lightbulb className="h-4 w-4" />
                Submit an Idea
              </Button>
            </Link>
          }
        />

        {ideas.length > 0 ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ideas.map((idea) => (
              <Link key={idea.id} href={`/ideas/${idea.id}`}>
                <Card className="group h-full transition-shadow hover:shadow-md">
                  <CardContent>
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant={statusBadgeVariant[idea.status] || "default"}>
                        {idea.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-gray-900 group-hover:text-primary-700">
                      {idea.title}
                    </h3>
                    <p className="mt-1 line-clamp-3 text-sm text-gray-500">
                      {idea.description}
                    </p>
                    <div className="mt-4 flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4" />
                        {idea._count.votes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        {idea._count.comments}
                      </span>
                    </div>
                    <p className="mt-3 text-xs text-gray-400">
                      By {idea.submitterName}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-8">
            <EmptyState
              icon={Lightbulb}
              title="No ideas yet"
              description="Be the first to share a community service idea! Your suggestion could become our next event."
              action={
                <Link href="/ideas/new">
                  <Button>Submit an Idea</Button>
                </Link>
              }
            />
          </div>
        )}
      </Container>
    </div>
  );
}
