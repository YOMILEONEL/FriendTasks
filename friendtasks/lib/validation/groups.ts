import * as z from "zod";

export const GroupNameSchema = z.object({
  name: z.string().trim().min(2, "Mindestens 2 Zeichen.").max(80),
});
