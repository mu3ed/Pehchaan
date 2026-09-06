"use client";

import Image from "next/image";
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n/context";

const barriers = [
  {
    key: "vision",
    image: "/images/about/vision-barrier.png",
    alt: {
      ur: "بچہ تختہ دیکھنے کی کوشش کر رہا ہے",
      en: "Child struggling to see the chalkboard",
    },
  },
  {
    key: "hearing",
    image: "/images/about/hearing-barrier.png",
    alt: {
      ur: "بچہ آواز نہیں سن پا رہا",
      en: "Child unable to hear the teacher",
    },
  },
  {
    key: "reading",
    image: "/images/about/dyslexia-reading.png",
    alt: {
      ur: "حروف کتاب میں تیر رہے ہیں",
      en: "Letters floating and jumbled in a book",
    },
  },
  {
    key: "attention",
    image: "/images/about/attention-focus.png",
    alt: {
      ur: "بچہ کھڑکی سے باہر دیکھ رہا ہے",
      en: "Child distracted, looking out the window",
    },
  },
];

const assessmentSteps = [1, 2, 3, 4];
const classroomInstructionAudio = "/audio/classroom-instruction.m4a";

// ─── Step indicator ────────────────────────────────────────────────────────────
function StepIndicator({ step }: { step: 1 | 2 }) {
  return (
    <div
      className="fixed top-[57px] left-0 right-0 z-20 border-b border-[#E3E8EF] bg-white/95 backdrop-blur"
      aria-label={`Step ${step} of 2`}
      role="status"
    >
      <div className="mx-auto flex max-w-4xl items-center justify-center gap-3 px-5 py-2.5">
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full font-sans text-[12px] font-bold transition-colors duration-200 ${
            step === 1 ? "bg-[#1C6B66] text-white" : "bg-[#E3E8EF] text-[#6B7686]"
          }`}
          aria-hidden="true"
        >
          ١
        </span>
        <span className="h-px w-8 bg-[#D9E1E8]" aria-hidden="true" />
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full font-sans text-[12px] font-bold transition-colors duration-200 ${
            step === 2 ? "bg-[#1C6B66] text-white" : "bg-[#E3E8EF] text-[#6B7686]"
          }`}
          aria-hidden="true"
        >
          ٢
        </span>
      </div>
    </div>
  );
}

// ─── Main content (needs useSearchParams → wrapped in Suspense below) ──────────
function AboutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const step = (searchParams.get("step") === "2" ? 2 : 1) as 1 | 2;
  const { t, language, completeFirstLaunch } = useLanguage();
  const isUrdu = language === "ur";

  // ── Vision interaction ──
  const [focusLevel, setFocusLevel] = useState(0);
  const [visionTouched, setVisionTouched] = useState(false);
  const autoFocusTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoFocusInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Hearing interaction ──
  const [activeAudio, setActiveAudio] = useState<"normal" | "muffled" | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);

  // ── Reading interaction ──
  const [readingRevealed, setReadingRevealed] = useState(false);

  // ── Scroll gate (Step 1 "Next" button) ──
  const [nextEnabled, setNextEnabled] = useState(false);
  const hasUnlockedRef = useRef(false);
  const hopeRef = useRef<HTMLDivElement>(null);

  // Auto-focus animation for vision card (fires once on Step 1 load)
  useEffect(() => {
    if (step !== 1 || visionTouched) return;

    autoFocusTimer.current = setTimeout(() => {
      let v = 0;
      autoFocusInterval.current = setInterval(() => {
        v += 4;
        setFocusLevel(Math.min(v, 100));
        if (v >= 100 && autoFocusInterval.current) {
          clearInterval(autoFocusInterval.current);
          autoFocusInterval.current = null;
        }
      }, 120);
    }, 1800);

    return () => {
      if (autoFocusTimer.current) clearTimeout(autoFocusTimer.current);
      if (autoFocusInterval.current) clearInterval(autoFocusInterval.current);
    };
  }, [step, visionTouched]);

  // Scroll gate: enable "Next" once hopeful-close figure enters viewport
  useEffect(() => {
    if (step !== 1) return;
    if (hasUnlockedRef.current) {
      setNextEnabled(true);
      return;
    }
    setNextEnabled(false);
    const el = hopeRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          hasUnlockedRef.current = true;
          setNextEnabled(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [step]);

  const handleFocusChange = (value: string) => {
    setVisionTouched(true);
    if (autoFocusTimer.current) clearTimeout(autoFocusTimer.current);
    if (autoFocusInterval.current) clearInterval(autoFocusInterval.current);
    setFocusLevel(Number(value));
  };

  const speakInstruction = async (mode: "normal" | "muffled") => {
    if (typeof window === "undefined") return;
    const audioWindow = window as Window &
      typeof globalThis & { webkitAudioContext?: typeof AudioContext };
    const AudioContextCtor = audioWindow.AudioContext || audioWindow.webkitAudioContext;

    if (!audioRef.current) {
      audioRef.current = new Audio(classroomInstructionAudio);
      audioRef.current.preload = "auto";
    }
    const audio = audioRef.current;
    audio.pause();
    audio.currentTime = 0;
    audio.volume = mode === "muffled" ? 0.55 : 1;
    audio.onended = () => setActiveAudio(null);
    audio.onerror = () => setActiveAudio(null);

    if (AudioContextCtor) {
      const audioContext = audioContextRef.current ?? new AudioContextCtor();
      audioContextRef.current = audioContext;
      if (audioContext.state === "suspended") await audioContext.resume();
      if (!sourceRef.current) {
        const source = audioContext.createMediaElementSource(audio);
        const filter = audioContext.createBiquadFilter();
        source.connect(filter);
        filter.connect(audioContext.destination);
        sourceRef.current = source;
        filterRef.current = filter;
      }
      if (filterRef.current) {
        filterRef.current.type = "lowpass";
        filterRef.current.frequency.value = mode === "muffled" ? 520 : 22000;
        filterRef.current.Q.value = mode === "muffled" ? 7 : 0.7;
      }
    }
    setActiveAudio(mode);
    try { await audio.play(); } catch { setActiveAudio(null); }
  };

  const goToStep2 = () => router.push("/about?step=2");
  const goBackToStep1 = () => router.push("/about");
  const goToDashboard = () => {
    completeFirstLaunch();
    router.push("/dashboard");
  };

  return (
    <div
      className="relative min-h-full flex-1 bg-[#F6F8FA]"
      style={{ fontFamily: "var(--font-nastaliq), serif" }}
    >
      <StepIndicator step={step} />

      {/* ════════════════════════════════════════════════════════════
          STEP 1 — What is Pehchaan
          ════════════════════════════════════════════════════════════ */}
      {step === 1 && (
        <>
          {/* Extra bottom padding so content clears the fixed Next footer */}
          <div className="mx-auto max-w-4xl px-5 pb-36 pt-[108px] sm:px-8 sm:pt-[120px]">

            {/* ─ Hero ─ */}
            <section className="mb-10">
              <div className="grid items-center gap-8 md:grid-cols-2">
                <div>
                  <h1
                    className={`text-[38px] font-bold leading-[1.5] text-[#131A23] sm:text-[52px] ${
                      isUrdu ? "ur" : ""
                    }`}
                    style={isUrdu ? undefined : { lineHeight: 1.3 }}
                  >
                    {t("about.title")}
                  </h1>
                  <p
                    className={`mt-4 text-[18px] leading-[2] text-[#414D5C] sm:text-[20px] ${
                      isUrdu ? "ur" : ""
                    }`}
                  >
                    {t("about.hero.desc")}
                  </p>
                </div>
                <div className="order-first md:order-last">
                  <div className="overflow-hidden rounded-[20px] shadow-[0_8px_30px_-12px_rgba(0,0,0,0.15)]">
                    <Image
                      src="/images/about/hero-teacher-child.png"
                      alt={
                        isUrdu
                          ? "استاد بچے کو پڑھنے میں مدد کر رہی ہیں"
                          : "Teacher helping a child read"
                      }
                      width={512}
                      height={384}
                      className="h-auto w-full object-cover"
                      priority
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* ─ Stat callout ─ */}
            <section className="mb-8 rounded-[22px] bg-[#E7F1F0] px-6 py-6 sm:px-8 sm:py-7">
              <p
                className={`text-[21px] font-semibold leading-[2] text-[#1F2937] sm:text-[26px] ${
                  isUrdu ? "ur" : ""
                }`}
                style={isUrdu ? undefined : { lineHeight: 1.45 }}
              >
                {t("about.stat.lead")}{" "}
                <span className="text-[34px] font-bold text-[#1C6B66] sm:text-[44px]">
                  {t("about.stat.value")}
                </span>{" "}
                — {t("about.stat.body")}
              </p>
              <p
                className={`mt-2 text-[12px] leading-6 text-[#5B6675] sm:text-[13px] ${
                  isUrdu ? "ur" : ""
                }`}
              >
                ({t("about.stat.source")})
              </p>
            </section>

            {/* ─ Diagnosis callout ─ */}
            <div
              className={`mb-12 flex items-center gap-3 rounded-[16px] border border-[#E3E8EF] bg-white px-5 py-4 ${
                isUrdu
                  ? "flex-row-reverse border-r-2 border-r-[#B45F38]"
                  : "border-l-2 border-l-[#B45F38]"
              }`}
              role="note"
            >
              <span
                className="grid h-9 w-9 flex-none place-items-center rounded-full bg-[#FFF3EC] text-[#B45F38]"
                aria-hidden="true"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                  <path
                    d="M12 3.5c-3.6 0-6.4 2.7-6.4 6.1 0 2 1 3.7 2.7 4.9.8.6 1.2 1.4 1.2 2.3v.2h5v-.2c0-.9.4-1.7 1.2-2.3 1.7-1.2 2.7-2.9 2.7-4.9 0-3.4-2.8-6.1-6.4-6.1Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9.5 20h5M10 9.8l1.4 1.4 2.8-3.1"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <p
                className={`text-[16px] font-semibold leading-[1.9] text-[#414D5C] sm:text-[18px] ${
                  isUrdu ? "ur" : ""
                }`}
              >
                {t("about.diagnosis.callout")}
              </p>
            </div>

            {/* ─ Barriers ─ */}
            <section className="mb-14" aria-labelledby="barriers-title">
              <h2
                id="barriers-title"
                className={`text-[28px] font-bold text-[#131A23] sm:text-[34px] ${
                  isUrdu ? "ur" : ""
                }`}
                style={isUrdu ? undefined : { lineHeight: 1.35 }}
              >
                {t("about.barriers.title")}
              </h2>
              <p className={`mt-2 text-[15px] text-[#6B7686] ${isUrdu ? "ur" : ""}`}>
                {t("about.barriers.intro")}
              </p>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {barriers.map((b) => (
                  <div
                    key={b.key}
                    className="overflow-hidden rounded-[18px] border border-[#E3E8EF] bg-white"
                  >
                    <div className="overflow-hidden">
                      <Image
                        src={b.image}
                        alt={b.alt[language]}
                        width={512}
                        height={384}
                        className="h-[200px] w-full object-cover transition-[filter] duration-300"
                        style={
                          b.key === "vision"
                            ? { filter: `blur(${Math.max(0, 7 - focusLevel * 0.07)}px)` }
                            : undefined
                        }
                      />
                    </div>
                    <div className="p-5">
                      <h3
                        className={`text-[20px] font-bold text-[#131A23] ${isUrdu ? "ur" : ""}`}
                        style={isUrdu ? undefined : { lineHeight: 1.4 }}
                      >
                        {t(`about.barrier.${b.key}.title`)}
                      </h3>
                      <p
                        className={`mt-2 text-[15px] leading-[1.9] text-[#414D5C] ${
                          isUrdu ? "ur" : ""
                        }`}
                      >
                        {t(`about.barrier.${b.key}.body`)}
                      </p>

                      {b.key === "vision" && (
                        <div className="mt-4 rounded-[14px] bg-[#F6F8FA] p-4">
                          <label
                            className={`mb-2 block text-[13px] font-semibold text-[#1C6B66] ${
                              isUrdu ? "ur" : ""
                            }`}
                          >
                            {t("about.interaction.vision.label")}
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={focusLevel}
                            onChange={(e) => handleFocusChange(e.target.value)}
                            className="w-full accent-[#1C6B66]"
                            aria-label={t("about.interaction.vision.label")}
                          />
                          <p
                            className={`mt-2 text-[13px] leading-[1.8] text-[#5B6675] ${
                              isUrdu ? "ur" : ""
                            }`}
                          >
                            {t("about.interaction.vision.caption")}
                          </p>
                        </div>
                      )}

                      {b.key === "hearing" && (
                        <div className="mt-4 rounded-[14px] bg-[#F6F8FA] p-4">
                          <div className={`flex gap-2 ${isUrdu ? "flex-row-reverse" : ""}`}>
                            <Button
                              type="button"
                              variant={activeAudio === "normal" ? "primary" : "secondary"}
                              onClick={() => speakInstruction("normal")}
                              className={`w-auto min-h-11 rounded-full px-5 py-2 text-[14px] ${
                                isUrdu ? "ur text-[16px] leading-[1.8]" : ""
                              }`}
                            >
                              {t("about.interaction.hearing.normal")}
                            </Button>
                            <Button
                              type="button"
                              variant={activeAudio === "muffled" ? "primary" : "secondary"}
                              onClick={() => speakInstruction("muffled")}
                              className={`w-auto min-h-11 rounded-full px-5 py-2 text-[14px] ${
                                isUrdu ? "ur text-[16px] leading-[1.8]" : ""
                              }`}
                            >
                              {t("about.interaction.hearing.muffled")}
                            </Button>
                          </div>
                          <p
                            className={`mt-3 text-[13px] leading-[1.8] text-[#5B6675] ${
                              isUrdu ? "ur" : ""
                            }`}
                          >
                            {t("about.interaction.hearing.caption")}
                          </p>
                        </div>
                      )}

                      {b.key === "reading" && (
                        <div className="mt-4 rounded-[14px] bg-[#F6F8FA] p-4">
                          <div
                            className={`rounded-[12px] bg-white px-4 py-4 text-center text-[23px] font-bold leading-[2] text-[#1F2937] ring-1 ring-[#E3E8EF] sm:text-[28px] ${
                              isUrdu ? "ur" : ""
                            }`}
                            style={{
                              letterSpacing: isUrdu ? "0.05em" : "0.03em",
                              transform: "skewX(-6deg)",
                              textShadow:
                                "0.08em 0 rgba(28,107,102,0.18), -0.06em 0 rgba(180,95,56,0.16)",
                              wordSpacing: "0.18em",
                            }}
                          >
                            {t("about.interaction.reading.scrambled")}
                          </div>
                          <Button
                            type="button"
                            onClick={() => setReadingRevealed(true)}
                            className={`mt-3 w-auto min-h-11 rounded-full px-5 py-2 text-[14px] ${
                              isUrdu ? "ur text-[16px] leading-[1.8]" : ""
                            }`}
                          >
                            {t("about.interaction.reading.button")}
                          </Button>
                          {readingRevealed && (
                            <div
                              className={`mt-3 rounded-[12px] bg-[#E7F1F0] px-4 py-3 text-[20px] font-bold leading-[1.9] text-[#1C6B66] ${
                                isUrdu ? "ur" : ""
                              }`}
                            >
                              {t("about.interaction.reading.revealed")}
                            </div>
                          )}
                          <p
                            className={`mt-3 text-[13px] leading-[1.8] text-[#5B6675] ${
                              isUrdu ? "ur" : ""
                            }`}
                          >
                            {t("about.interaction.reading.caption")}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ─ Why Pehchaan ─ */}
            <section className="mb-14">
              <div className="grid items-center gap-8 md:grid-cols-5">
                <div className="md:col-span-3">
                  <h2
                    className={`text-[28px] font-bold text-[#131A23] sm:text-[34px] ${
                      isUrdu ? "ur" : ""
                    }`}
                    style={isUrdu ? undefined : { lineHeight: 1.35 }}
                  >
                    {t("about.why.title")}
                  </h2>
                  <p
                    className={`mt-4 text-[17px] leading-[2] text-[#414D5C] sm:text-[19px] ${
                      isUrdu ? "ur" : ""
                    }`}
                  >
                    {t("about.why.body")}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <div className="overflow-hidden rounded-[16px] bg-white shadow-[0_4px_20px_-8px_rgba(0,0,0,0.1)]">
                    <Image
                      src="/images/about/vision-barrier.png"
                      alt={
                        isUrdu
                          ? "بچہ تختہ دیکھنے میں دشواری"
                          : "Child struggling to see the board"
                      }
                      width={400}
                      height={300}
                      className="h-auto w-full"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* ─ What this app does ─ */}
            <section className="mb-14">
              <h2
                className={`text-[28px] font-bold text-[#131A23] sm:text-[34px] ${
                  isUrdu ? "ur" : ""
                }`}
                style={isUrdu ? undefined : { lineHeight: 1.35 }}
              >
                {t("about.scope.title")}
              </h2>
              <ul className="mt-5 space-y-4">
                {[1, 2, 3].map((n) => (
                  <li
                    key={n}
                    className={`flex items-start gap-4 ${isUrdu ? "flex-row-reverse" : ""}`}
                  >
                    <span
                      className="mt-[3px] flex h-9 w-9 flex-none items-center justify-center rounded-full bg-[#1C6B66] pt-[1px] font-sans text-[14px] font-bold leading-none text-white"
                      aria-hidden="true"
                    >
                      {n}
                    </span>
                    <span
                      className={`text-[17px] leading-[2] text-[#414D5C] sm:text-[19px] ${
                        isUrdu ? "ur" : ""
                      }`}
                    >
                      {t(`about.scope.feature.${n}`)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            {/* ─ Hopeful close — scroll-gate target ─ */}
            <figure
              ref={hopeRef}
              className="mb-4 overflow-hidden rounded-[22px] border border-[#E3E8EF] bg-white"
            >
              <Image
                src="/images/about/small-changes-big-difference.png"
                alt={
                  isUrdu
                    ? "استاد اور بچہ واضح صفحہ مل کر پڑھ رہے ہیں"
                    : "Teacher and child reading a clear page together"
                }
                width={1024}
                height={768}
                className="h-auto w-full object-cover"
              />
              <figcaption
                className={`px-5 py-4 text-center text-[21px] font-bold text-[#1C6B66] sm:text-[26px] ${
                  isUrdu ? "ur" : ""
                }`}
              >
                {t("about.hope.caption")}
              </figcaption>
            </figure>
          </div>

          {/* ─ Sticky Next footer ─ */}
          <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#E3E8EF] bg-white/97 px-4 py-2.5 sm:px-6 backdrop-blur">
            <div className="mx-auto max-w-4xl space-y-1.5">
              <Button
                onClick={goToStep2}
                disabled={!nextEnabled}
                aria-disabled={!nextEnabled}
                className={`min-h-[44px] rounded-[12px] px-5 py-2 text-[15px] font-semibold transition-opacity ${!nextEnabled ? "cursor-not-allowed opacity-40" : ""} ${
                  isUrdu ? "ur text-[17px] leading-[1.8]" : ""
                }`}
              >
                {t("about.next.button")}
              </Button>
              {!nextEnabled && (
                <p
                  className={`text-center text-[12px] text-[#6B7686] ${isUrdu ? "ur" : ""}`}
                  aria-live="polite"
                >
                  {t("about.scroll.hint")}
                </p>
              )}
            </div>
          </div>
        </>
      )}

      {/* ════════════════════════════════════════════════════════════
          STEP 2 — How to Use
          ════════════════════════════════════════════════════════════ */}
      {step === 2 && (
        <>
          <div className="mx-auto max-w-4xl px-5 pb-36 pt-[108px] sm:px-8 sm:pt-[120px]">

            {/* ─ Back link ─ */}
            <button
              type="button"
              onClick={goBackToStep1}
              className={`mb-10 inline-flex items-baseline gap-2 rounded-lg text-[14px] font-semibold text-[#1C6B66] transition-colors hover:text-[#155C58] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C6B66] ${
                isUrdu ? "ur flex-row-reverse text-[16px] leading-[1.8]" : ""
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
                className={`mt-[1px] flex-none ${isUrdu ? "rotate-180" : ""}`}
              >
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              {t("common.back")}
            </button>

            {/* ─ Heading ─ */}
            <h1
              className={`text-[32px] font-bold text-[#131A23] sm:text-[44px] ${
                isUrdu ? "ur" : ""
              }`}
              style={isUrdu ? undefined : { lineHeight: 1.3 }}
            >
              {t("about.step2.title")}
            </h1>

            {/* ─ Assessment steps ─ */}
            <ol className="mt-8 space-y-5" aria-labelledby="step2-heading">
              {assessmentSteps.map((n) => (
                <li
                  key={n}
                  className={`flex items-start gap-4 ${isUrdu ? "flex-row-reverse" : ""}`}
                >
                  <span
                    className="mt-[4px] flex h-10 w-10 flex-none items-center justify-center rounded-full bg-[#E7F1F0] pt-[1px] font-sans text-[15px] font-bold leading-none text-[#1C6B66]"
                    aria-hidden="true"
                  >
                    {n}
                  </span>
                  <span
                    className={`text-[17px] leading-[2] text-[#414D5C] sm:text-[19px] ${
                      isUrdu ? "ur" : ""
                    }`}
                  >
                    {t(`about.step.${n}`)}
                  </span>
                </li>
              ))}
            </ol>

            {/* ─ Disclaimer note ─ */}
            <div
              className={`mt-10 rounded-[14px] border border-[#E3E8EF] bg-white px-5 py-4 text-[14px] leading-[1.9] text-[#5B6675] ${
                isUrdu ? "ur text-right text-[15px]" : ""
              }`}
              role="note"
            >
              {t("about.disclaimer")}
            </div>
          </div>

          {/* ─ Sticky Go to Dashboard footer ─ */}
          <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#E3E8EF] bg-white/97 px-4 py-2.5 sm:px-6 backdrop-blur">
            <div className="mx-auto max-w-4xl">
              <Button
                onClick={goToDashboard}
                className={`min-h-[44px] rounded-[12px] px-5 py-2 text-[15px] font-semibold ${
                  isUrdu ? "ur text-[17px] leading-[1.8]" : ""
                }`}
              >
                {t("about.go.dashboard")}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// useSearchParams requires a Suspense boundary in Next.js App Router
export default function AboutPage() {
  return (
    <Suspense fallback={null}>
      <AboutContent />
    </Suspense>
  );
}
