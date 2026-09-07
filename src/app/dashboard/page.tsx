"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Field } from "@/components/ui/Field";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { BARRIER_COPY } from "@/lib/i18n/strings";
import { useLanguage } from "@/lib/i18n/context";
import { getSeverityTier } from "@/lib/severity";

interface ChildWithSession {
  id: string;
  name: string;
  className: string | null;
  grade: number | null;
  homeLanguage: string;
  createdAt: string;
  sessions: {
    id: string;
    barrierCategory: string;
    referralFlag: boolean;
    completedAt: string | null;
    startedAt: string;
  }[];
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { language, t } = useLanguage();
  const [children, setChildren] = useState<ChildWithSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newClass, setNewClass] = useState("");
  const [newLang, setNewLang] = useState("Urdu");

  // Check if user has seen the about page; if not, redirect there
  useEffect(() => {
    if (!isLoaded) return;
    if (!user) return;

    let cancelled = false;

    // Fetch profile to check hasSeenAbout
    fetch("/api/profile")
      .then((res) => {
        if (res.status === 404) {
          // No profile yet — new user, show about page
          if (!cancelled) router.replace("/about");
          return null;
        }
        return res.json();
      })
      .then((profile) => {
        if (cancelled || !profile) return;
        if (!profile.hasSeenAbout) {
          router.replace("/about");
        }
      })
      .catch(() => {
        // If profile fetch fails, let the page load normally
      });

    return () => {
      cancelled = true;
    };
  }, [isLoaded, user, router]);

  const fetchChildren = async () => {
    const res = await fetch("/api/children");
    const data = await res.json();
    setChildren(data);
    setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;

    fetch("/api/children")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setChildren(data);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleAddChild = async () => {
    if (!newName.trim()) return;
    await fetch("/api/children", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newName.trim(),
        className: newClass || "2-B",
        homeLanguage: newLang,
      }),
    });
    setNewName("");
    setNewClass("");
    setShowAdd(false);
    fetchChildren();
  };

  return (
    <div className="flex-1 bg-[#F6F8FA] min-h-screen">
      <div className="max-w-md mx-auto px-6 py-8">
        {/* Title */}
        <div className="text-[11.5px] font-bold tracking-wider uppercase text-[#6B7686] mb-2">
          {t("teacher.yourClass")}
        </div>
        <h1 className="text-[24px] font-bold text-[#131A23] tracking-tight mb-1">
          {t("teacher.students")}
        </h1>
        <p className="text-[14px] text-[#414D5C] mb-6">
          {t("teacher.selectChild")}
        </p>

        {/* Add child button */}
        {!showAdd && (
          <Button onClick={() => setShowAdd(true)} className="mb-6">
            {t("teacher.addChild")}
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </Button>
        )}

        {/* Add child form */}
        {showAdd && (
          <Card className="mb-6">
            <div className="text-[14px] font-semibold text-[#131A23] mb-3">
              {t("teacher.newStudent")}
            </div>
            <div className="space-y-3">
              <Field
                label={t("teacher.name")}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={t("teacher.namePlaceholder")}
                onKeyDown={(e) => e.key === "Enter" && handleAddChild()}
              />
              <Field
                label={t("teacher.class")}
                value={newClass}
                onChange={(e) => setNewClass(e.target.value)}
                placeholder={t("teacher.classPlaceholder")}
              />
              <div>
                <label className="block text-[11px] font-bold tracking-wider uppercase text-[#6B7686] mb-1">
                  {t("teacher.homeLanguage")}
                </label>
                <select
                  value={newLang}
                  onChange={(e) => setNewLang(e.target.value)}
                  className="w-full border-[1.5px] border-[#E3E8EF] rounded-[14px] bg-white px-4 py-3 text-[17px] font-semibold text-[#131A23]"
                >
                  <option value="Urdu">{language === "ur" ? "اردو" : "Urdu"}</option>
                  <option value="Punjabi">{language === "ur" ? "پنجابی" : "Punjabi"}</option>
                  <option value="Pashto">{language === "ur" ? "پشتو" : "Pashto"}</option>
                  <option value="Sindhi">{language === "ur" ? "سندھی" : "Sindhi"}</option>
                  <option value="Other">{language === "ur" ? "کوئی اور" : "Other"}</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="ghost" onClick={() => setShowAdd(false)}>
                  {t("common.cancel")}
                </Button>
                <Button onClick={handleAddChild}>{t("common.add")}</Button>
              </div>
            </div>
          </Card>
        )}

        {/* Children list */}
        {loading ? (
          <LoadingSpinner />
        ) : children.length === 0 ? (
          <Card className="text-center py-8">
            <div className="text-[#6B7686] text-[14px]">
              {t("teacher.noStudents")}
            </div>
          </Card>
        ) : (
          <div className="space-y-2">
            {children.map((child) => {
              const latest = child.sessions[0];
              const barrier = latest?.barrierCategory;
              const completed = latest?.completedAt;
              const severity = barrier
                ? getSeverityTier({
                    barrierCategory: barrier,
                    gateConcerns: {
                      vision: Boolean(latest?.referralFlag && barrier === "vision_hearing_referral"),
                      hearing: false,
                    },
                  })
                : null;
              const initials = child.name
                .split(" ")
                .map((w) => w[0])
                .join("");

              return (
                <Link
                  key={child.id}
                  href={`/child/${child.id}`}
                  className="flex items-center gap-3 p-3 bg-white border border-[#E3E8EF] rounded-[13px] hover:border-[#C9D3DF] transition-colors"
                >
                  <div
                    className="w-9 h-9 rounded-full flex-none grid place-items-center text-[12px] font-bold
                    bg-[#E7F1F0] text-[#1C6B66]"
                  >
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14.5px] font-semibold text-[#131A23] truncate">
                      {child.name}
                    </div>
                    <div className="text-[12px] text-[#6B7686] mt-0.5">
                      {child.className || "—"} · {child.homeLanguage}
                    </div>
                  </div>
                  {completed && barrier ? (
                    <Chip
                      bg={severity?.tier === "red" ? "#FDE9E7" : severity?.tier === "yellow" ? "#FFF4D6" : severity?.tier === "context" ? "#EEF1F3" : "#E8F0F7"}
                      color={severity?.tier === "red" ? "#8F2622" : severity?.tier === "yellow" ? "#76510A" : severity?.tier === "context" ? "#465664" : "#285577"}
                    >
                      {BARRIER_COPY[barrier]?.label[language] || barrier}
                    </Chip>
                  ) : (
                    <Chip bg="#F1F3F6" color="#6B7686">
                      {t("teacher.notAssessed")}
                    </Chip>
                  )}
                </Link>
              );
            })}
          </div>
        )}

        {/* Footer actions */}
        <div className="mt-8 flex gap-3">
          <Link href="/class" className="flex-1">
            <Button variant="ghost">{t("teacher.classOverview")}</Button>
          </Link>
        </div>

        <div className="mt-6 text-center text-[10px] text-[#6B7686] opacity-60">
          {t("common.notDiagnosis")} {t("teacher.selectChild")}
        </div>
      </div>
    </div>
  );
}
