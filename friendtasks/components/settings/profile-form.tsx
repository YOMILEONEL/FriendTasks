"use client";

import { useActionState } from "react";
import { updateProfile } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";

export function ProfileForm({ displayName }: { displayName: string }) {
  const [state, action, pending] = useActionState(updateProfile, undefined);

  return (
    <form action={action} className="max-w-sm space-y-3">
      <div>
        <Label htmlFor="displayName">Anzeigename</Label>
        <Input id="displayName" name="displayName" defaultValue={displayName} required />
        <FieldError messages={state?.errors?.displayName} />
      </div>
      {state?.message && <p className="text-sm text-zinc-600 dark:text-zinc-400">{state.message}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Speichert…" : "Speichern"}
      </Button>
    </form>
  );
}
