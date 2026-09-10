"use client";

import { useActionState } from "react";
import { updatePassword } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { FieldError, Label } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";

export default function ResetPasswordConfirmPage() {
  const [state, action, pending] = useActionState(updatePassword, undefined);

  return (
    <form action={action} className="space-y-4">
      <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        Neues Passwort festlegen
      </h1>
      <div>
        <Label htmlFor="password">Neues Passwort</Label>
        <PasswordInput id="password" name="password" required autoComplete="new-password" />
        <FieldError messages={state?.errors?.password} />
      </div>
      <div>
        <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
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
        {pending ? "Speichert…" : "Passwort speichern"}
      </Button>
    </form>
  );
}
