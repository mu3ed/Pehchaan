"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { GATE_QUESTIONS } from "@/content/gate-questions";
import { RAN_ICONS, getShuffledGrid } from "@/content/ran-icons";
import { selectPairs } from "@/content/letter-pairs";
import { TEACH_CARDS, pickTeachChannel } from "@/content/teach-cards";
import { getRetryItems } from "@/content/retry-items";
import { unlock, SND } from "@/lib/audio";
import { useLanguage } from "@/lib/i18n/context";
import { getSeverityTier } from "@/lib/severity";
import { getPersistedScoringResult } from "@/lib/session-result";
import type {
  GateAnswer,
  MatchResponse,
  RetryResponse,
  LetterPair,
  ScoringResult,
  ActionEntry,
  LocalizedText,
} from "@/types";

type Step = "gate" | "ran" | "match" | "teach" | "processing" | "result";

interface SessionData {
  id: string;
  childId: string;
  homeLanguage: string;
  completedAt: string | null;
  ranTimeSeconds: number | null;
  ranTotalTaps: number | null;
  gateAnswers: GateAnswer[] | null;
  matchResponses: MatchResponse[] | null;
  retryResponses: RetryResponse[] | null;
  child: { name: string; className: string | null };
}

// ─── Mascot SVG ───
function Tara({
  size = 118,
  mood = "idle",
}: {
  size?: number;
  mood?: "idle" | "happy" | "think";
}) {
  const animClass =
    mood === "happy"
      ? "animate-[pop_.55s_cubic-bezier(.2,1.5,.4,1)_2]"
      : mood === "think"
        ? "animate-[tilt_1.5s_ease-in-out_infinite]"
        : "animate-[breathe_3.1s_ease-in-out_infinite]";
  return (
    <svg
      className={`origin-center ${animClass}`}
      width={size}
      height={size}
      viewBox="0 0 120 120"
    >
      <g className="opacity-0" fill="#FFD86B">
        <path d="M104 24l2.4 5.6 5.6 2.4-5.6 2.4L104 40l-2.4-5.6-5.6-2.4 5.6-2.4z" />
        <path d="M16 74l1.9 4.4 4.4 1.9-4.4 1.9L16 86.6l-1.9-4.4L9.7 80.3l4.4-1.9z" />
      </g>
      <path
        d="M60 6 L72.9 40.2 L109.5 41.9 L80.9 64.8 L90.6 100.1 L60 80 L29.4 100.1 L39.1 64.8 L10.5 41.9 L47.1 40.2 Z"
        fill="#FFC53D"
        stroke="#E8930C"
        strokeWidth="4.5"
        strokeLinejoin="round"
      />
      <circle cx="50" cy="50" r="5.2" fill="#4A3210" />
      <circle cx="70" cy="50" r="5.2" fill="#4A3210" />
      <circle cx="51.6" cy="48.2" r="1.7" fill="#fff" />
      <circle cx="71.6" cy="48.2" r="1.7" fill="#fff" />
      <circle cx="41" cy="60" r="4.6" fill="#FF8E6B" opacity=".55" />
      <circle cx="79" cy="60" r="4.6" fill="#FF8E6B" opacity=".55" />
      <path
        d="M50 62 Q60 72 70 62"
        stroke="#4A3210"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SpeechBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white text-[#2B1F42] rounded-[18px] px-4 py-2.5 relative shadow-[0_4px_0_rgba(139,92,246,.15)] border-2 border-[#EFE6FA] animate-[bubIn_.35s_cubic-bezier(.2,1.4,.4,1)_both]">
      {children}
      <div className="absolute -bottom-[9px] left-1/2 -translate-x-1/2 border-[8px] border-transparent border-t-white border-b-0" />
    </div>
  );
}

function ProgressPath({ done }: { done: number }) {
  return (
    <div className="flex items-center justify-center gap-0 py-1.5">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center">
          {i > 0 && (
            <div
              className={`w-[22px] h-1 rounded-sm ${i <= done ? "bg-[#FFC53D]" : "bg-[#E7DCF5]"} transition-colors duration-500`}
            />
          )}
          <div
            className={`w-[34px] h-[34px] rounded-full grid place-items-center flex-none border-[3px] transition-all duration-500
            ${
              i < done
                ? "bg-[#FFC53D] border-[#E8930C] scale-105"
                : i === done
                  ? "bg-white border-[#8B5CF6] shadow-[0_0_0_5px_rgba(139,92,246,.16)] animate-[stonePulse_1.6s_ease-in-out_infinite]"
                  : "bg-white border-[#E7DCF5]"
            }`}
          >
            {i < done ? (
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#8A5600"
                strokeWidth="3.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m4.5 12.5 5 5 10-11" />
              </svg>
            ) : (
              <span
                className={`text-[13px] font-extrabold ${i === done ? "text-[#8B5CF6]" : "text-[#C9BBDF]"}`}
              >
                {i + 1}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function Confetti() {
  const cols = [
    "#FFC53D",
    "#FF7A2F",
    "#8B5CF6",
    "#2E9FE0",
    "#25B37A",
    "#FF5C8A",
  ];
  return (
    <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
      {Array.from({ length: 22 }).map((_, i) => {
        const ang = (Math.PI * 2 * i) / 22 + ((i * 7) % 10) / 100;
        const dist = 130 + ((i * 17) % 130);
        const rotation = (i * 137) % 720 - 360;
        const duration = 0.85 + ((i * 11) % 50) / 100;
        return (
          <div
            key={i}
            className="absolute w-[10px] h-[10px] top-[44%] left-1/2 opacity-0"
            style={{
              background: cols[i % cols.length],
              borderRadius: i % 3 ? "2px" : "50%",
              ["--dx" as string]: `${Math.cos(ang) * dist}px`,
              ["--dy" as string]: `${Math.sin(ang) * dist - 40}px`,
              ["--rot" as string]: `${rotation}deg`,
              animation: `fly ${duration}s cubic-bezier(.15,.75,.4,1) ${i * 0.012}s forwards`,
            }}
          />
        );
      })}
    </div>
  );
}

// ─── Icon SVG renderer ───
function IconSvg({
  name,
  size = 30,
}: {
  name: string;
  size?: number;
}) {
  const paths = RAN_ICONS[name] || "";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinejoin="round"
    >
      <g dangerouslySetInnerHTML={{ __html: paths }} />
    </svg>
  );
}

// ─── Main Page ───
export default function SessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [session, setSession] = useState<SessionData | null>(null);
  const [step, setStep] = useState<Step>("gate");
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  // Gate state
  const [gateIdx, setGateIdx] = useState(0);
  const [gateAnswers, setGateAnswers] = useState<GateAnswer[]>([]);
  const [homeLang, setHomeLang] = useState("Urdu");

  // RAN state
  const [ranGrid] = useState(getShuffledGrid);
  const [ranStarted, setRanStarted] = useState(false);
  const [ranHits, setRanHits] = useState(0);
  const [ranTime, setRanTime] = useState(0);
  const ranStartRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  // Match state
  const [pairs] = useState(() => selectPairs(10));
  const [matchIdx, setMatchIdx] = useState(0);
  const [matchStarted, setMatchStarted] = useState(false);
  const [matchResponses, setMatchResponses] = useState<MatchResponse[]>([]);
  const pairTimeRef = useRef(0);

  // Teach state
  const [teachChannel, setTeachChannel] = useState<string>("dot_identity");
  const [teachPhase, setTeachPhase] = useState<"show" | "retry">("show");
  const [retryIdx, setRetryIdx] = useState(0);
  const [retryResponses, setRetryResponses] = useState<RetryResponse[]>([]);
  const [retryItems, setRetryItems] = useState(getRetryItems("dot_identity", 2));

  // Result state
  const [scoringResult, setScoringResult] = useState<ScoringResult | null>(null);

  // Load session
  useEffect(() => {
    fetch(`/api/sessions/${sessionId}`)
      .then((r) => r.json())
      .then((data) => {
        setSession(data);
        setHomeLang(data.homeLanguage || "Urdu");
        setGateAnswers(data.gateAnswers || []);
        setMatchResponses(data.matchResponses || []);
        setRetryResponses(data.retryResponses || []);
        if (data.ranTimeSeconds !== null && data.ranTimeSeconds !== undefined) {
          setRanTime(data.ranTimeSeconds);
        }

        const persistedResult = getPersistedScoringResult({
          completedAt: data.completedAt,
          homeLanguage: data.homeLanguage || "Urdu",
          ranTimeSeconds: data.ranTimeSeconds,
          ranTotalTaps: data.ranTotalTaps,
          gateAnswers: data.gateAnswers,
          matchResponses: data.matchResponses,
          retryResponses: data.retryResponses,
        });
        if (persistedResult) {
          setScoringResult(persistedResult);
          setStep("result");
        }
        setLoading(false);
      });
  }, [sessionId]);

  // Persist data helper
  const patchSession = useCallback(
    async (data: Record<string, unknown>) => {
      await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    [sessionId]
  );

  const nextStep = useCallback(
    (s: Step) => {
      setShowConfetti(false);
      setStep(s);
    },
    []
  );

  // ─── Gate handlers ───
  const handleGateAnswer = useCallback(
    (optIdx: number) => {
      unlock();
      SND.tap();
      const q = GATE_QUESTIONS[gateIdx];
      const opt = q.options[optIdx];
      const answer: GateAnswer = {
        questionIndex: gateIdx,
        selectedOption: optIdx,
        referral: opt.referral,
        homeLanguage: opt.homeLanguage,
      };
      const newAnswers = [...gateAnswers, answer];
      setGateAnswers(newAnswers);

      if (opt.homeLanguage) setHomeLang(opt.homeLanguage);

      if (gateIdx < GATE_QUESTIONS.length - 1) {
        setTimeout(() => setGateIdx(gateIdx + 1), 250);
      } else {
        // Gate complete — save and move to RAN
        const lang =
          opt.homeLanguage ||
          newAnswers.find((a) => a.homeLanguage)?.homeLanguage ||
          "Urdu";
        patchSession({ gateAnswers: newAnswers, homeLanguage: lang });
        setTimeout(() => nextStep("ran"), 300);
      }
    },
    [gateIdx, gateAnswers, patchSession, nextStep]
  );

  // ─── RAN handlers ───
  const startRan = useCallback(() => {
    unlock();
    SND.soft();
    setRanStarted(true);
    ranStartRef.current = performance.now();

    const loop = () => {
      setRanTime((performance.now() - ranStartRef.current) / 1000);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  }, []);

  const handleRanTap = useCallback(
    () => {
      if (ranHits + 1 >= ranGrid.length) {
        // Done
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        const finalTime =
          (performance.now() - ranStartRef.current) / 1000;
        setRanTime(finalTime);
        setRanHits(ranGrid.length);
        SND.win();
        setShowConfetti(true);
        patchSession({
          ranTimeSeconds: finalTime,
          ranTotalTaps: ranGrid.length,
        });
        setTimeout(() => nextStep("match"), 2500);
      } else {
        setRanHits((h) => h + 1);
        SND.tick(ranHits + 1);
      }
    },
    [ranHits, ranGrid.length, patchSession, nextStep]
  );

  // ─── Match handlers ───
  const handleMatchAnswer = useCallback(
    (answeredSame: boolean) => {
      unlock();
      SND.tap();
      const pair = pairs[matchIdx];
      pairTimeRef.current = performance.now() - pairTimeRef.current;
      const response: MatchResponse = {
        pairIndex: matchIdx,
        a: pair.a,
        b: pair.b,
        channel: pair.channel,
        correctSame: pair.same,
        childAnsweredSame: answeredSame,
        correct: answeredSame === pair.same,
        responseTimeMs: pairTimeRef.current,
      };
      const newResponses = [...matchResponses, response];
      setMatchResponses(newResponses);

      if (matchIdx < pairs.length - 1) {
        setTimeout(() => {
          setMatchIdx((i) => i + 1);
          pairTimeRef.current = performance.now();
        }, 350);
      } else {
        // Match complete
        SND.win();
        setShowConfetti(true);
        patchSession({ matchResponses: newResponses });

        // Compute channel errors to determine teach channel
        const errors: Record<string, { total: number; wrong: number }> = {};
        for (const r of newResponses) {
          if (!errors[r.channel]) errors[r.channel] = { total: 0, wrong: 0 };
          errors[r.channel].total++;
          if (!r.correct) errors[r.channel].wrong++;
        }
        const rates: Record<string, number> = {};
        for (const [k, v] of Object.entries(errors)) {
          rates[k] = v.total > 0 ? v.wrong / v.total : 0;
        }
        const channel = pickTeachChannel(rates);
        setTeachChannel(channel);
        setRetryItems(getRetryItems(channel, 2));

        setTimeout(() => nextStep("teach"), 2200);
      }
    },
    [matchIdx, pairs, matchResponses, patchSession, nextStep]
  );

  // ─── Teach handlers ───
  const handleTeachDone = useCallback(() => {
    SND.soft();
    setTeachPhase("retry");
  }, []);

  const handleRetryAnswer = useCallback(
    (answeredSame: boolean) => {
      unlock();
      SND.tap();
      const item = retryItems[retryIdx];
      const response: RetryResponse = {
        retryIndex: retryIdx,
        a: item.a,
        b: item.b,
        channel: item.channel,
        correctSame: item.same,
        childAnsweredSame: answeredSame,
        correct: answeredSame === item.same,
        responseTimeMs: 0,
      };
      const newRetry = [...retryResponses, response];
      setRetryResponses(newRetry);

      if (response.correct) SND.chime();
      else SND.look();

      if (retryIdx < retryItems.length - 1) {
        setTimeout(() => setRetryIdx((i) => i + 1), response.correct ? 1400 : 2400);
      } else {
        // Teach complete — run scoring
        SND.win();
        setShowConfetti(true);
        patchSession({ retryResponses: newRetry });
        setTimeout(async () => {
          nextStep("processing");
          // Small delay then score
          setTimeout(async () => {
            const res = await fetch(`/api/sessions/${sessionId}/score`, {
              method: "POST",
            });
            const data = await res.json();
            setScoringResult(data.result);
            nextStep("result");
          }, 3000);
        }, 2200);
      }
    },
    [retryIdx, retryItems, retryResponses, patchSession, nextStep, sessionId]
  );

  if (loading) {
    return (
      <div className="flex-1 bg-[#F6F8FA] min-h-screen flex items-center justify-center text-[#6B7686]">
        Loading session...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex-1 bg-[#F6F8FA] min-h-screen flex items-center justify-center text-[#6B7686]">
        Session not found
      </div>
    );
  }

  const firstName = session.child.name.split(" ")[0];
  const isChildMode = ["ran", "match", "teach"].includes(step);

  return (
    <div
      className={`flex-1 min-h-screen ${isChildMode ? "bg-gradient-to-b from-[#FFF4E2] via-[#FFE8F1] to-[#EFE7FF]" : "bg-[#F6F8FA]"}`}
    >
      <div className="max-w-md mx-auto px-6 py-4 min-h-screen flex flex-col relative">
        {showConfetti && <Confetti />}

        {/* ─── GATE ─── */}
        {step === "gate" && (
          <GateStep
            gateIdx={gateIdx}
            firstName={firstName}
            onAnswer={handleGateAnswer}
          />
        )}

        {/* ─── RAN ─── */}
        {step === "ran" && (
          <RANStep
            ranGrid={ranGrid}
            ranStarted={ranStarted}
            ranHits={ranHits}
            ranTime={ranTime}
            onStart={startRan}
            onTap={handleRanTap}
          />
        )}

        {/* ─── MATCH ─── */}
        {step === "match" && (
          <MatchStep
            pairs={pairs}
            matchIdx={matchIdx}
            matchStarted={matchStarted}
            onStart={() => {
              setMatchStarted(true);
              pairTimeRef.current = performance.now();
              SND.soft();
            }}
            onAnswer={handleMatchAnswer}
          />
        )}

        {/* ─── TEACH ─── */}
        {step === "teach" && (
          <TeachStep
            channel={teachChannel}
            phase={teachPhase}
            retryIdx={retryIdx}
            retryItems={retryItems}
            onTeachDone={handleTeachDone}
            onRetryAnswer={handleRetryAnswer}
          />
        )}

        {/* ─── PROCESSING ─── */}
        {step === "processing" && <ProcessingStep />}

        {/* ─── RESULT ─── */}
        {step === "result" && scoringResult && (
          <ResultStep
            firstName={firstName}
            homeLanguage={homeLang}
            result={scoringResult}
            onDone={() => router.push(`/child/${session.childId}`)}
            onClass={() => router.push("/class")}
          />
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Step Components
// ═══════════════════════════════════════════════════════════

function GateStep({
  gateIdx,
  firstName,
  onAnswer,
}: {
  gateIdx: number;
  firstName: string;
  onAnswer: (idx: number) => void;
}) {
  const { text, t } = useLanguage();
  const q = GATE_QUESTIONS[gateIdx];
  const questionText = text(q.question).replace("{firstName}", firstName);
  const noteText = text(q.note).replace("{firstName}", firstName);

  return (
    <div className="flex-1 flex flex-col pt-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11.5px] font-bold tracking-wider uppercase text-[#6B7686]">
          {t("assessment.beforeStart")} · {gateIdx + 1} {t("assessment.questionCount")} {GATE_QUESTIONS.length}
        </span>
        <div className="flex gap-1.5">
          {GATE_QUESTIONS.map((_, i) => (
            <div
              key={i}
              className={`w-[26px] h-1 rounded-sm transition-colors duration-300 ${
                i < gateIdx
                  ? "bg-[#2C7A57]"
                  : i === gateIdx
                    ? "bg-[#1C6B66]"
                    : "bg-[#E3E8EF]"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="mt-7">
        <h2 className="text-[22px] font-bold text-[#131A23] tracking-tight leading-snug">
          {questionText}
        </h2>
        <p className="text-[12.5px] text-[#6B7686] mt-2">{noteText}</p>
      </div>

      <div className="mt-6 space-y-2.5">
        {q.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => onAnswer(i)}
            className="w-full flex items-center gap-3 bg-white border-[1.5px] border-[#E3E8EF] rounded-[15px] p-4 text-left
              hover:border-[#C9D3DF] active:scale-[.982] transition-all"
          >
            <div className="w-[34px] h-[34px] rounded-[10px] bg-[#E7F1F0] text-[#1C6B66] grid place-items-center flex-none">
              <GateIcon name={opt.icon} />
            </div>
            <span className="text-[15.5px] font-semibold text-[#131A23]">
              {text(opt.label)}
            </span>
          </button>
        ))}
      </div>

      <div className="flex-1" />
      <p className="text-[12px] text-[#6B7686] text-center pb-5 max-w-[280px] mx-auto">
        {t("assessment.quietReason")}
      </p>
    </div>
  );
}

function GateIcon({ name }: { name: string }) {
  const icons: Record<string, string> = {
    eye: '<circle cx="12" cy="12" r="3"/><path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z"/>',
    ear: '<path d="M6 8.5a6 6 0 1 1 12 0c0 2.6-1.6 3.6-2.8 4.8-1 1-1.2 1.9-1.2 3a3 3 0 0 1-5.4 1.8"/><path d="M9.4 8.6a2.6 2.6 0 0 1 5.2 0"/>',
    help: '<circle cx="12" cy="12" r="9.5"/><path d="M9.4 9.4a2.7 2.7 0 0 1 5.2.9c0 1.8-2.6 2.7-2.6 2.7M12 17h.01"/>',
    globe:
      '<circle cx="12" cy="12" r="9.5"/><path d="M2.5 12h19M12 2.5a15 15 0 0 1 0 19 15 15 0 0 1 0-19Z"/>',
  };
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      dangerouslySetInnerHTML={{ __html: icons[name] || "" }}
    />
  );
}

function RANStep({
  ranGrid,
  ranStarted,
  ranHits,
  ranTime,
  onStart,
  onTap,
}: {
  ranGrid: string[];
  ranStarted: boolean;
  ranHits: number;
  ranTime: number;
  onStart: () => void;
  onTap: (idx: number) => void;
}) {
  const { language, t } = useLanguage();
  const [hitTiles, setHitTiles] = useState<Set<number>>(new Set());

  const handleTap = (idx: number) => {
    if (hitTiles.has(idx)) return;
    const newHits = new Set(hitTiles);
    newHits.add(idx);
    setHitTiles(newHits);
    onTap(idx);
  };

  if (!ranStarted) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <ProgressPath done={0} />
        <Tara size={126} />
        <SpeechBubble>
          <span className={language === "ur" ? "ur text-[24px]" : "text-[20px] font-bold"}>{t("ran.bubble")}</span>
        </SpeechBubble>
        <div className="h-1" />
        <h2 className="text-[25px] font-extrabold text-[#2B1F42] text-center leading-tight">
          {t("ran.title")}
        </h2>
        <p className="text-[14px] font-semibold text-[#5B4C79] text-center max-w-[250px]">
          {t("ran.subtitle")}
        </p>
        <div className="h-1" />
        <Button
          variant="game"
          color="#FF7A2F"
          edgeColor="#D95A15"
          className="px-10 py-4 text-[19px]"
          onClick={onStart}
        >
          {t("ran.ready")}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col pt-1">
      <ProgressPath done={0} />
      {/* Timer + count */}
      <div className="flex justify-center gap-2.5 py-2">
        <div className="inline-flex items-center gap-1.5 bg-white border-2 border-[#EFE6FA] rounded-full px-4 py-1.5 font-extrabold text-[15px] text-[#2B1F42] shadow-[0_3px_0_rgba(139,92,246,.12)] tabular-nums">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#8B5CF6"
            strokeWidth="2.6"
            strokeLinecap="round"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7.5V12l3 2" />
          </svg>
          {ranTime.toFixed(1)}s
        </div>
        <div className="inline-flex items-center gap-1.5 bg-white border-2 border-[#EFE6FA] rounded-full px-4 py-1.5 font-extrabold text-[15px] text-[#FF7A2F] shadow-[0_3px_0_rgba(139,92,246,.12)]">
          {ranHits}
          <span className="opacity-50 text-[13px]">/ {ranGrid.length}</span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-5 gap-2">
        {ranGrid.map((icon, i) => (
          <button
            key={i}
            onClick={() => handleTap(i)}
            className={`aspect-square rounded-[15px] grid place-items-center border-[2.5px] transition-all duration-100
              ${
                hitTiles.has(i)
                  ? "bg-[#FFC53D] border-[#E8930C] text-[#7A4A00] scale-105 animate-[hitPop_.28s_cubic-bezier(.2,1.6,.4,1)]"
                  : "bg-white border-[#F0E7FB] text-[#8B5CF6] active:scale-90"
              }
              ${i === 0 && hitTiles.size === 0 ? "animate-[firstPulse_1.35s_ease-in-out_infinite]" : ""}`}
          >
            <IconSvg name={icon} size={hitTiles.has(i) ? 30 : 28} />
          </button>
        ))}
      </div>

      {/* Cheer */}
      <div className="flex-1 flex items-end justify-center gap-2 pb-3">
        <div className="scale-[.42] origin-center w-[52px] h-[52px] -my-1.5">
          <Tara size={120} />
        </div>
        <span className="text-[14px] font-bold text-[#8B5CF6]">
          {ranHits < 5
            ? t("ran.go")
            : ranHits < 10
              ? t("ran.nice")
              : ranHits < 15
                ? t("ran.fast")
                : ranHits < 18
                  ? t("ran.keepGoing")
                  : ranHits < ranGrid.length
                    ? t("ran.almost")
                    : t("ran.amazing")}
        </span>
      </div>
    </div>
  );
}

function MatchStep({
  pairs,
  matchIdx,
  matchStarted,
  onStart,
  onAnswer,
}: {
  pairs: LetterPair[];
  matchIdx: number;
  matchStarted: boolean;
  onStart: () => void;
  onAnswer: (same: boolean) => void;
}) {
  const { t } = useLanguage();
  const [locked, setLocked] = useState(false);

  const handleAnswer = (same: boolean) => {
    if (locked) return;
    setLocked(true);
    onAnswer(same);
    setTimeout(() => setLocked(false), 400);
  };

  if (!matchStarted) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <ProgressPath done={1} />
        <Tara size={126} />
        <SpeechBubble>
          <span className="ur text-[23px]">{t("match.question")}</span>
        </SpeechBubble>
        <div className="h-1" />
        <h2 className="text-[25px] font-extrabold text-[#2B1F42] text-center leading-tight">
          {t("match.title")}
        </h2>
        <p className="text-[14px] font-semibold text-[#5B4C79] text-center max-w-[250px]">
          {t("match.subtitle")}
        </p>
        <div className="h-1" />
        <Button
          variant="game"
          color="#8B5CF6"
          edgeColor="#6B3FD6"
          className="px-10 py-4 text-[19px]"
          onClick={onStart}
        >
          {t("match.letsGo")}
        </Button>
      </div>
    );
  }

  if (matchIdx >= pairs.length) return null;
  const pair = pairs[matchIdx];

  return (
    <div className="flex-1 flex flex-col">
      <div className="pt-1">
        <ProgressPath done={1} />
      </div>
      <div className="flex-1 flex flex-col justify-center gap-5 pb-2">
        <p className="text-center text-[14px] font-semibold text-[#5B4C79]">
          <span className="ur text-[22px]">{t("match.question")}</span>
        </p>

        {/* Letter cards */}
        <div className="flex items-stretch gap-3">
          <div className="flex-1 bg-white border-[3px] border-[#EFE6FA] rounded-[24px] grid place-items-center shadow-[0_6px_0_rgba(139,92,246,.13)] min-h-[150px] animate-[cardIn_.42s_cubic-bezier(.2,1.2,.35,1)_both]">
            <span className="ur glyph text-[72px] text-[#2B1F42]">
              {pair.a}
            </span>
          </div>
          <div className="self-center text-[13px] font-extrabold text-[#7C6F94] w-4 text-center flex-none">
            vs
          </div>
          <div className="flex-1 bg-white border-[3px] border-[#EFE6FA] rounded-[24px] grid place-items-center shadow-[0_6px_0_rgba(139,92,246,.13)] min-h-[150px] animate-[cardIn_.42s_cubic-bezier(.2,1.2,.35,1)_both] [animation-delay:.07s]">
            <span className="ur glyph text-[72px] text-[#2B1F42]">
              {pair.b}
            </span>
          </div>
        </div>

        {/* Answer buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            disabled={locked}
            onClick={() => handleAnswer(true)}
            className="rounded-[22px] py-4 flex flex-col items-center justify-center gap-0.5 min-h-[88px]
              bg-[#2E9FE0] text-white font-extrabold
              shadow-[0_6px_0_#1B7AB2] active:translate-y-[5px] active:shadow-[0_1px_0_#1B7AB2]
              transition-transform disabled:opacity-50"
          >
            <span className="ur text-[23px]">{t("match.same")}</span>
          </button>
          <button
            disabled={locked}
            onClick={() => handleAnswer(false)}
            className="rounded-[22px] py-4 flex flex-col items-center justify-center gap-0.5 min-h-[88px]
              bg-[#FF7A2F] text-white font-extrabold
              shadow-[0_6px_0_#D95A15] active:translate-y-[5px] active:shadow-[0_1px_0_#D95A15]
              transition-transform disabled:opacity-50"
          >
            <span className="ur text-[23px]">{t("match.different")}</span>
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-center gap-2 pb-4">
        <div className="scale-[.4] w-[48px] h-[48px] -my-2">
          <Tara size={120} />
        </div>
        <span className="text-[14px] font-bold text-[#8B5CF6]">
          {matchIdx + 1} of {pairs.length}
        </span>
      </div>
    </div>
  );
}

function TeachStep({
  channel,
  phase,
  retryIdx,
  retryItems,
  onTeachDone,
  onRetryAnswer,
}: {
  channel: string;
  phase: "show" | "retry";
  retryIdx: number;
  retryItems: { a: string; b: string; aHint: LocalizedText; bHint: LocalizedText }[];
  onTeachDone: () => void;
  onRetryAnswer: (same: boolean) => void;
}) {
  const { language, t, text } = useLanguage();
  const card = TEACH_CARDS[channel] || TEACH_CARDS.dot_identity;
  const [locked, setLocked] = useState(false);

  const handleAnswer = (same: boolean) => {
    if (locked) return;
    setLocked(true);
    onRetryAnswer(same);
    setTimeout(() => setLocked(false), 500);
  };

  if (phase === "show") {
    return (
      <div className="flex-1 flex flex-col justify-center gap-4 pb-2">
        <ProgressPath done={2} />
        <div className="flex items-center justify-center gap-2.5">
          <div className="scale-[.46] w-[56px] h-[56px] -my-2">
            <Tara size={120} mood="think" />
          </div>
          <SpeechBubble>
            <span className={language === "ur" ? "ur text-[24px]" : "text-[18px] font-bold"}>{language === "ur" ? card.titleUrdu : card.titleEnglish}</span>
          </SpeechBubble>
        </div>

        <h2 className="text-[22px] font-extrabold text-[#2B1F42] text-center">
          {language === "ur" ? card.titleUrdu : card.titleEnglish}
        </h2>
        <p className="text-[14px] font-semibold text-[#5B4C79] text-center">
          {text(card.explanation)}
        </p>

        {/* Teach cards */}
        <div className="flex items-stretch gap-3">
          <div className="flex-1 bg-white border-[3px] border-[#EFE6FA] rounded-[24px] flex flex-col items-center gap-0 py-3 min-h-[186px] shadow-[0_6px_0_rgba(139,92,246,.13)] animate-[cardIn_.42s_cubic-bezier(.2,1.2,.35,1)_both]">
            <span className="text-[12px] font-extrabold text-[#6B7686] mt-1">
              {text(card.aDotDescription)}
            </span>
            <div className="flex-1 grid place-items-center">
              <span className="ur text-[58px] text-[#2B1F42] leading-[2.6] -translate-y-[.39em]">
                {card.letterA}
              </span>
            </div>
          </div>
          <div className="self-center text-[13px] font-extrabold text-[#7C6F94] flex-none" />
          <div className="flex-1 bg-white border-[3px] border-[#EFE6FA] rounded-[24px] flex flex-col items-center gap-0 py-3 min-h-[186px] shadow-[0_6px_0_rgba(139,92,246,.13)] animate-[cardIn_.42s_cubic-bezier(.2,1.2,.35,1)_both] [animation-delay:.08s]">
            <span className="text-[12px] font-extrabold text-[#6B7686] mt-1">
              {text(card.bDotDescription)}
            </span>
            <div className="flex-1 grid place-items-center">
              <span className="ur text-[58px] text-[#2B1F42] leading-[2.6] -translate-y-[.39em]">
                {card.letterB}
              </span>
            </div>
          </div>
        </div>

        <Button
          variant="game"
          color="#25B37A"
          edgeColor="#178A5B"
          className="py-4 text-[18px]"
          onClick={onTeachDone}
        >
          {t("teach.retry")}
        </Button>
      </div>
    );
  }

  // Retry phase
  if (retryIdx >= retryItems.length) return null;
  const item = retryItems[retryIdx];

  return (
    <div className="flex-1 flex flex-col">
      <div className="pt-1">
        <ProgressPath done={2} />
      </div>
      <div className="text-center py-2">
        <Chip bg="#EDE4FE" color="#8B5CF6">
          {t("teach.retry")} · {retryIdx + 1} {t("assessment.questionCount")} {retryItems.length}
        </Chip>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-5 pb-2">
        <p className="text-center text-[14px] font-semibold text-[#5B4C79]">
          <span className="ur text-[22px]">{t("teach.trick")}</span>
        </p>

        <div className="flex items-stretch gap-3">
          <div className="flex-1 flex flex-col">
            <div className="bg-white border-[3px] border-[#EFE6FA] rounded-[24px] grid place-items-center shadow-[0_6px_0_rgba(139,92,246,.13)] min-h-[150px] animate-[cardIn_.42s_cubic-bezier(.2,1.2,.35,1)_both]">
              <span className="ur glyph text-[72px] text-[#2B1F42]">
                {item.a}
              </span>
            </div>
            <div className="text-[11.5px] font-extrabold text-[#FF7A2F] mt-1.5 text-center leading-snug">
              {text(item.aHint)}
            </div>
          </div>
          <div className="self-center text-[13px] font-extrabold text-[#7C6F94] w-4 text-center flex-none">
            vs
          </div>
          <div className="flex-1 flex flex-col">
            <div className="bg-white border-[3px] border-[#EFE6FA] rounded-[24px] grid place-items-center shadow-[0_6px_0_rgba(139,92,246,.13)] min-h-[150px] animate-[cardIn_.42s_cubic-bezier(.2,1.2,.35,1)_both] [animation-delay:.07s]">
              <span className="ur glyph text-[72px] text-[#2B1F42]">
                {item.b}
              </span>
            </div>
            <div className="text-[11.5px] font-extrabold text-[#FF7A2F] mt-1.5 text-center leading-snug">
              {text(item.bHint)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            disabled={locked}
            onClick={() => handleAnswer(true)}
            className="rounded-[22px] py-4 flex flex-col items-center justify-center gap-0.5 min-h-[88px]
              bg-[#2E9FE0] text-white font-extrabold
              shadow-[0_6px_0_#1B7AB2] active:translate-y-[5px] active:shadow-[0_1px_0_#1B7AB2]
              transition-transform disabled:opacity-50"
          >
            <span className="ur text-[23px]">{t("teach.same")}</span>
          </button>
          <button
            disabled={locked}
            onClick={() => handleAnswer(false)}
            className="rounded-[22px] py-4 flex flex-col items-center justify-center gap-0.5 min-h-[88px]
              bg-[#FF7A2F] text-white font-extrabold
              shadow-[0_6px_0_#D95A15] active:translate-y-[5px] active:shadow-[0_1px_0_#D95A15]
              transition-transform disabled:opacity-50"
          >
            <span className="ur text-[23px]">{t("teach.different")}</span>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 pb-4 min-h-[60px]">
        <div className="scale-[.42] w-[50px] h-[50px] -my-2">
          <Tara size={120} />
        </div>
        <span className="text-[14px] font-bold text-[#8B5CF6]">
          {t("teach.retry")}
        </span>
      </div>
    </div>
  );
}

function ProcessingStep() {
  const { t } = useLanguage();
  const [stepOn, setStepOn] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setStepOn(1), 500);
    const t2 = setTimeout(() => setStepOn(2), 1250);
    const t3 = setTimeout(() => setStepOn(3), 2000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const lines = [
    "processing.step.gather",
    "processing.step.pattern",
    "processing.step.actions",
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6">
      <div className="w-[78px] h-[78px] rounded-full border-4 border-[#E7F1F0] border-t-[#1C6B66] animate-spin" />
      <div className="text-center">
        <h2 className="text-[19px] font-bold text-[#131A23] tracking-tight">
          {t("processing.title")}
        </h2>
        <p className="text-[12.5px] text-[#6B7686] mt-1">{t("common.loading")}</p>
      </div>
      <div className="flex flex-col gap-3 items-start">
        {lines.map((l, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 transition-opacity duration-500 ${stepOn > i ? "opacity-100" : "opacity-20"}`}
          >
            <div
              className={`w-5 h-5 rounded-full border-2 grid place-items-center transition-all duration-300 ${
                stepOn > i
                  ? "bg-[#2C7A57] border-[#2C7A57]"
                  : "border-[#E3E8EF]"
              }`}
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="3.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`transition-all duration-300 delay-100 ${stepOn > i ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}
              >
                <path d="m4.5 12.5 5 5 10-11" />
              </svg>
            </div>
            <span className="text-[14.5px] text-[#414D5C]">{t(l)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResultStep({
  firstName,
  homeLanguage,
  result,
  onDone,
  onClass,
}: {
  firstName: string;
  homeLanguage: string;
  result: ScoringResult;
  onDone: () => void;
  onClass: () => void;
}) {
  const { language, t, text } = useLanguage();
  const { summary, actions, barrierCategory } = result;
  const severity = getSeverityTier({
    barrierCategory,
    gateConcerns: result.gateConcerns,
  });
  const severityStyles = {
    red: { bg: "bg-[#FDE9E7]", border: "border-[#D64B45]", color: "text-[#8F2622]", icon: "!" },
    yellow: { bg: "bg-[#FFF4D6]", border: "border-[#D59A24]", color: "text-[#76510A]", icon: "!" },
    blue: { bg: "bg-[#E8F0F7]", border: "border-[#4B7FAE]", color: "text-[#285577]", icon: "✓" },
    context: { bg: "bg-[#EEF1F3]", border: "border-[#81909E]", color: "text-[#465664]", icon: "i" },
  }[severity.tier];

  return (
    <div className="flex-1 flex flex-col overflow-y-auto pb-8 -mx-6 px-6">
      <div className={`mt-3 rounded-[17px] border-2 p-4 ${severityStyles.bg} ${severityStyles.border}`} role="status">
        <div className={`flex items-center gap-2 text-[11.5px] font-bold uppercase tracking-wider ${severityStyles.color}`}>
          <span className="grid h-5 w-5 place-items-center rounded-full border-2 border-current text-[11px]">{severityStyles.icon}</span>
          {t(severity.labelKey)}
        </div>
        <p className={`mt-2 text-[14px] font-semibold leading-relaxed ${severityStyles.color}`}>{t(severity.messageKey)}</p>
      </div>

      {/* Header */}
      <div className="flex items-center gap-2 pt-3">
        <Chip bg="#E6F2EC" color="#2C7A57">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m4.5 12.5 5 5 10-11" />
          </svg>
          {t("teacher.completed")}
        </Chip>
        <span className="text-[12px] text-[#6B7686]">
          {firstName} · {homeLanguage}
        </span>
      </div>

      <h1 className="text-[24px] font-bold text-[#131A23] tracking-tight mt-3 leading-tight">
        {t("result.title", { firstName })}
      </h1>

      <div className="mt-5" />

      {/* What went well */}
      <div className="rounded-[17px] p-4 border border-[#CFE6DA] bg-[#E6F2EC]">
        <div className="flex items-center gap-2 mb-2">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#2C7A57"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2.6l2.9 6.2 6.7.8-5 4.6 1.4 6.7L12 17.5l-6 3.4 1.4-6.7-5-4.6 6.7-.8L12 2.6Z" />
          </svg>
          <span className="text-[11.5px] font-bold tracking-wider uppercase text-[#2C7A57]">
            {t("result.wentWell")}
          </span>
        </div>
        <p className="text-[14.5px] text-[#1F5C41] leading-relaxed">
          {text(summary.wentWell)}
        </p>
      </div>

      <div className="mt-3" />

      {/* What stood out */}
      <div className="rounded-[17px] p-4 border border-[#EEDFC2] bg-[#FAF1E1]">
        <div className="flex items-center gap-2 mb-2">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#8A6220"
            strokeWidth="2.4"
            strokeLinecap="round"
          >
            <circle cx="12" cy="12" r="9.5" />
            <path d="M12 7.5V13M12 16.4h.01" />
          </svg>
          <span className="text-[11.5px] font-bold tracking-wider uppercase text-[#8A6220]">
            {t("result.stoodOut")}
          </span>
        </div>
        <p className="text-[14.5px] text-[#6E4E16] leading-relaxed">
          {text(summary.stoodOut)}
        </p>
        <p className="text-[14.5px] text-[#6E4E16] font-semibold mt-2 leading-relaxed">
          {text(summary.teachLine)}
        </p>
      </div>

      <p className="text-[12.5px] text-[#6B7686] mt-3 px-1">{text(summary.languageLine)}</p>

      {/* Actions */}
      <div className="mt-6">
        <span className="text-[11.5px] font-bold tracking-wider uppercase text-[#6B7686]">
          {t("result.nextActions")}
        </span>
      </div>

      {actions.map((action: ActionEntry, i: number) => (
        <div key={action.id} className="flex gap-3 py-4 border-t border-[#E3E8EF]">
          <div className="w-7 h-7 rounded-lg bg-[#E7F1F0] text-[#1C6B66] grid place-items-center text-[13px] font-extrabold flex-none mt-0.5">
            {i + 1}
          </div>
          <div className="flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-[16px] font-bold text-[#131A23] tracking-tight">
                {language === "ur" ? action.titleUrdu : action.title}
              </h3>
              <Chip bg="#E7F1F0" color="#1C6B66">
                {language === "ur" ? action.whenUrdu : action.when}
              </Chip>
            </div>
            <p className="text-[14px] text-[#414D5C] mt-1 leading-relaxed">
              {language === "ur" ? action.descriptionUrdu : action.description}
            </p>
            <span className="ur text-[17px] text-[#1C6B66] mt-1 inline-block">
              {action.titleUrdu}
            </span>
          </div>
        </div>
      ))}

      {/* Disclaimer */}
      <div className="rounded-[18px] bg-[#F1F3F6] border border-[#E1E5EB] p-4 mt-4">
        <p className="text-[12.5px] text-[#6B7686] leading-relaxed">
          <b className="text-[#414D5C]">{t("common.notDiagnosis")}</b> {t("result.disclaimer", { firstName })}
        </p>
      </div>

      {/* Buttons */}
      <div className="flex gap-2 mt-4">
        <Button variant="ghost" onClick={onDone}>
          {t("result.backToChild")} · {firstName}
        </Button>
        <Button onClick={onClass}>{t("result.viewClass")}</Button>
      </div>
    </div>
  );
}
