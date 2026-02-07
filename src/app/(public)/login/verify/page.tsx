import { Mail } from "lucide-react";
import { Container } from "@/components/ui/Container";

export default function VerifyPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center py-12">
      <Container size="sm">
        <div className="mx-auto max-w-sm text-center">
          <Mail className="mx-auto h-12 w-12 text-primary-600" />
          <h1 className="mt-4 font-display text-2xl font-bold text-gray-900">
            Check Your Email
          </h1>
          <p className="mt-3 text-gray-500">
            A sign-in link has been sent to your email address. Click the link in
            the email to sign in to the admin panel.
          </p>
          <p className="mt-6 text-xs text-gray-400">
            If you don&apos;t see the email, check your spam folder.
          </p>
        </div>
      </Container>
    </div>
  );
}
