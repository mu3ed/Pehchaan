"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { BARRIER_COPY } from "@/lib/i18n/strings";
import { useLanguage } from "@/lib/i18n/context";
import { getSeverityTier } from "@/lib/severity";

interface Session {
  id: string;
  startedAt: string;
  completedAt: string | null;
  barrierCategory: string;
  referralFlag: boolean;
  homeLanguage: string;
}

interface ChildData {
  id: string;
  name: string;
  className: string | null;
  grade: number | null;
  homeLanguage: string;
  notes: string | null;
  sessions: Session[];
}

const TIER_STYLES: Record<"red" | "yellow" | "blue" | "context", { bg: string; color: string }> = {
  red: { bg: "#FDE9E7", color: "#8F2622" },
  yellow: { bg: "#FFF4D6", color: "#76510A" },
  context: { bg: "#EEF1F3", color: "#465664" },
  blue: { bg: "#E8F0F7", color: "#285577" },
};

export default function ChildDetailPage() {
  const { language, t } = useLanguage();
  const params = useParams();
  const router = useRouter();
  const [child, setChild] = useState<ChildData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/children/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setChild(data);
        setLoading(false);
      });
  }, [params.id]);

  const startSession = async () => {
    if (!child) return;
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        childId: child.id,
        homeLanguage: child.homeLanguage,
      }),
    });
    const session = await res.json();
    router.push(`/session/${session.id}`);
  };

  if (loading) {
    return (
      <div className="flex-1 bg-[#F6F8FA] min-h-screen flex items-center justify-center text-[#6B7686]">
        {t("common.loading")}
      </div>
    );
  }

  if (!child) {
    return (
      <div className="flex-1 bg-[#F6F8FA] min-h-screen flex items-center justify-center text-[#6B7686]">
        {t("teacher.childNotFound")}
      </div>
    );
  }

  const initials = child.name
    .split(" ")
    .map((w) => w[0])
    .join("");

  return (
    <div className="flex-1 bg-[#F6F8FA] min-h-screen">
      <div className="max-w-md mx-auto px-6 py-8">
        {/* Back */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-[13px] text-[#6B7686] hover:text-[#131A23] mb-6 transition-colors"
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
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          {t("common.back")} · {t("teacher.students")}
        </Link>

        {/* Child header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full grid place-items-center text-[18px] font-bold bg-[#E7F1F0] text-[#1C6B66] flex-none">
            {initials}
          </div>
          <div>
            <h1 className="text-[24px] font-bold text-[#131A23] tracking-tight">
              {child.name}
            </h1>
            <div className="text-[14px] text-[#414D5C] mt-0.5">
              {child.className || "—"} · {t("teacher.grade")} {child.grade || "?"} ·{" "}
              {child.homeLanguage}
            </div>
          </div>
        </div>

        {/* Start session */}
        <Button onClick={startSession} className="mb-8">
          {t("teacher.startAssessment")}
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h13M13 6l6 6-6 6" />
          </svg>
        </Button>

        {/* Session history */}
        <div className="text-[11.5px] font-bold tracking-wider uppercase text-[#6B7686] mb-3">
          {t("teacher.pastSessions")}
        </div>

        {child.sessions.length === 0 ? (
          <Card className="text-center py-8">
            <div className="text-[#6B7686] text-[14px]">
              {t("teacher.noSessions")}
            </div>
          </Card>
        ) : (
          <div className="space-y-2">
            {child.sessions.map((session) => {
              const completed = session.completedAt;
              const date = new Date(session.startedAt).toLocaleDateString(
                language === "ur" ? "ur-PK" : "en-GB",
                { day: "numeric", month: "short", year: "numeric" }
              );
              const severity = getSeverityTier({
                barrierCategory: session.barrierCategory,
                gateConcerns: { vision: false, hearing: false },
              });
              const tierStyle = TIER_STYLES[severity.tier];
              const barrierCopy = BARRIER_COPY[session.barrierCategory];

              return (
                <Link
                  key={session.id}
                  href={completed ? `/session/${session.id}` : "#"}
                  className="flex items-center gap-3 p-3 bg-white border border-[#E3E8EF] rounded-[13px] hover:border-[#C9D3DF] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[14.5px] font-semibold text-[#131A23]">
                      {date}
                    </div>
                    <div className="text-[12px] text-[#6B7686] mt-0.5">
                      {completed ? t("teacher.completed") : t("teacher.inProgress")}
                    </div>
                  </div>
                  {completed ? (
                    <div className="flex flex-col items-end gap-1">
                      <Chip bg={tierStyle.bg} color={tierStyle.color}>
                        {barrierCopy?.label[language] || session.barrierCategory}
                      </Chip>
                      <span className="text-[10.5px] font-semibold" style={{ color: tierStyle.color }}>
                        {t(severity.labelKey)}
                      </span>
                    </div>
                  ) : (
                    <Chip bg="#F1F3F6" color="#6B7686">
                      {t("teacher.incomplete")}
                    </Chip>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
