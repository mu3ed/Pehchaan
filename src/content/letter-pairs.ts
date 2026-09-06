import type { LetterPair } from "@/types";

// Urdu letter discrimination pairs.
// Three error channels, each with real minimal pairs, plus control (same) pairs.
//
// Verified codepoints:
//   ب U+0628 (1 dot below) · ت U+062A (2 dots above) · ث U+062B (3 dots above)
//   پ U+067E (3 dots below) · ٹ U+0679 (small ط above)
//   ج U+062C (1 dot below) · چ U+0686 (3 dots below) · ح U+062D (no dots) · خ U+062E (1 dot above)
//   س U+0633 (no dots) · ش U+0634 (3 dots above)
//   د U+062F · ذ U+0630 (1 dot above)
//   ر U+0631 · ز U+0632 (1 dot above)
//   ن U+0646 (1 dot above)

export const ALL_PAIRS: LetterPair[] = [
  // ─── Dot-identity channel (same body, different dots) ───
  { id: "dot-1", a: "ب", b: "ت", same: false, channel: "dot_identity", dotOnly: true },
  { id: "dot-2", a: "ج", b: "چ", same: false, channel: "dot_identity", dotOnly: true },
  { id: "dot-3", a: "س", b: "ش", same: false, channel: "dot_identity", dotOnly: true },
  { id: "dot-4", a: "ب", b: "ث", same: false, channel: "dot_identity", dotOnly: true },
  { id: "dot-5", a: "ح", b: "خ", same: false, channel: "dot_identity", dotOnly: true },
  { id: "dot-6", a: "ج", b: "ح", same: false, channel: "dot_identity", dotOnly: true },

  // ─── Letter-position / shape channel ───
  // These pairs differ by a single dot that changes letter identity,
  // often involving letters that look similar in isolated form
  { id: "pos-1", a: "د", b: "ذ", same: false, channel: "letter_position", dotOnly: false },
  { id: "pos-2", a: "ر", b: "ز", same: false, channel: "letter_position", dotOnly: false },
  { id: "pos-3", a: "ص", b: "ض", same: false, channel: "letter_position", dotOnly: false },
  { id: "pos-4", a: "ط", b: "ظ", same: false, channel: "letter_position", dotOnly: false },

  // ─── Diacritic channel (same consonant, different short-vowel marks) ───
  // Using Unicode combining marks: U+064E zabar (a), U+0650 zer (i), U+064F pesh (u)
  { id: "dia-1", a: "بَ", b: "بِ", same: false, channel: "diacritic", dotOnly: false },
  { id: "dia-2", a: "کُ", b: "کَ", same: false, channel: "diacritic", dotOnly: false },
  { id: "dia-3", a: "تُ", b: "تَ", same: false, channel: "diacritic", dotOnly: false },
  { id: "dia-4", a: "سِ", b: "سُ", same: false, channel: "diacritic", dotOnly: false },

  // ─── Control pairs (identical letters — child should say "same") ───
  { id: "ctrl-1", a: "د", b: "د", same: true, channel: "control", dotOnly: false },
  { id: "ctrl-2", a: "ن", b: "ن", same: true, channel: "control", dotOnly: false },
  { id: "ctrl-3", a: "ل", b: "ل", same: true, channel: "control", dotOnly: false },
  { id: "ctrl-4", a: "م", b: "م", same: true, channel: "control", dotOnly: false },
];

// Select a balanced subset for a session.
// Default: 4 dot-identity + 2 position + 2 diacritic + 2 control = 10 pairs.
export function selectPairs(count: number = 10): LetterPair[] {
  const dot = shuffle(ALL_PAIRS.filter((p) => p.channel === "dot_identity"));
  const pos = shuffle(ALL_PAIRS.filter((p) => p.channel === "letter_position"));
  const dia = shuffle(ALL_PAIRS.filter((p) => p.channel === "diacritic"));
  const ctrl = shuffle(ALL_PAIRS.filter((p) => p.channel === "control"));

  const dotCount = Math.min(4, dot.length);
  const posCount = Math.min(2, pos.length);
  const diaCount = Math.min(2, dia.length);
  const ctrlCount = Math.min(2, ctrl.length);

  const selected = [
    ...dot.slice(0, dotCount),
    ...pos.slice(0, posCount),
    ...dia.slice(0, diaCount),
    ...ctrl.slice(0, ctrlCount),
  ];

  // Trim or pad to desired count
  const trimmed = selected.slice(0, count);

  // Shuffle the final order so channels are interleaved
  return shuffle(trimmed);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
