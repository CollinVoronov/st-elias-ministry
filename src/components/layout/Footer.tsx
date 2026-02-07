import Link from "next/link";
import { Church, MapPin, Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";

export function Footer() {
  return (
    <footer className="bg-primary-900 text-primary-200">
      <Container>
        <div className="grid gap-8 py-12 md:grid-cols-3">
          {/* Church Info */}
          <div>
            <div className="flex items-center gap-2">
              <Church className="h-6 w-6 text-accent-400" />
              <span className="font-display text-lg font-semibold text-white">
                St. Elias Orthodox Church
              </span>
            </div>
            <p className="mt-3 text-sm text-primary-300">
              Serving our community through love, compassion, and action.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-accent-400">
              Quick Links
            </h3>
            <nav className="mt-3 flex flex-col gap-2">
              <Link href="/#events" className="text-sm text-primary-300 hover:text-white">
                Events
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-accent-400">
              Contact
            </h3>
            <div className="mt-3 flex flex-col gap-3">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-400" />
                <p className="text-sm text-primary-300">
                  408 East 11th Street<br />
                  Austin, Texas 78701
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary-400" />
                <a
                  href="tel:+15124762314"
                  className="text-sm text-primary-300 hover:text-white"
                >
                  (512) 476-2314
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-800 py-6 text-center">
          <p className="text-xs text-primary-400">
            &copy; {new Date().getFullYear()} St. Elias Orthodox Church. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
