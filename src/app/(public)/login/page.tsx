"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Church, Mail } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await signIn("email", { email, redirect: false });
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center py-12">
      <div className="mx-auto w-full max-w-sm px-4">
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
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
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
        )}
      </div>
    </div>
  );
}
