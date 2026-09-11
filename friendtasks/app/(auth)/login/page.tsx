"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { login } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { useT } from "@/components/i18n/locale-provider";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const t = useT();

  return (
    <form action={action} className="space-y-4">
      <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{t("auth.login")}</h1>
      {next && <input type="hidden" name="next" value={next} />}
      <div>
        <Label htmlFor="email">{t("auth.email")}</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
        <FieldError messages={state?.errors?.email} />
      </div>
      <div>
        <Label htmlFor="password">{t("auth.password")}</Label>
        <PasswordInput id="password" name="password" required autoComplete="current-password" />
        <FieldError messages={state?.errors?.password} />
      </div>
      {state?.message && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.message}</p>
      )}
      <Button type="submit" disabled={pending} className="w-full justify-center">
        {pending ? t("auth.loggingIn") : t("auth.login")}
      </Button>
      <div className="flex justify-between text-sm text-zinc-500 dark:text-zinc-400">
        <Link
          href={next ? `/signup?next=${encodeURIComponent(next)}` : "/signup"}
          className="hover:text-zinc-900 dark:hover:text-zinc-50"
        >
          {t("auth.createAccount")}
        </Link>
        <Link href="/reset-password" className="hover:text-zinc-900 dark:hover:text-zinc-50">
          {t("auth.forgotPassword")}
        </Link>
      </div>
    </form>
  );
}
