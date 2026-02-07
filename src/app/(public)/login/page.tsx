"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Church, Mail } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Credentials login state
  const [credEmail, setCredEmail] = useState("");
  const [credPassword, setCredPassword] = useState("");
  const [credLoading, setCredLoading] = useState(false);
  const [credError, setCredError] = useState("");

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await signIn("email", { email, callbackUrl, redirect: false });
    setSubmitted(true);
    setLoading(false);
  };

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredLoading(true);
    setCredError("");

    const result = await signIn("credentials", {
      email: credEmail,
      password: credPassword,
      redirect: false,
    });

    if (result?.ok) {
      router.push(callbackUrl);
    } else {
      setCredError("Invalid email or password.");
    }
    setCredLoading(false);
  };

  return (
    <>
      <div className="text-center">
        <Church className="mx-auto h-10 w-10 text-primary-700" />
        <h1 className="mt-4 font-display text-2xl font-bold text-primary-900">
          Organizer Login
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Sign in to manage events and volunteers.
        </p>
      </div>

      {submitted ? (
        <div className="mt-8 rounded-xl border border-primary-200 bg-primary-50 p-6 text-center">
          <Mail className="mx-auto h-8 w-8 text-primary-600" />
          <h2 className="mt-3 text-lg font-semibold text-primary-900">
            Check your email
          </h2>
          <p className="mt-1 text-sm text-primary-700">
            We sent a magic link to <strong>{email}</strong>. Click it to sign
            in.
          </p>
        </div>
      ) : (
        <>
          <form onSubmit={handleMagicLink} className="mt-8 space-y-4">
            <Input
              label="Email Address"
              id="email"
              type="email"
              placeholder="organizer@sainteliaschurch.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" size="lg" className="w-full" isLoading={loading}>
              Send Magic Link
            </Button>
            <p className="text-center text-xs text-gray-400">
              Only authorized organizers and admins can log in.
            </p>
          </form>

          {/* Divider */}
          <div className="mt-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-400">OR</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          {/* Test Account Login */}
          <form onSubmit={handleCredentialsLogin} className="mt-6 space-y-4">
            <div className="rounded-lg border border-accent-200 bg-accent-50 p-3">
              <p className="text-xs font-medium text-accent-800">
                Test Account
              </p>
              <p className="mt-1 text-xs text-accent-700">
                Email: organizer@sainteliaschurch.org
              </p>
              <p className="text-xs text-accent-700">
                Password: testpassword123
              </p>
            </div>
            <Input
              label="Email"
              id="cred-email"
              type="email"
              placeholder="organizer@sainteliaschurch.org"
              value={credEmail}
              onChange={(e) => setCredEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              id="cred-password"
              type="password"
              placeholder="Enter password"
              value={credPassword}
              onChange={(e) => setCredPassword(e.target.value)}
              required
            />
            {credError && (
              <p className="text-center text-sm text-red-600">{credError}</p>
            )}
            <Button
              type="submit"
              size="lg"
              variant="outline"
              className="w-full"
              isLoading={credLoading}
            >
              Sign In with Password
            </Button>
          </form>
        </>
      )}
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center py-12">
      <div className="mx-auto w-full max-w-sm px-4">
        <Suspense fallback={
          <div className="text-center">
            <Church className="mx-auto h-10 w-10 text-primary-700" />
            <h1 className="mt-4 font-display text-2xl font-bold text-primary-900">
              Organizer Login
            </h1>
            <p className="mt-2 text-sm text-gray-600">Loading...</p>
          </div>
        }>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
