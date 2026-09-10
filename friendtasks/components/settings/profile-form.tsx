"use client";

import { useActionState, useState } from "react";
import { updateProfile } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";

const COLORS = ["#6366f1", "#71717a", "#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#a855f7", "#ec4899"];

export function ProfileForm({ displayName, color }: { displayName: string; color: string }) {
  const [state, action, pending] = useActionState(updateProfile, undefined);
  const [selectedColor, setSelectedColor] = useState(color);

  return (
    <form action={action} className="max-w-sm space-y-3">
      <div>
        <Label htmlFor="displayName">Anzeigename</Label>
        <Input id="displayName" name="displayName" defaultValue={displayName} required />
        <FieldError messages={state?.errors?.displayName} />
      </div>
      <div>
        <Label>Farbe zur Wiedererkennung</Label>
        <input type="hidden" name="color" value={selectedColor} />
        <div className="flex gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setSelectedColor(c)}
              aria-label={`Farbe ${c} auswählen`}
              aria-pressed={selectedColor === c}
              style={{ backgroundColor: c }}
              className={`h-8 w-8 rounded-full transition-shadow ${
                selectedColor === c
                  ? "ring-2 ring-offset-2 ring-zinc-900 dark:ring-offset-zinc-950 dark:ring-zinc-50"
                  : "opacity-50 hover:opacity-80"
              }`}
            />
          ))}
        </div>
      </div>
      {state?.message && <p className="text-sm text-zinc-600 dark:text-zinc-400">{state.message}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Speichert…" : "Speichern"}
      </Button>
    </form>
  );
}
