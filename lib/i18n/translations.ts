import type { SupportedLanguage } from "@/types/chat";
import en from "./en.json";
import ar from "./ar.json";
import he from "./he.json";

export type TranslationKeys = typeof en;

export const translations: Record<SupportedLanguage, TranslationKeys> = {
  english: en,
  arabic: ar,
  hebrew: he,
};
