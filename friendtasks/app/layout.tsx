import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { getLocale } from "@/lib/i18n/server";
import { LocaleProvider } from "@/components/i18n/locale-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: "PlanyourTasks",
    description: locale === "en" ? "Todo app for friends" : "Todo-App für Freundeskreise",
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [cookieStore, locale] = await Promise.all([cookies(), getLocale()]);
  const theme = cookieStore.get("theme")?.value === "dark" ? "dark" : "light";

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} ${theme === "dark" ? "dark" : ""} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
        <LocaleProvider locale={locale}>{children}</LocaleProvider>
      </body>
    </html>
  );
}
