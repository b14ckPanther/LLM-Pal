"use client";

import { translations } from "@/lib/i18n/translations";
import { useLanguagePreference } from "@/hooks/use-language-preference";

export function useTranslations() {
  const { language } = useLanguagePreference();
  return translations[language];
}
