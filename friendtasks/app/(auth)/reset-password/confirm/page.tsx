"use client";

import { useActionState } from "react";
import { updatePassword } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { FieldError, Label } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { useT } from "@/components/i18n/locale-provider";

export default function ResetPasswordConfirmPage() {
  const [state, action, pending] = useActionState(updatePassword, undefined);
  const t = useT();

  return (
    <form action={action} className="space-y-4">
      <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        {t("auth.newPasswordTitle")}
      </h1>
      <div>
        <Label htmlFor="password">{t("auth.newPassword")}</Label>
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
        <p className="text-sm text-red-600 dark:text-red-400">{state.message}</p>
      )}
      <Button type="submit" disabled={pending} className="w-full justify-center">
        {pending ? t("common.saving") : t("auth.savePassword")}
      </Button>
    </form>
  );
}
