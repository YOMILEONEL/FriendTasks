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
    recurrence: z.enum(["none", "weekly", "monthly"]).default("none"),
    recurrenceUntil: z.string().optional().or(z.literal("")),
    // Which weekdays a *weekly* recurrence repeats on (0 = Sunday .. 6 =
    // Saturday), so a todo can recur more than once a week (e.g. Mon + Thu).
    // Empty means "just due_date's own weekday", the original single-day
    // behavior.
    recurrenceWeekdays: z.array(z.coerce.number().int().min(0).max(6)).optional().default([]),
  })
  .transform((data) => {
    // A recurring todo needs a date to know when the next occurrence falls
    // due, so drop recurrence rather than error when there's no date.
    if (!data.dueDate) {
      return {
        ...data,
        dueTime: "",
        dueTimeEnd: "",
        recurrence: "none" as const,
        recurrenceUntil: "",
        recurrenceWeekdays: [],
      };
    }
    if (!data.dueTime) data = { ...data, dueTimeEnd: "" };
    // An end date, and specific weekdays, only make sense alongside an
    // actual recurrence — and weekdays only alongside a *weekly* one.
    if (data.recurrence === "none") return { ...data, recurrenceUntil: "", recurrenceWeekdays: [] };
    if (data.recurrence !== "weekly") return { ...data, recurrenceWeekdays: [] };
    return data;
  })
  .refine((data) => !data.dueTimeEnd || (!!data.dueTime && data.dueTimeEnd > data.dueTime), {
    error: "Ende muss nach dem Start liegen.",
    path: ["dueTimeEnd"],
  })
  .refine((data) => !data.recurrenceUntil || data.recurrenceUntil >= (data.dueDate ?? ""), {
    error: "Das Enddatum der Wiederholung muss nach dem Fälligkeitsdatum liegen.",
    path: ["recurrenceUntil"],
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
