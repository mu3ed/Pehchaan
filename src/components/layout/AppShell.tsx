"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppHeader } from "./AppHeader";
import { LanguageProvider, useLanguage } from "@/lib/i18n/context";

function ShellContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { firstLaunch, initialized } = useLanguage();

  useEffect(() => {
    // Wait for the localStorage check before deciding whether to redirect,
    // to avoid a flash-redirect for returning users during hydration.
    if (!initialized) return;
    if (firstLaunch && pathname !== "/about") router.replace("/about");
  }, [firstLaunch, initialized, pathname, router]);

  return (
    <>
      <AppHeader />
      <main className="flex min-h-[calc(100vh-57px)] flex-1 flex-col">{children}</main>
    </>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <ShellContent>{children}</ShellContent>
    </LanguageProvider>
  );
}
