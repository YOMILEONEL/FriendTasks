"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { useT } from "@/components/i18n/locale-provider";

export default function ResetPasswordPage() {
  const [state, action, pending] = useActionState(requestPasswordReset, undefined);
  const t = useT();

  return (
    <form action={action} className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          {t("auth.resetPasswordTitle")}
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {t("auth.resetPasswordSubtitle")}
        </p>
      </div>
      <div>
        <Label htmlFor="email">{t("auth.email")}</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
        <FieldError messages={state?.errors?.email} />
      </div>
      {state?.message && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{state.message}</p>
      )}
      <Button type="submit" disabled={pending} className="w-full justify-center">
        {pending ? t("auth.sending") : t("auth.sendLink")}
      </Button>
      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
        <Link href="/login" className="hover:text-zinc-900 dark:hover:text-zinc-50">
          {t("auth.backToLogin")}
        </Link>
      </p>
    </form>
  );
}
