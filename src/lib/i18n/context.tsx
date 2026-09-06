"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Language, LocalizedText } from "../../types";
import { STRINGS, translate } from "./strings";

const ONBOARDED_KEY = "pehchaan_onboarded";

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, variables?: Record<string, string | number>) => string;
  text: (value: LocalizedText) => string;
  firstLaunch: boolean;
  /** true once localStorage has been checked on the client */
  initialized: boolean;
  completeFirstLaunch: () => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("ur");
  const [firstLaunch, setFirstLaunch] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Read persisted onboarding state after hydration to avoid SSR mismatch
  useEffect(() => {
    if (localStorage.getItem(ONBOARDED_KEY)) setFirstLaunch(false);
    setInitialized(true);
  }, []);

  const t = useCallback(
    (key: string, variables?: Record<string, string | number>) =>
      translate(key, language, variables),
    [language]
  );
  const text = useCallback((value: LocalizedText) => value[language] || value.en, [language]);
  const completeFirstLaunch = useCallback(() => {
    localStorage.setItem(ONBOARDED_KEY, "1");
    setFirstLaunch(false);
  }, []);

  const value = useMemo(
    () => ({ language, setLanguage, t, text, firstLaunch, initialized, completeFirstLaunch }),
    [language, t, text, firstLaunch, initialized, completeFirstLaunch]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}

export function getLocalizedText(value: LocalizedText, language: Language) {
  return value[language] || value.en;
}

export function hasTranslation(key: string) {
  return Boolean(STRINGS[key]);
}
