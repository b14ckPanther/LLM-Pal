"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import Image from "next/image";
import { useAutoScroll } from "@/hooks/use-auto-scroll";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "@/hooks/use-translations";
import type { MessageWithAttachments } from "@/types/chat";
import { cn } from "@/lib/utils";

type ChatThreadProps = {
  messages: MessageWithAttachments[];
  loading: boolean;
};

function CopyButton({ text }: { text: string }) {
  const t = useTranslations();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded-md p-1.5 text-[var(--text-tertiary)] transition hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)]"
      title={t.copyMessage}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-[var(--accent-text)]" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

function StreamingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--text-tertiary)]"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </span>
  );
}

export function ChatThread({ messages, loading }: ChatThreadProps) {
  const t = useTranslations();
  const ref = useRef<HTMLDivElement>(null);
  const deps = useMemo(() => [messages.length, messages.at(-1)?.content], [messages]);
  useAutoScroll(ref, deps);

  if (loading) {
    return (
      <section className="app-scrollbar flex-1 overflow-auto px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-2xl space-y-6">
          <Skeleton className="h-12 w-2/3" />
          <div className="flex justify-end">
            <Skeleton className="h-10 w-1/2" />
          </div>
          <Skeleton className="h-16 w-4/5" />
        </div>
      </section>
    );
  }

  if (messages.length === 0) {
    return (
      <section className="flex flex-1 items-center justify-center px-4">
        <div className="text-center">
          <p className="text-2xl font-semibold text-[var(--text-primary)]">{t.howCanIHelp}</p>
          <p className="mt-1.5 text-sm text-[var(--text-tertiary)]">{t.startConversation}</p>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={ref}
      className="app-scrollbar flex-1 overflow-auto px-4 py-6 sm:px-6"
    >
      <div className="mx-auto max-w-2xl space-y-6">
        <AnimatePresence initial={false}>
          {messages.map((message) => {
            const isUser = message.role === "user";
            const isStreaming = message.status === "streaming";

            return (
              <motion.article
                key={message.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className={cn("group flex gap-3", isUser ? "justify-end" : "justify-start")}
              >
                {!isUser ? (
                  <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-surface)] text-[10px] font-semibold text-[var(--text-secondary)] shadow-[var(--shadow-sm)]">
                    {t.aiLabel}
                  </div>
                ) : null}

                <div className={cn("min-w-0 max-w-[80%]", isUser ? "items-end" : "items-start")}>
                  {message.attachments.length > 0 ? (
                    <div className="mb-2 space-y-1.5">
                      {message.attachments.map((attachment) =>
                        attachment.public_url ? (
                          <div
                            key={attachment.id}
                            className="overflow-hidden rounded-xl border border-[var(--border)] shadow-[var(--shadow-sm)]"
                          >
                            <Image
                              src={attachment.public_url}
                              alt="Attachment"
                              width={480}
                              height={320}
                              className="h-auto max-h-64 w-full object-cover"
                            />
                          </div>
                        ) : null,
                      )}
                    </div>
                  ) : null}

                  {message.content || isStreaming ? (
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                        isUser
                          ? "rounded-tr-sm bg-[var(--user-bubble)] text-white"
                          : "rounded-tl-sm border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-[var(--shadow-sm)]",
                      )}
                    >
                      {isStreaming && !message.content ? (
                        <StreamingDots />
                      ) : (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div>
                  ) : null}

                  {!isUser && message.content ? (
                    <div className="mt-1 flex opacity-0 transition-opacity group-hover:opacity-100">
                      <CopyButton text={message.content} />
                    </div>
                  ) : null}
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </div>
    </section>
  );
}
