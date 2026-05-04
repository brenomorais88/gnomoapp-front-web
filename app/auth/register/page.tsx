"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { InlineFeedback } from "@/components/shared/feedback/inline-feedback";
import { RegisterForm } from "@/features/auth/components/register-form";
import { RegisterFormValues } from "@/features/auth/schema";
import { getErrorMessage } from "@/lib/api/error";
import { t } from "@/lib/i18n";
import { useAuth } from "@/providers/auth-provider";

export default function RegisterPage() {
  const router = useRouter();
  const { register, isRegistering } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(values: RegisterFormValues) {
    setErrorMessage(null);

    try {
      await register({
        firstName: values.firstName,
        lastName: values.lastName,
        document: values.document,
        birthDate: values.birthDate,
        password: values.password,
        phone: values.phone || undefined,
        email: values.email || undefined,
      });
      router.replace("/");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, t("auth.errors.registerFailed")));
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-10">
      <section className="w-full rounded-lg border border-gray-100 bg-card p-5 shadow-sm">
        <h1 className="text-xl font-semibold text-foreground">{t("auth.register.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("auth.register.description")}</p>

        <RegisterForm onSubmit={handleSubmit} isSubmitting={isRegistering} />

        {errorMessage ? (
          <InlineFeedback tone="danger" message={errorMessage} className="mt-4" />
        ) : null}

        <p className="mt-4 text-sm text-muted-foreground">
          {t("auth.register.hasAccount")}{" "}
          <Link href="/auth/login" className="text-primary underline-offset-4 hover:underline">
            {t("auth.register.goToLogin")}
          </Link>
        </p>
      </section>
    </main>
  );
}
