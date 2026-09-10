import * as z from "zod";

export const PrioritySchema = z.enum(["low", "medium", "high"]);

export const TodoInputSchema = z.object({
  title: z.string().trim().min(1, "Titel darf nicht leer sein.").max(200),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  dueDate: z.string().optional().or(z.literal("")),
  priority: PrioritySchema,
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
