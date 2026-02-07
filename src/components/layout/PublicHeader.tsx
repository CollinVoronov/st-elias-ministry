import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-accent-200 bg-cream shadow-sm">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.avif" alt="St. Elias" width={32} height={32} className="rounded" />
            <div className="flex flex-col">
              <span className="font-display text-lg font-semibold leading-tight text-primary-900">
                St. Elias
              </span>
              <span className="text-xs leading-tight text-primary-600">
                Community Service
              </span>
            </div>
          </Link>

          <Link
            href="/login"
            className="rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-700"
          >
            Organizer Login
          </Link>
        </div>
      </Container>
    </header>
  );
}
