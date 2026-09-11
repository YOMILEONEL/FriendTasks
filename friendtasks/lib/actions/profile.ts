"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { refresh, revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifySession } from "@/lib/data/dal";
import { LOCALE_COOKIE, type Locale } from "@/lib/i18n/config";
import type { FormState } from "@/lib/validation/auth";

export async function updateProfile(state: FormState, formData: FormData): Promise<FormState> {
  const session = await verifySession();
  const displayName = String(formData.get("displayName") ?? "").trim();
  const color = String(formData.get("color") ?? "");

  if (displayName.length < 2) {
    return { errors: { displayName: ["Mindestens 2 Zeichen."] } };
  }
  if (!/^#[0-9a-fA-F]{6}$/.test(color)) {
    return { message: "Ungültige Farbe." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ display_name: displayName, color })
    .eq("id", session.userId);

  if (error) {
    return { message: error.message };
  }

  revalidatePath("/settings", "layout");
  revalidatePath("/groups", "layout");
  revalidatePath("/lists", "layout");
  return { message: "Profil aktualisiert." };
}

export async function setTheme(theme: "light" | "dark") {
  const cookieStore = await cookies();
  cookieStore.set("theme", theme, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  refresh();
}

export async function setLocale(locale: Locale) {
  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  refresh();
}

export async function deleteAccount() {
  const session = await verifySession();
  const admin = createAdminClient();

  // Cascades through profiles -> todos/groups/tags/... via FK "on delete cascade".
  const { error } = await admin.auth.admin.deleteUser(session.userId);
  if (error) throw new Error(error.message);

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
