import type {
  ScoringInput,
  ScoringResult,
  ChannelErrors,
  BarrierCategory,
  TeachVariant,
  GateAnswer,
  MatchResponse,
  RetryResponse,
  LocalizedText,
  GateConcerns,
} from "@/types";
import { getActions } from "@/content/action-library";
import {
  RAN_SLOW_THRESHOLD,
  CHANNEL_ERROR_THRESHOLD,
  CHANNEL_LOW_THRESHOLD,
  TEACH_FULL_RATIO,
  TEACH_PARTIAL_RATIO,
  LANGUAGE_ALL_CHANNELS_THRESHOLD,
} from "./scoring-thresholds";

// ─── Main entry point ───

export function scoreSession(input: ScoringInput): ScoringResult {
  const { gateAnswers, homeLanguage, ranTimeSeconds, matchResponses, retryResponses } =
    input;

  // 1. Gate check
  const gate = checkGateReferral(gateAnswers);
  if (gate.referralFlag) {
    return buildReferralResult(homeLanguage, ranTimeSeconds, {
      vision: gate.visionConcern,
      hearing: gate.hearingConcern,
    });
  }

  // 2. Per-channel error rates
  const channelErrors = computeChannelErrors(matchResponses);

  // 3. RAN speed
  const ranIsSlow = ranTimeSeconds > RAN_SLOW_THRESHOLD;

  // 4. Teach response
  const teachResponse = assessTeachResponse(retryResponses);

  // 5. Classify barrier
  const barrierCategory = classifyBarrier({
    referralFlag: false,
    homeLanguage,
    channelErrors,
    teachResponse,
    ranIsSlow,
  });

  // 6. Select actions
  const actions = getActions(barrierCategory, teachResponse);

  // 7. Generate summary
  const retryCorrect = retryResponses.filter((r) => r.correct).length;
  const retryTotal = retryResponses.length || 1;
  const summary = generateSummary({
    homeLanguage,
    ranTimeSeconds,
    channelErrors,
    teachResponse,
    retryCorrectCount: retryCorrect,
    retryTotalCount: retryTotal,
  });

  return {
    barrierCategory,
    referralFlag: false,
    channelErrors,
    ranTimeSeconds,
    ranIsSlow,
    teachResponse,
    actions,
    gateConcerns: {
      vision: gate.visionConcern,
      hearing: gate.hearingConcern,
    },
    summary,
  };
}

// ─── Gate referral check ───

export function checkGateReferral(answers: GateAnswer[]): {
  referralFlag: boolean;
  visionConcern: boolean;
  hearingConcern: boolean;
} {
  let visionConcern = false;
  let hearingConcern = false;

  for (const a of answers) {
    if (a.referral) {
      // Vision question is index 0, hearing is index 1
      if (a.questionIndex === 0) visionConcern = true;
      if (a.questionIndex === 1) hearingConcern = true;
    }
  }

  return {
    referralFlag: visionConcern || hearingConcern,
    visionConcern,
    hearingConcern,
  };
}

// ─── Per-channel error rates ───

export function computeChannelErrors(responses: MatchResponse[]): ChannelErrors {
  const channels: Record<string, { total: number; errors: number }> = {
    dot_identity: { total: 0, errors: 0 },
    letter_position: { total: 0, errors: 0 },
    diacritic: { total: 0, errors: 0 },
    control: { total: 0, errors: 0 },
  };

  for (const r of responses) {
    const ch = channels[r.channel];
    if (ch) {
      ch.total++;
      if (!r.correct) ch.errors++;
    }
  }

  const rate = (ch: { total: number; errors: number }) =>
    ch.total > 0 ? ch.errors / ch.total : 0;

  return {
    dotIdentity: rate(channels.dot_identity),
    letterPosition: rate(channels.letter_position),
    diacritic: rate(channels.diacritic),
    controlErrors: rate(channels.control),
  };
}

// ─── Teach response assessment ───

export function assessTeachResponse(retries: RetryResponse[]): TeachVariant {
  if (retries.length === 0) return "none";

  const correct = retries.filter((r) => r.correct).length;
  const ratio = correct / retries.length;

  if (ratio >= TEACH_FULL_RATIO) return "full";
  if (ratio >= TEACH_PARTIAL_RATIO) return "partial";
  return "none";
}

// ─── Barrier classification ───

export function classifyBarrier(input: {
  referralFlag: boolean;
  homeLanguage: string;
  channelErrors: ChannelErrors;
  teachResponse: TeachVariant;
  ranIsSlow: boolean;
}): BarrierCategory {
  const { referralFlag, homeLanguage, channelErrors, ranIsSlow } = input;

  // 1. Gate referral overrides everything
  if (referralFlag) return "vision_hearing_referral";

  const dotHigh = channelErrors.dotIdentity > CHANNEL_ERROR_THRESHOLD;
  const posHigh = channelErrors.letterPosition > CHANNEL_ERROR_THRESHOLD;
  const diaHigh = channelErrors.diacritic > CHANNEL_ERROR_THRESHOLD;
  const dotLow = channelErrors.dotIdentity < CHANNEL_LOW_THRESHOLD;
  const posLow = channelErrors.letterPosition < CHANNEL_LOW_THRESHOLD;
  const diaLow = channelErrors.diacritic < CHANNEL_LOW_THRESHOLD;

  const elevatedCount = [dotHigh, posHigh, diaHigh].filter(Boolean).length;

  // 2. Language mismatch: non-Urdu speaker with all channels elevated
  if (
    homeLanguage !== "Urdu" &&
    elevatedCount >= 2 &&
    channelErrors.dotIdentity > LANGUAGE_ALL_CHANNELS_THRESHOLD &&
    channelErrors.letterPosition > LANGUAGE_ALL_CHANNELS_THRESHOLD &&
    channelErrors.diacritic > LANGUAGE_ALL_CHANNELS_THRESHOLD
  ) {
    return "language_mismatch";
  }

  // 3. Single-channel dominant patterns
  if (dotHigh && posLow && diaLow) return "dot_identity_pattern";
  if (posHigh && dotLow && diaLow) return "letter_position_pattern";
  if (diaHigh && dotLow && posLow) return "diacritic_pattern";

  // 4. Slow RAN + spread errors = memorization reliance
  if (ranIsSlow && elevatedCount >= 2) return "memorization_reliance";

  // 5. Spread errors without single dominant channel
  if (elevatedCount >= 2) return "needs_general_practice";

  // 6. If one channel is elevated but not dominant (borderline)
  if (dotHigh) return "dot_identity_pattern";
  if (posHigh) return "letter_position_pattern";
  if (diaHigh) return "diacritic_pattern";

  // 7. No concerns
  return "no_concerns";
}

// ─── Summary text generation ───

export function generateSummary(input: {
  homeLanguage: string;
  ranTimeSeconds: number;
  channelErrors: ChannelErrors;
  teachResponse: TeachVariant;
  retryCorrectCount: number;
  retryTotalCount: number;
}): ScoringResult["summary"] {
  const {
    homeLanguage,
    ranTimeSeconds,
    channelErrors,
    teachResponse,
    retryCorrectCount,
    retryTotalCount,
  } = input;

  const secs = ranTimeSeconds.toFixed(1);

  // What went well
  const wentWell: LocalizedText =
    ranTimeSeconds < RAN_SLOW_THRESHOLD
      ? {
          en: `They named the pictures in ${secs} seconds without hesitating, and they read the familiar items easily. Nothing here points to slow naming speed.`,
          ur: `انہوں نے بغیر ہچکچاہٹ کے تصویروں کے نام ${secs} سیکنڈ میں بتائے اور مانوس چیزیں آسانی سے پڑھیں۔ اس سے نام لینے کی رفتار میں سستی نظر نہیں آتی۔`,
        }
      : {
          en: `They completed all the tasks and kept going even when the letters got tricky. That persistence is worth noticing.`,
          ur: `انہوں نے تمام کام مکمل کیے اور مشکل حروف کے باوجود کوشش جاری رکھی۔ یہ مستقل مزاجی قابلِ توجہ ہے۔`,
        };

  // What stood out — find the dominant error channel
  const stoodOut = getStoodOutLine(channelErrors);

  // Teach line
  const teachLine = getTeachLine(teachResponse, retryCorrectCount, retryTotalCount);

  // Language line
  const languageLine: LocalizedText =
    homeLanguage === "Urdu"
      ? {
          en: "They speak Urdu at home, so the letters are familiar sounds to them.",
          ur: "وہ گھر میں اردو بولتے ہیں، اس لیے یہ حروف ان کے لیے مانوس آوازیں ہیں۔",
        }
      : {
          en: `They speak ${homeLanguage} at home, so give them a moment longer with new Urdu letters.`,
          ur: `وہ گھر میں ${homeLanguage} بولتے ہیں، اس لیے نئے اردو حروف کے لیے انہیں کچھ اضافی وقت دیں۔`,
        };

  return { wentWell, stoodOut, teachLine, languageLine };
}

function getStoodOutLine(errors: ChannelErrors): LocalizedText {
  const channels: { name: string; rate: number; description: LocalizedText }[] = [
    {
      name: "dot-identity",
      rate: errors.dotIdentity,
      description: {
        en: "Almost all the mix-ups were letters with the same body and different dots — like ب and ت. Letters with different shapes gave no trouble at all.",
        ur: "زیادہ تر غلطیاں ایک جیسے جسم اور مختلف نقطوں والے حروف میں تھیں، جیسے ب اور ت۔ مختلف شکل والے حروف میں مشکل نہیں ہوئی۔",
      },
    },
    {
      name: "letter-position",
      rate: errors.letterPosition,
      description: {
        en: "The mix-ups were mostly letters that look very similar — like د and ذ — where a single small dot changes the letter. Other letters were fine.",
        ur: "زیادہ تر غلطیاں ملتے جلتے حروف میں تھیں، جیسے د اور ذ، جہاں ایک چھوٹا نقطہ حرف بدل دیتا ہے۔ دوسرے حروف ٹھیک تھے۔",
      },
    },
    {
      name: "diacritic",
      rate: errors.diacritic,
      description: {
        en: "The mix-ups were mostly with the small vowel marks (zabar, zer, pesh) rather than the letters themselves. The consonant recognition is solid.",
        ur: "زیادہ تر غلطیاں حروف کے بجائے چھوٹے اعراب، یعنی زبر، زیر اور پیش میں تھیں۔ حروف کی پہچان اچھی ہے۔",
      },
    },
  ];

  const sorted = channels.sort((a, b) => b.rate - a.rate);
  const top = sorted[0];

  if (top && top.rate > CHANNEL_LOW_THRESHOLD) {
    return top.description;
  }

  return {
    en: "No specific error pattern stood out today. The mistakes were spread across different letter types, which is common at this age.",
    ur: "آج کوئی خاص غلطی کا نمونہ نمایاں نہیں ہوا۔ غلطیاں مختلف قسم کے حروف میں پھیلی ہوئی تھیں، جو اس عمر میں عام بات ہے۔",
  };
}

function getTeachLine(
  variant: TeachVariant,
  correct: number,
  total: number
): LocalizedText {
  if (variant === "full") {
    return {
      en: `When we showed the trick, they got the next ${total === 1 ? "one" : total} right straight away. That is the important part — the mix-up moves when someone teaches them.`,
      ur: `طریقہ دکھانے کے بعد انہوں نے اگلے ${total === 1 ? "ایک سوال" : `${total} سوالات`} فوراً درست کیے۔ اہم بات یہ ہے کہ سکھانے سے یہ الجھن بدلتی ہے۔`,
    };
  }
  if (variant === "partial") {
    return {
      en: `When we showed the trick, they got ${correct} of the next ${total} right. The idea is starting to land, but it has not stuck yet.`,
      ur: `طریقہ دکھانے کے بعد انہوں نے اگلے ${total} میں سے ${correct} درست کیے۔ خیال سمجھ آ رہا ہے، لیکن ابھی پکا نہیں ہوا۔`,
    };
  }
  return {
    en: `We showed the trick, and they still mixed up the next ${total === 1 ? "one" : total}. That does not mean they cannot learn it. It means one showing was not enough.`,
    ur: `طریقہ دکھانے کے بعد بھی اگلا ${total === 1 ? "سوال" : `${total} سوالات`} الجھ گیا۔ اس کا مطلب یہ نہیں کہ وہ سیکھ نہیں سکتے؛ صرف ایک بار دکھانا کافی نہیں تھا۔`,
  };
}

// ─── Build referral-only result ───

function buildReferralResult(
  homeLanguage: string,
  ranTimeSeconds: number,
  gateConcerns: GateConcerns
): ScoringResult {
  const actions = getActions("vision_hearing_referral", "none");
  return {
    barrierCategory: "vision_hearing_referral",
    referralFlag: true,
    channelErrors: { dotIdentity: 0, letterPosition: 0, diacritic: 0, controlErrors: 0 },
    ranTimeSeconds,
    ranIsSlow: false,
    teachResponse: "none",
    actions,
    gateConcerns,
    summary: {
      wentWell: {
        en: "They completed the tasks they attempted. The gate questions flagged something we should check first.",
        ur: "انہوں نے جو کام شروع کیے وہ مکمل کیے۔ گیٹ کے سوالات نے ایسی بات بتائی ہے جسے پہلے دیکھنا چاہیے۔",
      },
      stoodOut: {
        en: "Before we look at reading patterns, the gate questions suggest a vision or hearing concern. This is often the simplest thing to fix — and the most important.",
        ur: "پڑھنے کے نمونے دیکھنے سے پہلے گیٹ کے سوالات بینائی یا سماعت کی تشویش بتاتے ہیں۔ یہ اکثر آسانی سے حل ہونے والی اور سب سے اہم رکاوٹ ہوتی ہے۔",
      },
      teachLine: {
        en: "We did not reach the teaching part of the session. The referral should come first.",
        ur: "ہم تشخیص کے سکھانے والے حصے تک نہیں پہنچے۔ پہلے ماہر سے جانچ کروانا ضروری ہے۔",
      },
      languageLine:
        homeLanguage === "Urdu"
          ? { en: "They speak Urdu at home.", ur: "وہ گھر میں اردو بولتے ہیں۔" }
          : { en: `They speak ${homeLanguage} at home.`, ur: `وہ گھر میں ${homeLanguage} بولتے ہیں۔` },
    },
  };
}
