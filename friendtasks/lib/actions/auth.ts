"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrigin } from "@/lib/utils/url";
import {
  LoginSchema,
  RequestPasswordResetSchema,
  SignupSchema,
  UpdatePasswordSchema,
  type FormState,
} from "@/lib/validation/auth";

export async function signup(state: FormState, formData: FormData): Promise<FormState> {
  const validated = SignupSchema.safeParse({
    displayName: formData.get("displayName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const { displayName, email, password } = validated.data;
  const supabase = await createClient();
  const origin = await getOrigin();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { message: error.message };
  }

  // "Confirm email" is disabled in the Supabase project: signUp() already
  // returns an active session, so log the user straight in.
  if (data.session) {
    redirect("/today");
  }

  return {
    message:
      "Konto erstellt. Bitte prüfe dein E-Mail-Postfach, um deine Adresse zu bestätigen.",
  };
}

export async function login(state: FormState, formData: FormData): Promise<FormState> {
  const validated = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(validated.data);

  if (error) {
    return { message: "E-Mail oder Passwort ist falsch." };
  }

  redirect("/today");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function requestPasswordReset(
  state: FormState,
  formData: FormData
): Promise<FormState> {
  const validated = RequestPasswordResetSchema.safeParse({
    email: formData.get("email"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const supabase = await createClient();
  const origin = await getOrigin();

  await supabase.auth.resetPasswordForEmail(validated.data.email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password/confirm`,
  });

  // Always show the same message, whether or not the address exists, to
  // avoid leaking which emails are registered.
  return {
    message: "Falls die Adresse existiert, wurde eine E-Mail zum Zurücksetzen verschickt.",
  };
}

export async function updatePassword(
  state: FormState,
  formData: FormData
): Promise<FormState> {
  const validated = UpdatePasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { message: "Sitzung abgelaufen. Bitte fordere einen neuen Link an." };
  }

  const { error } = await supabase.auth.updateUser({ password: validated.data.password });
  if (error) {
    return { message: error.message };
  }

  redirect("/today");
}
