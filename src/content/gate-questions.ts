import type { GateQuestion } from "@/types";

export const GATE_QUESTIONS: GateQuestion[] = [
  {
    id: "vision",
    question: {
      ur: "کیا {firstName} جہاں بیٹھتے ہیں وہاں سے تختہ صاف دیکھ سکتے ہیں؟",
      en: "Can {firstName} see the board clearly from where they sit?",
    },
    note: {
      ur: "ان سے کہیں کہ تختے پر لکھا ہوا ایک لفظ پڑھیں۔",
      en: "Ask them to read one word you have written on the board.",
    },
    options: [
      { label: { ur: "جی ہاں، صاف", en: "Yes, clearly" }, icon: "eye", referral: false },
      { label: { ur: "یقین نہیں", en: "Not sure" }, icon: "help", referral: false },
      { label: { ur: "نہیں / آنکھیں سکیڑتے ہیں", en: "No / they squint" }, icon: "eye", referral: true },
    ],
  },
  {
    id: "hearing",
    question: {
      ur: "کیا {firstName} پیچھے سے نام پکارنے پر مڑتے ہیں؟",
      en: "Does {firstName} turn when you call their name from behind?",
    },
    note: {
      ur: "ان کے پیچھے چند قدم کھڑے ہو کر معمول کے مطابق ایک بار نام پکاریں۔",
      en: "Stand a few steps behind and say their name once, normally.",
    },
    options: [
      { label: { ur: "جی ہاں، ہر بار", en: "Yes, every time" }, icon: "ear", referral: false },
      { label: { ur: "کبھی کبھی", en: "Sometimes" }, icon: "help", referral: false },
      { label: { ur: "نہیں", en: "No" }, icon: "ear", referral: true },
    ],
  },
  {
    id: "language",
    question: {
      ur: "{firstName} گھر میں کون سی زبان بولتے ہیں؟",
      en: "What language does {firstName} speak at home?",
    },
    note: {
      ur: "اس سے ہماری تجاویز بدلتی ہیں — یہ کوئی مسئلہ نہیں ہے۔",
      en: "This changes what we suggest — it is not a problem.",
    },
    options: [
      {
        label: { ur: "پنجابی", en: "Punjabi" },
        icon: "globe",
        referral: false,
        homeLanguage: "Punjabi",
      },
      {
        label: { ur: "اردو", en: "Urdu" },
        icon: "globe",
        referral: false,
        homeLanguage: "Urdu",
      },
      {
        label: { ur: "پشتو یا سندھی", en: "Pashto or Sindhi" },
        icon: "globe",
        referral: false,
        homeLanguage: "Pashto",
      },
      {
        label: { ur: "کوئی اور زبان", en: "Another language" },
        icon: "globe",
        referral: false,
        homeLanguage: "Other",
      },
    ],
  },
];
