import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Landing } from "@/components/marketing/landing";

export default async function Home() {
  const supabase = await createClient();
  const [
    {
      data: { user },
    },
    cookieStore,
  ] = await Promise.all([supabase.auth.getUser(), cookies()]);

  if (user) {
    redirect("/today");
  }

  const theme = cookieStore.get("theme")?.value === "dark" ? "dark" : "light";

  return <Landing theme={theme} />;
}
