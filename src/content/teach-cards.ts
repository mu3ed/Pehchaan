import type { TeachCard } from "@/types";

// One teach card per error channel.
// The teaching moment shows the child the "trick" for distinguishing
// letters in that channel, then presents retry items.

export const TEACH_CARDS: Record<string, TeachCard> = {
  dot_identity: {
    channel: "dot_identity",
    titleUrdu: "نقطے گنو!",
    titleEnglish: "Here is the trick",
    explanation: {
      ur: "ان دونوں حروف کا جسم ایک جیسا ہے۔ صرف نقطے مختلف ہیں۔ نقطے گنیں اور دیکھیں کہ وہ اوپر ہیں یا نیچے۔",
      en: "These two letters have the same body. Only the dots are different. Count the dots, then look whether they sit above or below.",
    },
    letterA: "ب",
    letterB: "ت",
    aDotDescription: { ur: "نیچے ایک نقطہ", en: "1 dot below" },
    bDotDescription: { ur: "اوپر دو نقطے", en: "2 dots above" },
  },
  letter_position: {
    channel: "letter_position",
    titleUrdu: "نقطہ دیکھو!",
    titleEnglish: "Look for the dot",
    explanation: {
      ur: "یہ حروف تقریباً ایک جیسے لگتے ہیں، لیکن ایک پر چھوٹا نقطہ ہے اور دوسرے پر نہیں۔ حرف کے اوپر نقطہ غور سے دیکھیں۔",
      en: "These letters look almost the same, but one has a small dot and one does not. Look carefully for the dot above the letter.",
    },
    letterA: "د",
    letterB: "ذ",
    aDotDescription: { ur: "کوئی نقطہ نہیں", en: "No dot" },
    bDotDescription: { ur: "اوپر ایک نقطہ", en: "1 dot above" },
  },
  diacritic: {
    channel: "diacritic",
    titleUrdu: "اعراب دیکھو!",
    titleEnglish: "Look at the marks",
    explanation: {
      ur: "یہ حروف ایک جیسے ہیں، لیکن اوپر یا نیچے کے چھوٹے نشانات آواز بدل دیتے ہیں۔ اوپر کی لکیر زبر ہے، نیچے کی لکیر زیر ہے۔",
      en: "These letters are the same, but the small marks above or below change the sound. The line on top is zabar (a-sound), the line below is zer (i-sound).",
    },
    letterA: "بَ",
    letterB: "بِ",
    aDotDescription: { ur: "اوپر زبر (اَ کی آواز)", en: "zabar on top (a-sound)" },
    bDotDescription: { ur: "نیچے زیر (اِ کی آواز)", en: "zer below (i-sound)" },
  },
};

// Pick the teach card for the channel with the most errors
export function pickTeachChannel(
  channelErrors: Record<string, number>
): string {
  const entries = Object.entries(channelErrors)
    .filter(([key]) => key !== "control")
    .sort(([, a], [, b]) => b - a);
  return entries.length > 0 ? entries[0][0] : "dot_identity";
}
