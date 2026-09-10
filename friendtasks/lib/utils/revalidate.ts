import { revalidatePath } from "next/cache";

// Shared by every "use server" actions file that touches todos — kept in a
// plain module (not a "use server" file itself) because Next.js requires
// every export of a "use server" file to be an async function, and this
// helper is a synchronous one called from several such files.
export function revalidateTodoViews() {
  for (const path of ["/today", "/upcoming", "/inbox", "/all", "/dashboard", "/calendar"]) {
    revalidatePath(path);
  }
  revalidatePath("/groups", "layout");
  revalidatePath("/lists", "layout");
}
