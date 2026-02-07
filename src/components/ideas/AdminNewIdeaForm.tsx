"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { ideaSchema, type IdeaInput } from "@/lib/validations";

interface AdminNewIdeaFormProps {
  submitterName: string;
  submitterEmail: string;
}

export function AdminNewIdeaForm({ submitterName, submitterEmail }: AdminNewIdeaFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IdeaInput>({
    resolver: zodResolver(ideaSchema),
    defaultValues: {
      submitterName,
      submitterEmail,
    },
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
        setServerError(err.error || "Failed to create idea.");
        return;
      }

      router.push("/admin/ideas");
      router.refresh();
    } catch {
      setServerError("Something went wrong. Please try again.");
    }
  };

  return (
    <Container size="md">
      <Link
        href="/admin/ideas"
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-primary-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Ideas
      </Link>

      <h1 className="mt-4 font-display text-2xl font-bold text-primary-900">
        Create New Idea
      </h1>

      <Card className="mt-6">
        <CardHeader>
          <h2 className="text-lg font-semibold text-primary-900">Idea Details</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {serverError && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {serverError}
              </div>
            )}

            <Input
              label="Title"
              id="title"
              required
              placeholder="e.g., Monthly neighborhood cleanup"
              error={errors.title?.message}
              {...register("title")}
            />

            <Textarea
              label="Description"
              id="description"
              placeholder="Describe the idea — what would we do, who would it help?"
              error={errors.description?.message}
              {...register("description")}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Submitter Name"
                id="submitterName"
                required
                error={errors.submitterName?.message}
                {...register("submitterName")}
              />
              <Input
                label="Submitter Email"
                id="submitterEmail"
                required
                type="email"
                error={errors.submitterEmail?.message}
                {...register("submitterEmail")}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Link href="/admin/ideas">
                <Button variant="ghost" type="button">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" isLoading={isSubmitting}>
                Create Idea
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}
