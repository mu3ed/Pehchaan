"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { useLanguage } from "@/lib/i18n/context";

export function AppHeader() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 border-b border-[#E3E8EF] bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        <Link href="/dashboard" className="flex min-w-0 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C6B66]">
          <span className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-[#1C6B66] text-white" aria-hidden="true">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 5.5A2.5 2.5 0 0 1 5.5 3H10a2.5 2.5 0 0 1 2.5 2.5V21a2 2 0 0 0-2-2H3V5.5Z" />
              <path d="M21 5.5A2.5 2.5 0 0 0 18.5 3H14a2.5 2.5 0 0 0-2.5 2.5V21a2 2 0 0 1 2-2H21V5.5Z" />
            </svg>
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[15px] font-bold tracking-tight text-[#131A23]">Pehchaan</span>
            <span className="hidden text-[9px] font-semibold uppercase tracking-[0.16em] text-[#6B7686] sm:block">{t("app.subtitle")}</span>
          </span>
        </Link>

        <nav className="flex items-center gap-2" aria-label={t("nav.dashboard")}>
          <Link
            href="/about"
            className={`inline-flex min-h-9 items-center gap-2 rounded-xl border border-[#D9E1E8] bg-white px-3 py-2 text-[13px] font-bold leading-tight text-[#414D5C] shadow-[0_3px_12px_-10px_rgba(0,0,0,.35)] transition-colors hover:border-[#C8DAD8] hover:bg-[#F6FBFA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C6B66] ${
              language === "ur" ? "ur flex-row-reverse" : ""
            }`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="flex-none text-[#1C6B66]"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 10.8v5" />
              <path d="M12 7.6h.01" />
            </svg>
            <span>{t("nav.about")}</span>
          </Link>
          <div className="flex items-center rounded-lg border border-[#D9E1E8] bg-[#F6F8FA] p-0.5" aria-label={t("nav.english")}>
            <button type="button" aria-pressed={language === "ur"} onClick={() => setLanguage("ur")} className={`rounded-md px-2 py-1 text-[11px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C6B66] ${language === "ur" ? "bg-[#1C6B66] text-white" : "text-[#414D5C] hover:bg-white"}`}>
              {t("nav.urdu")}
            </button>
            <button type="button" aria-pressed={language === "en"} onClick={() => setLanguage("en")} className={`rounded-md px-2 py-1 text-[11px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C6B66] ${language === "en" ? "bg-[#1C6B66] text-white" : "text-[#414D5C] hover:bg-white"}`}>
              {t("nav.english")}
            </button>
          </div>
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: "w-8 h-8",
              },
            }}
          />
        </nav>
      </div>
    </header>
  );
}
