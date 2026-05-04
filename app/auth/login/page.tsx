"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { InlineFeedback } from "@/components/shared/feedback/inline-feedback";
import { LoginForm } from "@/features/auth/components/login-form";
import { LoginFormValues } from "@/features/auth/schema";
import { getErrorMessage } from "@/lib/api/error";
import { t } from "@/lib/i18n";
import { useAuth } from "@/providers/auth-provider";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoggingIn } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(values: LoginFormValues) {
    setErrorMessage(null);

    try {
      await login(values);
      const nextPath = searchParams.get("next") || "/";
      router.replace(nextPath);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, t("auth.errors.loginFailed")));
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-10">
      <section className="w-full rounded-lg border border-gray-100 bg-card p-5 shadow-sm">
        <h1 className="text-xl font-semibold text-foreground">{t("auth.login.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("auth.login.description")}</p>

        <LoginForm onSubmit={handleSubmit} isSubmitting={isLoggingIn} />

        {errorMessage ? (
          <InlineFeedback tone="danger" message={errorMessage} className="mt-4" />
        ) : null}

        <p className="mt-4 text-sm text-muted-foreground">
          {t("auth.login.noAccount")}{" "}
          <Link href="/auth/register" className="text-primary underline-offset-4 hover:underline">
            {t("auth.login.goToRegister")}
          </Link>
        </p>
      </section>
    </main>
  );
}
