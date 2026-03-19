"use client";

import type { SupportedLanguage } from "@/types/chat";
import { cn } from "@/lib/utils";

type LanguageSwitcherProps = {
  value: SupportedLanguage;
  onChange: (language: SupportedLanguage) => void;
};

const LANGUAGES: Array<{ id: SupportedLanguage; label: string }> = [
  { id: "english", label: "EN" },
  { id: "arabic", label: "AR" },
  { id: "hebrew", label: "HE" },
];

export function LanguageSwitcher({ value, onChange }: LanguageSwitcherProps) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-lg border border-[var(--border)] bg-[var(--bg-hover)] p-0.5">
      {LANGUAGES.map((language) => (
        <button
          key={language.id}
          type="button"
          onClick={() => onChange(language.id)}
          className={cn(
            "rounded-md px-2.5 py-1 text-xs font-medium transition",
            value === language.id
              ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-[var(--shadow-sm)]"
              : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]",
          )}
        >
          {language.label}
        </button>
      ))}
    </div>
  );
}
