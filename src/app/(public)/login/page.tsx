"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Church } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.ok) {
      router.push(callbackUrl);
    } else {
      setError("Invalid email or password.");
    }
    setLoading(false);
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

      <form onSubmit={handleLogin} className="mt-8 space-y-4">
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
          id="email"
          type="email"
          placeholder="organizer@sainteliaschurch.org"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Password"
          id="password"
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && (
          <p className="text-center text-sm text-red-600">{error}</p>
        )}
        <Button type="submit" size="lg" className="w-full" isLoading={loading}>
          Sign In
        </Button>
        <p className="text-center text-xs text-gray-400">
          Only authorized organizers and admins can log in.
        </p>
      </form>
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
