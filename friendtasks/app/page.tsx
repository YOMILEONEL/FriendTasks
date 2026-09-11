import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLocale } from "@/lib/i18n/server";
import { Landing } from "@/components/marketing/landing";

export default async function Home() {
  const supabase = await createClient();
  const [
    {
      data: { user },
    },
    cookieStore,
    locale,
  ] = await Promise.all([supabase.auth.getUser(), cookies(), getLocale()]);

  if (user) {
    redirect("/dashboard");
  }

  const theme = cookieStore.get("theme")?.value === "dark" ? "dark" : "light";

  return <Landing theme={theme} locale={locale} />;
}
