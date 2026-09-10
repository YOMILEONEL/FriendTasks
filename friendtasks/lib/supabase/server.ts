import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/lib/types/database";

// Creates a Supabase client bound to the current request's cookies. Must be
// called fresh per request (Server Component, Server Action, Route Handler).
// It cannot be a module-level singleton because cookies() is request-scoped.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component during render, where cookies
            // can't be set. Safe to ignore because proxy.ts refreshes the
            // session cookie on every request.
          }
        },
      },
    }
  );
}
