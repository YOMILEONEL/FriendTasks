"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signup } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";

export default function SignupPage() {
  const [state, action, pending] = useActionState(signup, undefined);

  return (
    <form action={action} className="space-y-4">
      <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Konto erstellen</h1>
      <div>
        <Label htmlFor="displayName">Anzeigename</Label>
        <Input id="displayName" name="displayName" required autoComplete="nickname" />
        <FieldError messages={state?.errors?.displayName} />
      </div>
      <div>
        <Label htmlFor="email">E-Mail</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
        <FieldError messages={state?.errors?.email} />
      </div>
      <div>
        <Label htmlFor="password">Passwort</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
        />
        <FieldError messages={state?.errors?.password} />
      </div>
      <div>
        <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          autoComplete="new-password"
        />
        <FieldError messages={state?.errors?.confirmPassword} />
      </div>
      {state?.message && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{state.message}</p>
      )}
      <Button type="submit" disabled={pending} className="w-full justify-center">
        {pending ? "Erstellt Konto…" : "Konto erstellen"}
      </Button>
      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
        Bereits registriert?{" "}
        <Link href="/login" className="text-zinc-900 hover:underline dark:text-zinc-50">
          Anmelden
        </Link>
      </p>
    </form>
  );
}
