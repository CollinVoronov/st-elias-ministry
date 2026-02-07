"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [organization, setOrganization] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, organization }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      // Auto sign-in after registration
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.ok) {
        router.push("/community");
      } else {
        // Registration succeeded but auto-login failed — redirect to login
        router.push("/login");
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center py-12">
      <div className="mx-auto w-full max-w-sm px-4">
        <div className="text-center">
          <Image
            src="/logo.avif"
            alt="St. Elias"
            width={40}
            height={40}
            className="mx-auto rounded"
          />
          <h1 className="mt-4 font-display text-2xl font-bold text-primary-900">
            Create Account
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Register your community organization to propose events.
          </p>
        </div>

        <form onSubmit={handleRegister} className="mt-8 space-y-4">
          <Input
            label="Your Name"
            id="name"
            type="text"
            placeholder="John Smith"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Email"
            id="email"
            type="email"
            placeholder="you@organization.org"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            id="password"
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Input
            label="Organization Name"
            id="organization"
            type="text"
            placeholder="Austin Food Bank"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            required
          />
          {error && (
            <p className="text-center text-sm text-red-600">{error}</p>
          )}
          <Button type="submit" size="lg" className="w-full" isLoading={loading}>
            Create Account
          </Button>
          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-accent-600 hover:text-accent-700">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
