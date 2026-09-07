"use client";

import { AppHeader } from "./AppHeader";
import { LanguageProvider } from "@/lib/i18n/context";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <AppHeader />
      <main className="flex min-h-[calc(100vh-57px)] flex-1 flex-col">
        {children}
      </main>
    </LanguageProvider>
  );
}
