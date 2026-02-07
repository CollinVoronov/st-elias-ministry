import type { Metadata } from "next";
import { EB_Garamond, Inter } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-eb-garamond",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

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
    <html lang="en" className={`${ebGaramond.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-cream font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
