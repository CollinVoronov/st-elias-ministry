"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "";

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
      // Fetch session to determine role-based redirect
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      const role = session?.user?.role;

      if (callbackUrl) {
        router.push(callbackUrl);
      } else if (role === "COMMUNITY") {
        router.push("/community");
      } else {
        router.push("/admin");
      }
    } else {
      setError("Invalid email or password.");
    }
    setLoading(false);
  };

  return (
    <>
      <div className="text-center">
        <Image
          src="/logo.avif"
          alt="St. Elias"
          width={40}
          height={40}
          className="mx-auto rounded"
        />
        <h1 className="mt-4 font-display text-2xl font-bold text-primary-900">
          Sign In
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Sign in to manage events and proposals.
        </p>
      </div>

      <form onSubmit={handleLogin} className="mt-8 space-y-4">
        <Input
          label="Email"
          id="email"
          type="email"
          placeholder="you@example.org"
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
        <p className="text-center text-sm text-gray-600">
          Community organization?{" "}
          <Link href="/register" className="font-medium text-accent-600 hover:text-accent-700">
            Register here
          </Link>
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
            <Image
              src="/logo.avif"
              alt="St. Elias"
              width={40}
              height={40}
              className="mx-auto rounded"
            />
            <h1 className="mt-4 font-display text-2xl font-bold text-primary-900">
              Sign In
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
