"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} className="space-y-4">
      <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Anmelden</h1>
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
          autoComplete="current-password"
        />
        <FieldError messages={state?.errors?.password} />
      </div>
      {state?.message && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.message}</p>
      )}
      <Button type="submit" disabled={pending} className="w-full justify-center">
        {pending ? "Anmelden…" : "Anmelden"}
      </Button>
      <div className="flex justify-between text-sm text-zinc-500 dark:text-zinc-400">
        <Link href="/signup" className="hover:text-zinc-900 dark:hover:text-zinc-50">
          Konto erstellen
        </Link>
        <Link href="/reset-password" className="hover:text-zinc-900 dark:hover:text-zinc-50">
          Passwort vergessen?
        </Link>
      </div>
    </form>
  );
}
