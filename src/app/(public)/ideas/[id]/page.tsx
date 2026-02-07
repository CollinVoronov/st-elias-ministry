import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ThumbsUp, MessageCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
}

const statusBadgeVariant: Record<string, "default" | "info" | "success" | "warning"> = {
  SUBMITTED: "default",
  UNDER_REVIEW: "info",
  APPROVED: "success",
  IN_PLANNING: "warning",
};

async function getIdea(id: string) {
  return prisma.idea.findUnique({
    where: { id },
    include: {
      _count: { select: { votes: true, comments: true } },
      comments: {
        where: { parentId: null },
        orderBy: { createdAt: "desc" },
        include: {
          replies: {
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const idea = await getIdea(params.id);
  if (!idea) return { title: "Idea Not Found" };
  return { title: idea.title };
}

export default async function IdeaDetailPage({ params }: Props) {
  const idea = await getIdea(params.id);

  if (!idea) notFound();

  return (
    <div className="py-12">
      <Container size="md">
        <Link
          href="/ideas"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Ideas
        </Link>

        <div className="mt-6">
          <Badge variant={statusBadgeVariant[idea.status] || "default"}>
            {idea.status.replace("_", " ")}
          </Badge>
          <h1 className="mt-3 font-display text-3xl font-bold text-gray-900">
            {idea.title}
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Submitted by {idea.submitterName} on{" "}
            {new Date(idea.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>

          <div className="mt-4 flex items-center gap-4">
            <span className="flex items-center gap-1 text-sm text-gray-500">
              <ThumbsUp className="h-4 w-4" />
              {idea._count.votes} vote{idea._count.votes !== 1 ? "s" : ""}
            </span>
            <span className="flex items-center gap-1 text-sm text-gray-500">
              <MessageCircle className="h-4 w-4" />
              {idea._count.comments} comment{idea._count.comments !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="mt-8 whitespace-pre-wrap text-gray-600 leading-relaxed">
            {idea.description}
          </div>

          {/* Comments Section */}
          <div className="mt-12 border-t border-gray-200 pt-8">
            <h2 className="text-lg font-semibold text-gray-900">
              Comments ({idea._count.comments})
            </h2>

            {idea.comments.length > 0 ? (
              <div className="mt-4 space-y-4">
                {idea.comments.map((comment) => (
                  <div key={comment.id} className="rounded-lg bg-gray-50 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {comment.authorName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">{comment.body}</p>

                    {comment.replies.length > 0 && (
                      <div className="mt-3 space-y-3 border-l-2 border-gray-200 pl-4">
                        {comment.replies.map((reply) => (
                          <div key={reply.id}>
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900">
                                {reply.authorName}
                              </p>
                              <p className="text-xs text-gray-400">
                                {new Date(reply.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <p className="mt-1 text-sm text-gray-600">
                              {reply.body}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-gray-400">
                No comments yet. Be the first to share your thoughts!
              </p>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
