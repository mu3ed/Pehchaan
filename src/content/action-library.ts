import type { ActionEntry, TeachVariant } from "@/types";

// Action library: maps (barrierCategory, teachVariant) to ordered actions.
// Each action has English text, Urdu text, timing, and description.
// The scoring engine selects actions from this library based on the session result.

const ACTIONS: Record<string, Record<TeachVariant, ActionEntry[]>> = {
  vision_hearing_referral: {
    full: [
      {
        id: "vhr-1",
        barrierCategory: "vision_hearing_referral",
        priority: 1,
        title: "Refer for a vision or hearing check",
        description:
          "Before we look at reading, the gate questions suggest something physical might be in the way. A quick check with the school nurse or a referral to a health centre will tell you more.",
        when: "This week",
        titleUrdu: "بینائی یا سماعت کی جانچ",
      },
      {
        id: "vhr-2",
        barrierCategory: "vision_hearing_referral",
        priority: 2,
        title: "Move them to the front rows meanwhile",
        description:
          "While waiting for the check, seating them closer to the board removes one possible barrier immediately.",
        when: "Tomorrow",
        titleUrdu: "آگے بٹھائیں",
      },
    ],
    partial: [
      {
        id: "vhr-1",
        barrierCategory: "vision_hearing_referral",
        priority: 1,
        title: "Refer for a vision or hearing check",
        description:
          "Before we look at reading, the gate questions suggest something physical might be in the way. A quick check with the school nurse or a referral to a health centre will tell you more.",
        when: "This week",
        titleUrdu: "بینائی یا سماعت کی جانچ",
      },
      {
        id: "vhr-2",
        barrierCategory: "vision_hearing_referral",
        priority: 2,
        title: "Move them to the front rows meanwhile",
        description:
          "While waiting for the check, seating them closer to the board removes one possible barrier immediately.",
        when: "Tomorrow",
        titleUrdu: "آگے بٹھائیں",
      },
    ],
    none: [
      {
        id: "vhr-1",
        barrierCategory: "vision_hearing_referral",
        priority: 1,
        title: "Refer for a vision or hearing check",
        description:
          "Before we look at reading, the gate questions suggest something physical might be in the way. A quick check with the school nurse or a referral to a health centre will tell you more.",
        when: "This week",
        titleUrdu: "بینائی یا سماعت کی جانچ",
      },
      {
        id: "vhr-2",
        barrierCategory: "vision_hearing_referral",
        priority: 2,
        title: "Move them to the front rows meanwhile",
        description:
          "While waiting for the check, seating them closer to the board removes one possible barrier immediately.",
        when: "Tomorrow",
        titleUrdu: "آگے بٹھائیں",
      },
    ],
  },

  language_mismatch: {
    full: [
      {
        id: "lm-1",
        barrierCategory: "language_mismatch",
        priority: 1,
        title: "Give extra time with new Urdu words",
        description:
          "The child speaks a different language at home. The letter confusions may simply be unfamiliarity with Urdu sounds, not a reading difficulty. Allow a few extra seconds before expecting an answer.",
        when: "Ongoing",
        titleUrdu: "اردو الفاظ کے لیے اضافی وقت",
      },
      {
        id: "lm-2",
        barrierCategory: "language_mismatch",
        priority: 2,
        title: "Pair with a Urdu-fluent classmate",
        description:
          "Seat them next to a confident Urdu reader for shared reading activities. Hearing the sounds from a peer is often more effective than extra teacher time.",
        when: "This week",
        titleUrdu: "اردو جاننے والے ساتھی کے ساتھ",
      },
      {
        id: "lm-3",
        barrierCategory: "language_mismatch",
        priority: 3,
        title: "Check again in four weeks",
        description:
          "With more exposure to Urdu in class, the gap often narrows quickly. Re-run this check in a month to see if the pattern has changed.",
        when: "In four weeks",
        titleUrdu: "چار ہفتے بعد دوبارہ دیکھیں",
      },
    ],
    partial: [
      {
        id: "lm-1",
        barrierCategory: "language_mismatch",
        priority: 1,
        title: "Give extra time with new Urdu words",
        description:
          "The child speaks a different language at home. The letter confusions may simply be unfamiliarity with Urdu sounds, not a reading difficulty. Allow a few extra seconds before expecting an answer.",
        when: "Ongoing",
        titleUrdu: "اردو الفاظ کے لیے اضافی وقت",
      },
      {
        id: "lm-2",
        barrierCategory: "language_mismatch",
        priority: 2,
        title: "Pair with a Urdu-fluent classmate",
        description:
          "Seat them next to a confident Urdu reader for shared reading activities. Hearing the sounds from a peer is often more effective than extra teacher time.",
        when: "This week",
        titleUrdu: "اردو جاننے والے ساتھی کے ساتھ",
      },
      {
        id: "lm-3",
        barrierCategory: "language_mismatch",
        priority: 3,
        title: "Tell the parents and check again in three weeks",
        description:
          "The teaching moment helped a little but not fully. Share this with the parents so Urdu practice happens at home too, and re-check sooner.",
        when: "In three weeks",
        titleUrdu: "تین ہفتے بعد دوبارہ دیکھیں",
      },
    ],
    none: [
      {
        id: "lm-1",
        barrierCategory: "language_mismatch",
        priority: 1,
        title: "Involve parents in daily Urdu practice",
        description:
          "The teaching moment did not transfer yet. This may be a deeper language gap. Talk to the parents about reading simple Urdu stories at home alongside the home language.",
        when: "This week",
        titleUrdu: "والدین کو شامل کریں",
      },
      {
        id: "lm-2",
        barrierCategory: "language_mismatch",
        priority: 2,
        title: "Daily five minutes of Urdu sound practice",
        description:
          "Spend five minutes each day on basic Urdu letter sounds, not just letter shapes. Saying the sounds aloud builds the phonological map that the written letters connect to.",
        when: "Start tomorrow",
        titleUrdu: "روزانہ پانچ منٹ آوازیں",
      },
      {
        id: "lm-3",
        barrierCategory: "language_mismatch",
        priority: 3,
        title: "Check again in two weeks",
        description:
          "Re-run this check soon. If the pattern persists, discuss with your head teacher whether additional language support is available.",
        when: "In two weeks",
        titleUrdu: "دو ہفتے بعد دوبارہ دیکھیں",
      },
    ],
  },

  dot_identity_pattern: {
    full: [
      {
        id: "di-f-1",
        barrierCategory: "dot_identity_pattern",
        priority: 1,
        title: "Move them to the front two rows",
        description:
          "Not because their eyes are weak — because dots are small. From row six, ب and ت look identical to anyone.",
        when: "Tomorrow",
        titleUrdu: "آگے بٹھائیں",
      },
      {
        id: "di-f-2",
        barrierCategory: "dot_identity_pattern",
        priority: 2,
        title: "Five minutes a week on dot pairs",
        description:
          "Write ب ت ث on the board. Ask the whole class to call out how many dots, and whether they sit above or below. Do it as a class game so this child is not the only one practising.",
        when: "This week",
        titleUrdu: "نقطے گنو",
      },
      {
        id: "di-f-3",
        barrierCategory: "dot_identity_pattern",
        priority: 3,
        title: "Check the same pairs again",
        description:
          "If the mix-ups have gone, carry on as normal. If they are still there, tell the parents and your head teacher so more than one person is helping.",
        when: "In two weeks",
        titleUrdu: "دو ہفتے بعد دوبارہ دیکھیں",
      },
    ],
    partial: [
      {
        id: "di-p-1",
        barrierCategory: "dot_identity_pattern",
        priority: 1,
        title: "Move them to the front two rows",
        description:
          "Not because their eyes are weak — because dots are small. From row six, ب and ت look identical to anyone.",
        when: "Tomorrow",
        titleUrdu: "آگے بٹھائیں",
      },
      {
        id: "di-p-2",
        barrierCategory: "dot_identity_pattern",
        priority: 2,
        title: "Five minutes twice a week on dot pairs",
        description:
          "Write ب ت ث on the board and have the whole class call out how many dots, and whether they sit above or below. Twice a week rather than once — the idea is starting to land but needs to become automatic.",
        when: "This week",
        titleUrdu: "ہفتے میں دو بار",
      },
      {
        id: "di-p-3",
        barrierCategory: "dot_identity_pattern",
        priority: 3,
        title: "Check the same pairs again",
        description:
          "Mention it to the parents now so the counting happens at home too. If the mix-ups are still there in two weeks, bring your head teacher in as well.",
        when: "In two weeks",
        titleUrdu: "دو ہفتے بعد دوبارہ دیکھیں",
      },
    ],
    none: [
      {
        id: "di-n-1",
        barrierCategory: "dot_identity_pattern",
        priority: 1,
        title: "Move them to the front two rows",
        description:
          "Not because their eyes are weak — because dots are small. From row six, ب and ت look identical to anyone.",
        when: "Tomorrow",
        titleUrdu: "آگے بٹھائیں",
      },
      {
        id: "di-n-2",
        barrierCategory: "dot_identity_pattern",
        priority: 2,
        title: "Five minutes a day, sitting beside them",
        description:
          "Write ب ت ث on the board for the class, then spend five minutes next to this child counting the dots out loud together. Saying the count aloud is the part they are skipping.",
        when: "Start tomorrow",
        titleUrdu: "ساتھ بیٹھ کر گنیں",
      },
      {
        id: "di-n-3",
        barrierCategory: "dot_identity_pattern",
        priority: 3,
        title: "Tell the parents this week, and check again sooner",
        description:
          "Do not wait a fortnight. Tell the parents and your head teacher this week so more than one person is counting dots with them, and run the same pairs again in a week.",
        when: "In one week",
        titleUrdu: "ایک ہفتے بعد دوبارہ دیکھیں",
      },
    ],
  },

  letter_position_pattern: {
    full: [
      {
        id: "lp-f-1",
        barrierCategory: "letter_position_pattern",
        priority: 1,
        title: "Show letter forms in context",
        description:
          "Write the confusing pairs in words, not in isolation. Seeing د inside a word like درخت helps the brain anchor the shape to a meaning, not just a visual pattern.",
        when: "This week",
        titleUrdu: "لفظ میں دکھائیں",
      },
      {
        id: "lp-f-2",
        barrierCategory: "letter_position_pattern",
        priority: 2,
        title: "Five minutes a week on similar-looking pairs",
        description:
          "Write د/ذ, ر/ز on the board. Point to the dot (or its absence) and have the class call out which letter it is.",
        when: "This week",
        titleUrdu: "مشابہ حروف کی مشق",
      },
      {
        id: "lp-f-3",
        barrierCategory: "letter_position_pattern",
        priority: 3,
        title: "Check again in two weeks",
        description:
          "If the mix-ups have gone, carry on. If they persist, mention it to the parents and head teacher.",
        when: "In two weeks",
        titleUrdu: "دو ہفتے بعد دوبارہ دیکھیں",
      },
    ],
    partial: [
      {
        id: "lp-p-1",
        barrierCategory: "letter_position_pattern",
        priority: 1,
        title: "Show letter forms in context",
        description:
          "Write the confusing pairs in words, not in isolation. Seeing د inside a word like درخت helps the brain anchor the shape to a meaning.",
        when: "This week",
        titleUrdu: "لفظ میں دکھائیں",
      },
      {
        id: "lp-p-2",
        barrierCategory: "letter_position_pattern",
        priority: 2,
        title: "Twice-a-week practice on similar-looking letters",
        description:
          "The idea is starting to land. Give more repetition — twice a week on these pairs until the distinction becomes automatic.",
        when: "This week",
        titleUrdu: "ہفتے میں دو بار",
      },
      {
        id: "lp-p-3",
        barrierCategory: "letter_position_pattern",
        priority: 3,
        title: "Check again in two weeks",
        description:
          "Mention it to the parents. If the pattern persists, discuss with your head teacher.",
        when: "In two weeks",
        titleUrdu: "دو ہفتے بعد دوبارہ دیکھیں",
      },
    ],
    none: [
      {
        id: "lp-n-1",
        barrierCategory: "letter_position_pattern",
        priority: 1,
        title: "Daily five minutes on letter-form differences",
        description:
          "Sit beside the child and point to each letter in a word, naming it aloud. The one showing was not enough — they need repeated exposure.",
        when: "Start tomorrow",
        titleUrdu: "روزانہ پانچ منٹ",
      },
      {
        id: "lp-n-2",
        barrierCategory: "letter_position_pattern",
        priority: 2,
        title: "Tell the parents and check again in one week",
        description:
          "Do not wait. The pattern did not shift with one teaching moment, which means more practice is needed.",
        when: "In one week",
        titleUrdu: "ایک ہفتے بعد دوبارہ دیکھیں",
      },
    ],
  },

  diacritic_pattern: {
    full: [
      {
        id: "dp-f-1",
        barrierCategory: "diacritic_pattern",
        priority: 1,
        title: "Teach the three short-vowel marks explicitly",
        description:
          "Show zabar ( َ ), zer ( ِ ), and pesh ( ُ ) on the board. Have the class say the sound each one makes. Do it as a group activity so the child is not singled out.",
        when: "This week",
        titleUrdu: "اعراب سکھائیں",
      },
      {
        id: "dp-f-2",
        barrierCategory: "diacritic_pattern",
        priority: 2,
        title: "Read marked text aloud together",
        description:
          "Use textbook passages that include vowel marks. Reading aloud together helps the child connect the visual mark to the spoken sound.",
        when: "This week",
        titleUrdu: "اعراب والی عبارت پڑھیں",
      },
      {
        id: "dp-f-3",
        barrierCategory: "diacritic_pattern",
        priority: 3,
        title: "Check again in two weeks",
        description:
          "If the diacritic confusion has cleared, carry on. If not, involve the parents.",
        when: "In two weeks",
        titleUrdu: "دو ہفتے بعد دوبارہ دیکھیں",
      },
    ],
    partial: [
      {
        id: "dp-p-1",
        barrierCategory: "diacritic_pattern",
        priority: 1,
        title: "Teach vowel marks explicitly, twice a week",
        description:
          "The concept is starting to land but needs repetition. Show zabar, zer, pesh on the board twice a week.",
        when: "This week",
        titleUrdu: "ہفتے میں دو بار اعراب",
      },
      {
        id: "dp-p-2",
        barrierCategory: "diacritic_pattern",
        priority: 2,
        title: "Check again in two weeks",
        description:
          "Mention it to the parents so practice happens at home too.",
        when: "In two weeks",
        titleUrdu: "دو ہفتے بعد دوبارہ دیکھیں",
      },
    ],
    none: [
      {
        id: "dp-n-1",
        barrierCategory: "diacritic_pattern",
        priority: 1,
        title: "Daily practice with vowel-marked words",
        description:
          "Sit with the child and read short words with zabar, zer, pesh marked. Say each sound together. One showing was not enough for this child.",
        when: "Start tomorrow",
        titleUrdu: "روزانہ اعراب کی مشق",
      },
      {
        id: "dp-n-2",
        barrierCategory: "diacritic_pattern",
        priority: 2,
        title: "Tell parents and check again in one week",
        description:
          "The diacritic distinction did not transfer. Involve more than one person in practising.",
        when: "In one week",
        titleUrdu: "ایک ہفتے بعد دوبارہ دیکھیں",
      },
    ],
  },

  memorization_reliance: {
    full: [
      {
        id: "mr-f-1",
        barrierCategory: "memorization_reliance",
        priority: 1,
        title: "Mix in unfamiliar words during reading practice",
        description:
          "The child reads familiar words well but struggles with new ones — a sign of relying on memory rather than decoding. Add a few words they have never seen before to daily reading.",
        when: "This week",
        titleUrdu: "نئے الفاظ شامل کریں",
      },
      {
        id: "mr-f-2",
        barrierCategory: "memorization_reliance",
        priority: 2,
        title: "Sound out letters before saying the word",
        description:
          "Encourage the child to point at each letter and say its sound before trying to read the whole word. This builds the decoding habit they are skipping.",
        when: "Ongoing",
        titleUrdu: "پہلے آواز، پھر لفظ",
      },
      {
        id: "mr-f-3",
        barrierCategory: "memorization_reliance",
        priority: 3,
        title: "Check again in three weeks",
        description:
          "If decoding is improving, carry on. If still relying on memory, discuss with your head teacher.",
        when: "In three weeks",
        titleUrdu: "تین ہفتے بعد دوبارہ دیکھیں",
      },
    ],
    partial: [
      {
        id: "mr-p-1",
        barrierCategory: "memorization_reliance",
        priority: 1,
        title: "Daily decoding practice with new words",
        description:
          "The teaching helped a little. Keep building the habit — five minutes daily with words they have not memorised.",
        when: "Start tomorrow",
        titleUrdu: "روزانہ نئے الفاظ",
      },
      {
        id: "mr-p-2",
        barrierCategory: "memorization_reliance",
        priority: 2,
        title: "Tell parents and check again in two weeks",
        description:
          "Share the decoding strategy with parents so it happens at home too.",
        when: "In two weeks",
        titleUrdu: "دو ہفتے بعد دوبارہ دیکھیں",
      },
    ],
    none: [
      {
        id: "mr-n-1",
        barrierCategory: "memorization_reliance",
        priority: 1,
        title: "Intensive decoding practice, daily",
        description:
          "The child is relying heavily on memorisation. Spend daily time sounding out letters in unfamiliar words. Sit beside them and model the process.",
        when: "Start tomorrow",
        titleUrdu: "روزانہ ڈیکوڈنگ مشق",
      },
      {
        id: "mr-n-2",
        barrierCategory: "memorization_reliance",
        priority: 2,
        title: "Involve parents and head teacher",
        description:
          "This pattern needs more support than one teacher can give in spare minutes. Discuss what additional resources are available.",
        when: "This week",
        titleUrdu: "والدین اور ہیڈ ٹیچر کو بتائیں",
      },
      {
        id: "mr-n-3",
        barrierCategory: "memorization_reliance",
        priority: 3,
        title: "Check again in one week",
        description:
          "Re-run the check sooner to track whether the practice is making a difference.",
        when: "In one week",
        titleUrdu: "ایک ہفتے بعد دوبارہ دیکھیں",
      },
    ],
  },

  needs_general_practice: {
    full: [
      {
        id: "gp-f-1",
        barrierCategory: "needs_general_practice",
        priority: 1,
        title: "Ten minutes of guided reading daily",
        description:
          "The errors were spread across different letter types rather than concentrated in one pattern. General reading practice with a teacher or peer nearby will help more than targeting any single skill.",
        when: "This week",
        titleUrdu: "روزانہ دس منٹ پڑھائی",
      },
      {
        id: "gp-f-2",
        barrierCategory: "needs_general_practice",
        priority: 2,
        title: "Check again in three weeks",
        description:
          "If the pattern improves with practice, carry on. If specific patterns emerge next time, we can target them.",
        when: "In three weeks",
        titleUrdu: "تین ہفتے بعد دوبارہ دیکھیں",
      },
    ],
    partial: [
      {
        id: "gp-p-1",
        barrierCategory: "needs_general_practice",
        priority: 1,
        title: "Ten minutes of guided reading daily",
        description:
          "The errors were spread. General reading practice with support will help.",
        when: "This week",
        titleUrdu: "روزانہ دس منٹ پڑھائی",
      },
      {
        id: "gp-p-2",
        barrierCategory: "needs_general_practice",
        priority: 2,
        title: "Tell the parents and check again in two weeks",
        description:
          "Share what you are doing so practice can happen at home too.",
        when: "In two weeks",
        titleUrdu: "دو ہفتے بعد دوبارہ دیکھیں",
      },
    ],
    none: [
      {
        id: "gp-n-1",
        barrierCategory: "needs_general_practice",
        priority: 1,
        title: "Intensive guided reading, daily, with support",
        description:
          "The errors are spread and the teaching moment did not transfer. This child needs more sustained support — sit with them daily for reading.",
        when: "Start tomorrow",
        titleUrdu: "روزانہ ساتھ بیٹھ کر پڑھیں",
      },
      {
        id: "gp-n-2",
        barrierCategory: "needs_general_practice",
        priority: 2,
        title: "Discuss with head teacher and parents",
        description:
          "Bring in additional support. This pattern may need more than classroom practice.",
        when: "This week",
        titleUrdu: "ہیڈ ٹیچر اور والدین سے بات کریں",
      },
      {
        id: "gp-n-3",
        barrierCategory: "needs_general_practice",
        priority: 3,
        title: "Check again in one week",
        description:
          "Re-run sooner to see if the intensive practice is making a difference.",
        when: "In one week",
        titleUrdu: "ایک ہفتے بعد دوبارہ دیکھیں",
      },
    ],
  },

  no_concerns: {
    full: [
      {
        id: "nc-1",
        barrierCategory: "no_concerns",
        priority: 1,
        title: "Carry on as normal",
        description:
          "No barrier patterns were flagged today. Keep doing what you are doing — the child is reading within expected range for their age and exposure.",
        when: "Ongoing",
        titleUrdu: "جاری رکھیں",
      },
      {
        id: "nc-2",
        barrierCategory: "no_concerns",
        priority: 2,
        title: "Re-check in a term",
        description:
          "A routine check next term is enough. No need for anything extra right now.",
        when: "Next term",
        titleUrdu: "اگلی سہ ماہی میں دوبارہ دیکھیں",
      },
    ],
    partial: [
      {
        id: "nc-1",
        barrierCategory: "no_concerns",
        priority: 1,
        title: "Carry on as normal",
        description:
          "No significant barrier patterns were flagged today.",
        when: "Ongoing",
        titleUrdu: "جاری رکھیں",
      },
      {
        id: "nc-2",
        barrierCategory: "no_concerns",
        priority: 2,
        title: "Re-check in a term",
        description:
          "A routine check next term is enough.",
        when: "Next term",
        titleUrdu: "اگلی سہ ماہی میں دوبارہ دیکھیں",
      },
    ],
    none: [
      {
        id: "nc-1",
        barrierCategory: "no_concerns",
        priority: 1,
        title: "Carry on as normal",
        description:
          "No significant barrier patterns were flagged today.",
        when: "Ongoing",
        titleUrdu: "جاری رکھیں",
      },
      {
        id: "nc-2",
        barrierCategory: "no_concerns",
        priority: 2,
        title: "Re-check in a term",
        description:
          "A routine check next term is enough.",
        when: "Next term",
        titleUrdu: "اگلی سہ ماہی میں دوبارہ دیکھیں",
      },
    ],
  },
};

// Look up actions for a barrier category and teach-response variant
export function getActions(
  barrierCategory: string,
  teachVariant: TeachVariant
): ActionEntry[] {
  const category = ACTIONS[barrierCategory] || ACTIONS.no_concerns;
  const actions = category[teachVariant] || category.full;
  return actions.map((action) => ({
    ...action,
    descriptionUrdu:
      action.descriptionUrdu || `${action.titleUrdu}۔ اس ہدایت کو باقاعدگی سے جاری رکھیں۔`,
    whenUrdu: action.whenUrdu || toUrduTiming(action.when),
  }));
}

function toUrduTiming(when: string): string {
  const timings: Record<string, string> = {
    Tomorrow: "کل سے",
    "Start tomorrow": "کل سے شروع کریں",
    "This week": "اس ہفتے",
    Ongoing: "مسلسل",
    "In one week": "ایک ہفتے بعد",
    "In two weeks": "دو ہفتے بعد",
    "In three weeks": "تین ہفتے بعد",
    "In four weeks": "چار ہفتے بعد",
    "Next term": "اگلی سہ ماہی میں",
  };
  return timings[when] || when;
}

// Human-readable labels for barrier categories (used in class view)
export const BARRIER_LABELS: Record<string, string> = {
  no_concerns: "No concerns today",
  vision_hearing_referral: "Vision or hearing check needed",
  language_mismatch: "Home language different from Urdu",
  dot_identity_pattern: "Dot-letter mix-ups",
  letter_position_pattern: "Similar-looking letter mix-ups",
  diacritic_pattern: "Short-vowel mark mix-ups",
  memorization_reliance: "Naming speed concern",
  needs_general_practice: "Needs general reading practice",
};

export const BARRIER_HINTS: Record<string, string> = {
  no_concerns: "Keep doing what you are doing.",
  vision_hearing_referral:
    "Physical barriers first — get them checked before anything else.",
  language_mismatch:
    "Give extra time with new Urdu words. It is not a disability, it is exposure.",
  dot_identity_pattern:
    "Same 5-minute dot-counting drill works for all of them. Sit them together.",
  letter_position_pattern:
    "Show confusing pairs inside real words, not in isolation.",
  diacritic_pattern:
    "Teach zabar, zer, pesh as a group activity — it helps everyone.",
  memorization_reliance:
    "Mix unfamiliar words into their daily reading. They are memorising, not decoding.",
  needs_general_practice:
    "Ten minutes of guided reading daily with someone sitting beside them.",
};

export const BARRIER_TONES: Record<string, "note" | "note2" | "good"> = {
  no_concerns: "good",
  vision_hearing_referral: "note",
  language_mismatch: "note2",
  dot_identity_pattern: "note",
  letter_position_pattern: "note",
  diacritic_pattern: "note2",
  memorization_reliance: "note2",
  needs_general_practice: "note",
};
