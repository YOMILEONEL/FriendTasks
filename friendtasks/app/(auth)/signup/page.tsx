"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { signup } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { useT } from "@/components/i18n/locale-provider";

export default function SignupPage() {
  const [state, action, pending] = useActionState(signup, undefined);
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const t = useT();

  return (
    <form action={action} className="space-y-4">
      <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{t("auth.createAccount")}</h1>
      {next && <input type="hidden" name="next" value={next} />}
      <div>
        <Label htmlFor="displayName">{t("auth.displayName")}</Label>
        <Input id="displayName" name="displayName" required autoComplete="nickname" />
        <FieldError messages={state?.errors?.displayName} />
      </div>
      <div>
        <Label htmlFor="email">{t("auth.email")}</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
        <FieldError messages={state?.errors?.email} />
      </div>
      <div>
        <Label htmlFor="password">{t("auth.password")}</Label>
        <PasswordInput id="password" name="password" required autoComplete="new-password" />
        <FieldError messages={state?.errors?.password} />
      </div>
      <div>
        <Label htmlFor="confirmPassword">{t("auth.confirmPassword")}</Label>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          required
          autoComplete="new-password"
        />
        <FieldError messages={state?.errors?.confirmPassword} />
      </div>
      {state?.message && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{state.message}</p>
      )}
      <Button type="submit" disabled={pending} className="w-full justify-center">
        {pending ? t("auth.creatingAccount") : t("auth.createAccount")}
      </Button>
      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
        {t("auth.alreadyRegistered")}{" "}
        <Link
          href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}
          className="text-zinc-900 hover:underline dark:text-zinc-50"
        >
          {t("auth.login")}
        </Link>
      </p>
    </form>
  );
}
