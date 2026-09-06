import type { RetryItem } from "@/types";

// Retry items for the micro-teach phase.
// These are presented AFTER the teaching moment, with feedback.
// Grouped by error channel so the teach flow can pick the right set.

export const RETRY_ITEMS: Record<string, RetryItem[]> = {
  dot_identity: [
    {
      id: "retry-dot-1",
      a: "ب",
      b: "ت",
      same: false,
      channel: "dot_identity",
      aHint: { ur: "نیچے ایک نقطہ", en: "1 dot below" },
      bHint: { ur: "اوپر دو نقطے", en: "2 dots above" },
    },
    {
      id: "retry-dot-2",
      a: "ت",
      b: "ث",
      same: false,
      channel: "dot_identity",
      aHint: { ur: "اوپر دو نقطے", en: "2 dots above" },
      bHint: { ur: "اوپر تین نقطے", en: "3 dots above" },
    },
    {
      id: "retry-dot-3",
      a: "ج",
      b: "چ",
      same: false,
      channel: "dot_identity",
      aHint: { ur: "نیچے ایک نقطہ", en: "1 dot below" },
      bHint: { ur: "نیچے تین نقطے", en: "3 dots below" },
    },
  ],
  letter_position: [
    {
      id: "retry-pos-1",
      a: "د",
      b: "ذ",
      same: false,
      channel: "letter_position",
      aHint: { ur: "کوئی نقطہ نہیں", en: "No dot" },
      bHint: { ur: "اوپر ایک نقطہ", en: "1 dot above" },
    },
    {
      id: "retry-pos-2",
      a: "ر",
      b: "ز",
      same: false,
      channel: "letter_position",
      aHint: { ur: "کوئی نقطہ نہیں", en: "No dot" },
      bHint: { ur: "اوپر ایک نقطہ", en: "1 dot above" },
    },
  ],
  diacritic: [
    {
      id: "retry-dia-1",
      a: "بَ",
      b: "بِ",
      same: false,
      channel: "diacritic",
      aHint: { ur: "اوپر زبر (اَ کی آواز)", en: "zabar (a sound) on top" },
      bHint: { ur: "نیچے زیر (اِ کی آواز)", en: "zer (i sound) below" },
    },
    {
      id: "retry-dia-2",
      a: "تُ",
      b: "تَ",
      same: false,
      channel: "diacritic",
      aHint: { ur: "اوپر پیش (اُ کی آواز)", en: "pesh (u sound) on top" },
      bHint: { ur: "اوپر زبر (اَ کی آواز)", en: "zabar (a sound) on top" },
    },
  ],
};

// Get retry items for a given channel
export function getRetryItems(channel: string, count: number = 2): RetryItem[] {
  const items = RETRY_ITEMS[channel] || RETRY_ITEMS.dot_identity;
  return items.slice(0, count);
}
