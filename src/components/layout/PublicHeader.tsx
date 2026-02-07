import Link from "next/link";
import { Church } from "lucide-react";
import { Container } from "@/components/ui/Container";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-primary-800 bg-primary-900 shadow-md">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Church className="h-7 w-7 text-accent-400" />
            <div className="flex flex-col">
              <span className="font-display text-lg font-semibold leading-tight text-white">
                St. Elias
              </span>
              <span className="text-xs leading-tight text-primary-300">
                Community Service
              </span>
            </div>
          </Link>

          <Link
            href="/login"
            className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-600"
          >
            Organizer Login
          </Link>
        </div>
      </Container>
    </header>
  );
}
