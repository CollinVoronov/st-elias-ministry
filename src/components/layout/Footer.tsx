import Link from "next/link";
import { Church, MapPin, Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";

export function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-gray-50">
      <Container>
        <div className="grid gap-8 py-12 md:grid-cols-3">
          {/* Church Info */}
          <div>
            <div className="flex items-center gap-2">
              <Church className="h-6 w-6 text-primary-700" />
              <span className="font-display text-lg font-bold text-gray-900">
                St. Elias Orthodox Church
              </span>
            </div>
            <p className="mt-3 text-sm text-gray-500">
              Serving our community through love, compassion, and action.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
              Quick Links
            </h3>
            <nav className="mt-3 flex flex-col gap-2">
              <Link href="/events" className="text-sm text-gray-500 hover:text-primary-700">
                Upcoming Events
              </Link>
              <Link href="/ideas" className="text-sm text-gray-500 hover:text-primary-700">
                Share an Idea
              </Link>
              <Link href="/impact" className="text-sm text-gray-500 hover:text-primary-700">
                Our Impact
              </Link>
              <Link href="/about" className="text-sm text-gray-500 hover:text-primary-700">
                About Us
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
              Contact
            </h3>
            <div className="mt-3 flex flex-col gap-3">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                <p className="text-sm text-gray-500">
                  408 East 11th Street<br />
                  Austin, Texas 78701
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <a
                  href="tel:+15124762314"
                  className="text-sm text-gray-500 hover:text-primary-700"
                >
                  (512) 476-2314
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 py-6 text-center">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} St. Elias Orthodox Church. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
