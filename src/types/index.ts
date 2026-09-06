export type Language = "ur" | "en";

export interface LocalizedText {
  ur: string;
  en: string;
}

export type SeverityTier = "red" | "yellow" | "blue" | "context";

export interface GateConcerns {
  vision: boolean;
  hearing: boolean;
}

// ─── Gate Questions ───

export interface GateOption {
  label: LocalizedText;
  icon: "eye" | "ear" | "help" | "globe";
  referral: boolean;
  homeLanguage?: string;
}

export interface GateQuestion {
  id: string;
  question: LocalizedText;
  note: LocalizedText;
  options: GateOption[];
}

export interface GateAnswer {
  questionIndex: number;
  selectedOption: number;
  referral: boolean;
  homeLanguage?: string;
}

// ─── RAN Task ───

export interface RANTile {
  id: string;
  icon: string;
}

// ─── Letter Discrimination ───

export type ErrorChannel =
  | "dot_identity"
  | "letter_position"
  | "diacritic"
  | "control";

export interface LetterPair {
  id: string;
  a: string;
  b: string;
  same: boolean;
  channel: ErrorChannel;
  dotOnly: boolean;
}

export interface MatchResponse {
  pairIndex: number;
  a: string;
  b: string;
  channel: ErrorChannel;
  correctSame: boolean;
  childAnsweredSame: boolean;
  correct: boolean;
  responseTimeMs: number;
}

// ─── Micro-teach + Retry ───

export interface RetryItem {
  id: string;
  a: string;
  b: string;
  same: boolean;
  channel: ErrorChannel;
  aHint: LocalizedText;
  bHint: LocalizedText;
}

export interface RetryResponse {
  retryIndex: number;
  a: string;
  b: string;
  channel: ErrorChannel;
  correctSame: boolean;
  childAnsweredSame: boolean;
  correct: boolean;
  responseTimeMs: number;
}

export interface TeachCard {
  channel: ErrorChannel;
  titleUrdu: string;
  titleEnglish: string;
  explanation: LocalizedText;
  letterA: string;
  letterB: string;
  aDotDescription: LocalizedText;
  bDotDescription: LocalizedText;
}

// ─── Action Library ───

export interface ActionEntry {
  id: string;
  barrierCategory: string;
  priority: number;
  title: string;
  description: string;
  descriptionUrdu?: string;
  when: string;
  whenUrdu?: string;
  titleUrdu: string;
}

export type TeachVariant = "full" | "partial" | "none";

// ─── Scoring ───

export type BarrierCategory =
  | "no_concerns"
  | "vision_hearing_referral"
  | "language_mismatch"
  | "dot_identity_pattern"
  | "letter_position_pattern"
  | "diacritic_pattern"
  | "memorization_reliance"
  | "needs_general_practice";

export interface ScoringInput {
  gateAnswers: GateAnswer[];
  homeLanguage: string;
  ranTimeSeconds: number;
  ranTotalTaps: number;
  matchResponses: MatchResponse[];
  retryResponses: RetryResponse[];
}

export interface ChannelErrors {
  dotIdentity: number;
  letterPosition: number;
  diacritic: number;
  controlErrors: number;
}

export interface ScoringResult {
  barrierCategory: BarrierCategory;
  referralFlag: boolean;
  channelErrors: ChannelErrors;
  ranTimeSeconds: number;
  ranIsSlow: boolean;
  teachResponse: TeachVariant;
  actions: ActionEntry[];
  gateConcerns: GateConcerns;
  summary: {
    wentWell: LocalizedText;
    stoodOut: LocalizedText;
    teachLine: LocalizedText;
    languageLine: LocalizedText;
  };
}

export interface SeverityInput {
  barrierCategory: string;
  gateConcerns: GateConcerns;
}

export interface SeverityResult {
  tier: SeverityTier;
  priority: number;
  labelKey: string;
  messageKey: string;
}

// ─── Class View ───

export interface ClassGroup {
  barrierCategory: BarrierCategory;
  label?: string;
  hint?: string;
  tone?: "note" | "note2" | "good";
  tier?: SeverityTier;
  children: {
    id: string;
    name: string;
    detail: string;
    sessionDate: string;
  }[];
}
