"use client";

import { FormEvent, useRef, useState } from "react";
import { ArrowUp, ImagePlus, Mic, X } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/features/chat/store/chat-store";
import { useVoicePlaceholder } from "@/hooks/use-voice-placeholder";
import { useTranslations } from "@/hooks/use-translations";
import type { ModelPreference, SupportedLanguage } from "@/types/chat";

type ChatComposerProps = {
  supabase?: SupabaseClient;
  chatId: string;
  userId?: string;
  selectedLanguage: SupportedLanguage;
  isGuestMode: boolean;
};

export function ChatComposer({
  supabase,
  chatId,
  userId,
  selectedLanguage,
  isGuestMode,
}: ChatComposerProps) {
  const t = useTranslations();
  const sendMessage = useChatStore((state) => state.sendMessage);
  const sending = useChatStore((state) => state.sending);
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [modelPreference, setModelPreference] = useState<ModelPreference>("affordable");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { state: voiceState, toggleEnabled } = useVoicePlaceholder();

  const canSend = (text.trim() || files.length > 0) && !sending;

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  };

  const submitMessage = async () => {
    if (!canSend) return;
    await sendMessage({
      supabase,
      chatId,
      userId,
      content: text,
      files,
      modelPreference,
      selectedLanguage,
      isGuestMode,
    });
    setText("");
    setFiles([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await submitMessage();
  };

  return (
    <div
      className="sticky bottom-0 z-20 border-t border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 sm:px-6"
      style={{
        paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 12px))",
        paddingLeft: "max(1rem, env(safe-area-inset-left, 0px))",
        paddingRight: "max(1rem, env(safe-area-inset-right, 0px))",
      }}
    >
      {/* File chips */}
      {files.length > 0 ? (
        <div className="mb-2 flex flex-wrap gap-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-hover)] px-2.5 py-1 text-xs text-[var(--text-secondary)]"
            >
              <span className="max-w-[120px] truncate">{file.name}</span>
              <button
                type="button"
                onClick={() => setFiles((prev) => prev.filter((_, i) => i !== index))}
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <form
        onSubmit={onSubmit}
        className="flex items-end gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 shadow-[var(--shadow-sm)] transition-[border-color] focus-within:border-[var(--border-strong)]"
      >
        {/* Model toggle */}
        <div className="mb-0.5 hidden shrink-0 items-center rounded-md border border-[var(--border)] bg-[var(--bg-hover)] p-0.5 sm:flex">
          {(["affordable", "premium"] as ModelPreference[]).map((pref) => (
            <button
              key={pref}
              type="button"
              onClick={() => setModelPreference(pref)}
              className={cn(
                "rounded px-2 py-0.5 text-[11px] font-medium transition",
                modelPreference === pref
                  ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-[var(--shadow-sm)]"
                  : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]",
              )}
            >
              {pref === "affordable" ? t.modelMini : t.modelPro}
            </button>
          ))}
        </div>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            autoResize();
          }}
          placeholder={t.messagePlaceholder}
          rows={1}
          className="flex-1 resize-none bg-transparent py-0.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void submitMessage();
            }
          }}
        />

        <div className="mb-0.5 flex shrink-0 items-center gap-1">
          {!isGuestMode ? (
            <label className="cursor-pointer rounded-md p-1.5 text-[var(--text-tertiary)] transition hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)]">
              <ImagePlus className="h-4 w-4" />
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
              />
            </label>
          ) : null}

          <button
            type="button"
            onClick={toggleEnabled}
            title={t.voiceTooltip}
            className={cn(
              "rounded-md p-1.5 transition",
              voiceState.enabled
                ? "bg-[var(--accent-soft)] text-[var(--accent-text)]"
                : "text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)]",
            )}
          >
            <Mic className="h-4 w-4" />
          </button>

          <button
            type="submit"
            disabled={!canSend}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-lg transition",
              canSend
                ? "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]"
                : "bg-[var(--bg-hover)] text-[var(--text-tertiary)]",
            )}
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </form>

      {isGuestMode ? (
        <p className="mt-2 text-center text-[11px] text-[var(--text-tertiary)]">
          {t.guestLimit}
        </p>
      ) : null}
    </div>
  );
}
