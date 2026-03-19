"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import type { SupportedLanguage } from "@/types/chat";

const STORAGE_KEY = "llmpal-language-preference";
const LANGUAGE_EVENT = "llmpal-language-change";
const DEFAULT_LANGUAGE: SupportedLanguage = "english";

function normalizeLanguage(value: string | null): SupportedLanguage {
  if (value === "arabic" || value === "hebrew" || value === "english") {
    return value;
  }
  return DEFAULT_LANGUAGE;
}

export function getLanguageDirection(language: SupportedLanguage) {
  return language === "english" ? "ltr" : "rtl";
}

export function getLanguageCode(language: SupportedLanguage) {
  if (language === "arabic") return "ar";
  if (language === "hebrew") return "he";
  return "en";
}

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handler = () => onStoreChange();
  window.addEventListener("storage", handler);
  window.addEventListener(LANGUAGE_EVENT, handler);

  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(LANGUAGE_EVENT, handler);
  };
}

function getSnapshot(): SupportedLanguage {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;
  return normalizeLanguage(window.localStorage.getItem(STORAGE_KEY));
}

function getServerSnapshot(): SupportedLanguage {
  return DEFAULT_LANGUAGE;
}

export function useLanguagePreference() {
  const language = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setLanguage = useCallback((nextLanguage: SupportedLanguage) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, nextLanguage);
    window.dispatchEvent(new Event(LANGUAGE_EVENT));
  }, []);

  const fontClassName = useMemo(() => {
    if (language === "arabic") return "lang-arabic";
    if (language === "hebrew") return "lang-hebrew";
    return "lang-english";
  }, [language]);

  return { language, setLanguage, fontClassName };
}
