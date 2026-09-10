import * as z from "zod";

export const ListNameSchema = z.object({
  name: z.string().trim().min(1, "Name darf nicht leer sein.").max(100),
});
