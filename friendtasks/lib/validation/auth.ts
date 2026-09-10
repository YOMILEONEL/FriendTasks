import * as z from "zod";

export const SignupSchema = z
  .object({
    displayName: z.string().trim().min(2, "Mindestens 2 Zeichen."),
    email: z.email("Bitte eine gültige E-Mail-Adresse eingeben."),
    password: z
      .string()
      .min(8, "Mindestens 8 Zeichen.")
      .regex(/[a-zA-Z]/, "Mindestens ein Buchstabe.")
      .regex(/[0-9]/, "Mindestens eine Zahl."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Passwörter stimmen nicht überein.",
    path: ["confirmPassword"],
  });

export const LoginSchema = z.object({
  email: z.email("Bitte eine gültige E-Mail-Adresse eingeben."),
  password: z.string().min(1, "Bitte Passwort eingeben."),
});

export const RequestPasswordResetSchema = z.object({
  email: z.email("Bitte eine gültige E-Mail-Adresse eingeben."),
});

export const UpdatePasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Mindestens 8 Zeichen.")
      .regex(/[a-zA-Z]/, "Mindestens ein Buchstabe.")
      .regex(/[0-9]/, "Mindestens eine Zahl."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Passwörter stimmen nicht überein.",
    path: ["confirmPassword"],
  });

export type FormState =
  | {
      errors?: Record<string, string[]>;
      message?: string;
    }
  | undefined;
