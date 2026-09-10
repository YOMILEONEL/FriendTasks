import * as z from "zod";

export const PrioritySchema = z.enum(["low", "medium", "high"]);

// A stray, browser-supplied "00:00" (or similar) in an untouched <input
// type="time"> shouldn't block creating a todo that was never meant to have
// a time — so rather than rejecting an impossible combination (time without
// a date, end without a start), silently drop the parts that don't make
// sense instead of erroring on them.
export const TodoInputSchema = z
  .object({
    title: z.string().trim().min(1, "Titel darf nicht leer sein.").max(200),
    description: z.string().trim().max(2000).optional().or(z.literal("")),
    dueDate: z.string().optional().or(z.literal("")),
    dueTime: z
      .string()
      .regex(/^\d{2}:\d{2}$/)
      .optional()
      .or(z.literal("")),
    dueTimeEnd: z
      .string()
      .regex(/^\d{2}:\d{2}$/)
      .optional()
      .or(z.literal("")),
    priority: PrioritySchema,
  })
  .transform((data) => {
    if (!data.dueDate) return { ...data, dueTime: "", dueTimeEnd: "" };
    if (!data.dueTime) return { ...data, dueTimeEnd: "" };
    return data;
  })
  .refine((data) => !data.dueTimeEnd || (!!data.dueTime && data.dueTimeEnd > data.dueTime), {
    error: "Ende muss nach dem Start liegen.",
    path: ["dueTimeEnd"],
  });

export const SubtaskInputSchema = z.object({
  todoId: z.uuid(),
  title: z.string().trim().min(1, "Titel darf nicht leer sein.").max(200),
});

export const TagInputSchema = z.object({
  name: z.string().trim().min(1, "Name darf nicht leer sein.").max(50),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .default("#71717a"),
});
