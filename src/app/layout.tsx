import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "St. Elias Community Service",
    template: "%s | St. Elias Community Service",
  },
  description:
    "Join St. Elias Orthodox Church in serving our Austin community through volunteer events, community outreach, and acts of compassion.",
  openGraph: {
    title: "St. Elias Community Service",
    description:
      "Join St. Elias Orthodox Church in serving our Austin community.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
