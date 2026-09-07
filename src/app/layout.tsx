import type { Metadata } from "next";
import { Noto_Nastaliq_Urdu } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { AppShell } from "@/components/layout/AppShell";
import "./globals.css";

const notoNastaliq = Noto_Nastaliq_Urdu({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-nastaliq",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pehchaan — Reading Check",
  description:
    "A teacher-run reading assessment tool for Pakistani primary school children.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${notoNastaliq.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-[#F6F8FA] text-[#131A23]">
          {/* Pre-warm Nastaliq font so first Urdu text never flashes a fallback */}
          <span
            className="ur absolute opacity-0 pointer-events-none text-[8px]"
            aria-hidden="true"
          >
            بتثجچ
          </span>
          <AppShell>{children}</AppShell>
        </body>
      </html>
    </ClerkProvider>
  );
}
