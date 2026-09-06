"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { BARRIER_COPY } from "@/lib/i18n/strings";
import { useLanguage } from "@/lib/i18n/context";
import { getSeverityTier } from "@/lib/severity";
import type { ClassGroup, SeverityTier } from "@/types";

interface ClassData {
  groups: ClassGroup[];
  totalChecked: number;
  totalChildren: number;
}

const TIER_COLORS: Record<SeverityTier, { bg: string; color: string }> = {
  red: { bg: "#FDE9E7", color: "#8F2622" },
  yellow: { bg: "#FFF4D6", color: "#76510A" },
  context: { bg: "#EEF1F3", color: "#465664" },
  blue: { bg: "#E8F0F7", color: "#285577" },
};

export default function ClassPage() {
  const { language, t } = useLanguage();
  const [data, setData] = useState<ClassData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/class")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex-1 bg-[#F6F8FA] min-h-screen flex items-center justify-center text-[#6B7686]">
        {t("common.loading")}
      </div>
    );
  }

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
          {t("common.back")} · {t("teacher.yourClass")}
        </Link>

        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-[11.5px] font-bold tracking-wider uppercase text-[#6B7686]">
              {t("teacher.yourClass")}
            </div>
            <h1 className="text-[24px] font-bold text-[#131A23] tracking-tight mt-1">
              {t("teacher.classOverview")}
            </h1>
          </div>
          <div className="text-right">
            <div className="text-[21px] font-bold text-[#131A23]">
              {data?.totalChecked}
              <span className="text-[#6B7686] font-semibold">
                /{data?.totalChildren}
              </span>
            </div>
            <div className="text-[12px] text-[#6B7686]">{t("teacher.checked")}</div>
          </div>
        </div>

        <p className="text-[13.5px] text-[#414D5C] mb-5">
          {t("teacher.groupedByHelp")}
        </p>

        {/* Groups */}
        {data?.groups.length === 0 ? (
          <div className="bg-white border border-[#E3E8EF] rounded-[18px] p-6 text-center">
            <p className="text-[14px] text-[#6B7686]">
              {t("teacher.noSessions")}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {data?.groups.map((group) => {
              const tier =
                group.tier ||
                getSeverityTier({
                  barrierCategory: group.barrierCategory,
                  gateConcerns: { vision: false, hearing: false },
                }).tier;
              const tone = TIER_COLORS[tier];
              const copy = BARRIER_COPY[group.barrierCategory];
              const label = copy?.label[language] || group.label || group.barrierCategory;
              const tierLabel = getSeverityTier({
                barrierCategory: group.barrierCategory,
                gateConcerns: { vision: false, hearing: false },
              }).labelKey;

              return (
                <div key={group.barrierCategory}>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Chip bg={tone.bg} color={tone.color}>
                      {label}
                    </Chip>
                    <span className={`text-[11.5px] font-semibold ${tier === "red" ? "text-[#8F2622]" : tier === "yellow" ? "text-[#76510A]" : tier === "context" ? "text-[#465664]" : "text-[#285577]"}`}>
                      {t(tierLabel)}
                    </span>
                    <span className="text-[12px] text-[#6B7686]">
                      {group.children.length}
                    </span>
                  </div>

                  {group.children.map((child) => {
                    const initials = child.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("");
                    const date = new Date(
                      child.sessionDate
                    ).toLocaleDateString(language === "ur" ? "ur-PK" : "en-GB", {
                      day: "numeric",
                      month: "short",
                    });

                    return (
                      <Link
                        key={child.id}
                        href={`/child/${child.id}`}
                        className="flex items-center gap-3 p-3 bg-white border border-[#E3E8EF] rounded-[13px] mb-1.5 hover:border-[#C9D3DF] transition-colors"
                      >
                        <div
                          className="w-[34px] h-[34px] rounded-full flex-none grid place-items-center text-[12.5px] font-bold"
                          style={{
                            background: tone.bg,
                            color: tone.color,
                          }}
                        >
                          {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[14.5px] font-semibold text-[#131A23]">
                            {child.name}
                          </div>
                          <div className="text-[12px] text-[#6B7686] mt-0.5">
                            {copy?.hint[language] || child.detail}
                          </div>
                        </div>
                        <span className="text-[11px] text-[#6B7686] flex-none">
                          {date}
                        </span>
                      </Link>
                    );
                  })}

                  {group.hint && (
                    <div
                      className="flex gap-2 items-start px-3 py-2.5 rounded-[11px] mt-1"
                      style={{ background: tone.bg }}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={tone.color}
                        strokeWidth="2.3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="flex-none mt-0.5"
                      >
                        <path d="M9 18h6M10 22h4" />
                        <path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1h6c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2Z" />
                      </svg>
                      <span
                        className="text-[12px] font-semibold"
                        style={{ color: tone.color }}
                      >
                        {copy?.hint[language] || group.hint}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Disclaimer */}
        <div className="bg-[#F1F3F6] border border-[#E1E5EB] rounded-[18px] p-4 mt-6">
          <p className="text-[12.5px] text-[#6B7686] leading-relaxed">
            {t("common.notDiagnosis")} {t("teacher.groupedByHelp")}
          </p>
        </div>

        <div className="mt-4">
          <Link href="/dashboard">
            <Button variant="ghost">{t("teacher.checkAnother")}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
