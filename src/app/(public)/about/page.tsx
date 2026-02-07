import type { Metadata } from "next";
import { Heart, MapPin, Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about St. Elias Orthodox Church's community service mission in Austin, Texas.",
};

export default function AboutPage() {
  return (
    <div className="py-12">
      <Container size="md">
        {/* Hero */}
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-display text-4xl font-bold text-gray-900">
            About Our Mission
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            St. Elias Orthodox Church is committed to serving the Austin community
            through acts of love, compassion, and service.
          </p>
        </div>

        {/* Mission */}
        <div className="mt-16 rounded-2xl bg-primary-50 p-8 sm:p-12">
          <div className="flex items-start gap-4">
            <Heart className="mt-1 h-8 w-8 flex-shrink-0 text-primary-700" />
            <div>
              <h2 className="font-display text-2xl font-bold text-gray-900">
                Our Mission
              </h2>
              <p className="mt-3 text-gray-600 leading-relaxed">
                We believe that serving others is at the heart of our faith. Through
                community service events, volunteer outreach, and collaborative
                ministry, we strive to make a lasting positive impact on the lives
                of those around us. Every act of service, no matter how small,
                reflects God&apos;s love for all people.
              </p>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="mt-16">
          <h2 className="font-display text-2xl font-bold text-gray-900">
            What Drives Us
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900">Compassion</h3>
              <p className="mt-2 text-sm text-gray-500">
                We approach every person and every situation with empathy and
                understanding, recognizing the dignity in all people.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900">Community</h3>
              <p className="mt-2 text-sm text-gray-500">
                We work together as one body, pooling our talents, time, and
                resources to achieve more than we could alone.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900">Action</h3>
              <p className="mt-2 text-sm text-gray-500">
                Faith without works is incomplete. We put our beliefs into practice
                through hands-on service to our neighbors.
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900">Growth</h3>
              <p className="mt-2 text-sm text-gray-500">
                We continually seek new ways to serve, welcoming fresh ideas and
                expanding our impact year after year.
              </p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="mt-16 rounded-2xl bg-gray-50 p-8 sm:p-12">
          <h2 className="font-display text-2xl font-bold text-gray-900">
            Get in Touch
          </h2>
          <p className="mt-2 text-gray-500">
            Want to learn more about our community service ministry? We&apos;d love to
            hear from you.
          </p>
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:gap-8">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Address</p>
                <p className="text-sm text-gray-500">
                  408 East 11th Street, Austin, TX 78701
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-primary-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">Phone</p>
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
      </Container>
    </div>
  );
}
