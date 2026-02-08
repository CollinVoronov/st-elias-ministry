import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Megaphone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ShareButtons } from "@/components/ui/ShareButtons";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AnnouncementDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const announcement = await prisma.announcement.findFirst({
    where: { id: params.id, status: "PUBLISHED" },
    include: { author: { select: { name: true } } },
  });

  if (!announcement) notFound();

  return (
    <section className="bg-cream py-16">
      <Container size="md">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-primary-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </Link>

        <div className="mt-6 rounded-2xl border border-accent-200 bg-white p-8 sm:p-12">
          <div className="flex items-center gap-3">
            <Megaphone className="h-6 w-6 text-accent-600" />
            <h1 className="font-display text-2xl font-bold text-primary-900">
              {announcement.title}
            </h1>
          </div>

          <p className="mt-2 text-sm text-gray-400">
            {formatDate(announcement.publishedAt)} · {announcement.author.name}
          </p>

          <div className="mt-3">
            <ShareButtons
              title={announcement.title}
              text={announcement.previewText || announcement.body.slice(0, 120)}
              url={`/announcements/${announcement.id}`}
            />
          </div>

          {announcement.previewText && (
            <p className="mt-4 text-gray-600 italic">{announcement.previewText}</p>
          )}

          <div className="mt-6 whitespace-pre-wrap text-gray-700 leading-relaxed">
            {announcement.body}
          </div>
        </div>
      </Container>
    </section>
  );
}
