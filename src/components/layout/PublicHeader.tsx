"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Church } from "lucide-react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/Container";

const navLinks = [
  { href: "/events", label: "Events" },
  { href: "/ideas", label: "Ideas" },
  { href: "/impact", label: "Our Impact" },
  { href: "/about", label: "About" },
];

export function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-primary-800 bg-primary-900 shadow-md">
      <Container>
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
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

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-primary-800 text-accent-400"
                    : "text-primary-200 hover:bg-primary-800 hover:text-white"
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              className="ml-3 rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-600"
            >
              Organizer Login
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-primary-200" />
            ) : (
              <Menu className="h-6 w-6 text-primary-200" />
            )}
          </button>
        </div>
      </Container>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-primary-800 bg-primary-900 md:hidden">
          <Container>
            <nav className="flex flex-col gap-1 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    pathname === link.href
                      ? "bg-primary-800 text-accent-400"
                      : "text-primary-200 hover:bg-primary-800"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/login"
                className="mt-2 rounded-lg bg-accent-500 px-4 py-2 text-center text-sm font-medium text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Organizer Login
              </Link>
            </nav>
          </Container>
        </div>
      )}
    </header>
  );
}
