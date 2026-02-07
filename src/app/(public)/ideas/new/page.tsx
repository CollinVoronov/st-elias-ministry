"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lightbulb, CheckCircle2 } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { ideaSchema, type IdeaInput } from "@/lib/validations";

export default function NewIdeaPage() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IdeaInput>({
    resolver: zodResolver(ideaSchema),
  });

  const onSubmit = async (data: IdeaInput) => {
    setServerError("");
    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        setServerError(err.error || "Something went wrong.");
        return;
      }

      setSubmitted(true);
    } catch {
      setServerError("Something went wrong. Please try again.");
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center py-12">
        <div className="mx-auto max-w-sm text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
          <h2 className="mt-4 font-display text-2xl font-bold text-gray-900">
            Idea Submitted!
          </h2>
          <p className="mt-2 text-gray-500">
            Thank you for sharing your idea. Our team will review it and the
            community can vote on it.
          </p>
          <Button
            variant="outline"
            className="mt-6"
            onClick={() => router.push("/ideas")}
          >
            Back to Idea Board
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <Container size="sm">
        <div className="mx-auto max-w-lg">
          <div className="text-center">
            <Lightbulb className="mx-auto h-10 w-10 text-gold-500" />
            <h1 className="mt-4 font-display text-3xl font-bold text-gray-900">
              Submit a Service Idea
            </h1>
            <p className="mt-2 text-gray-500">
              Have an idea for how we can serve our community? Share it and let
              others vote!
            </p>
          </div>

          <Card className="mt-8">
            <CardContent className="py-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {serverError && (
                  <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                    {serverError}
                  </div>
                )}

                <Input
                  label="Idea Title"
                  id="title"
                  placeholder="e.g., Monthly neighborhood cleanup"
                  error={errors.title?.message}
                  {...register("title")}
                />

                <Textarea
                  label="Description"
                  id="description"
                  placeholder="Describe your idea — what would we do, who would it help, and what would we need?"
                  error={errors.description?.message}
                  {...register("description")}
                />

                <Input
                  label="Your Name"
                  id="submitterName"
                  placeholder="Enter your name"
                  error={errors.submitterName?.message}
                  {...register("submitterName")}
                />

                <Input
                  label="Your Email"
                  id="submitterEmail"
                  type="email"
                  placeholder="your@email.com"
                  error={errors.submitterEmail?.message}
                  {...register("submitterEmail")}
                />

                <Button type="submit" size="lg" className="w-full" isLoading={isSubmitting}>
                  Submit Idea
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  );
}
