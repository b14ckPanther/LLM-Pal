"use client";

import { FormEvent, useMemo, useState } from "react";
import { MessageSquarePlus, Pencil, Trash2, LogOut, User } from "lucide-react";
import Image from "next/image";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/features/chat/store/chat-store";
import { SignInPanel } from "@/components/auth/sign-in-panel";
import { useTranslations } from "@/hooks/use-translations";

type ChatSidebarProps = {
  supabase?: SupabaseClient;
  userId?: string;
  userEmail?: string;
  isGuestMode: boolean;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  onSignIn: (userId: string) => void;
  onSignOut: () => void;
};

export function ChatSidebar({
  supabase,
  userId,
  userEmail,
  isGuestMode,
  mobileOpen = true,
  onCloseMobile,
  onSignIn,
  onSignOut,
}: ChatSidebarProps) {
  const t = useTranslations();
  const chats = useChatStore((state) => state.chats);
  const activeChatId = useChatStore((state) => state.activeChatId);
  const setActiveChat = useChatStore((state) => state.setActiveChat);
  const createChat = useChatStore((state) => state.createChat);
  const renameChat = useChatStore((state) => state.renameChat);
  const deleteChat = useChatStore((state) => state.deleteChat);
  const loadingChats = useChatStore((state) => state.loadingChats);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [titleDraft, setTitleDraft] = useState("");
  const [signInOpen, setSignInOpen] = useState(false);

  const panelClasses = useMemo(
    () =>
      cn(
        "app-scrollbar flex h-full flex-col overflow-auto transition-transform duration-300",
        "fixed inset-y-0 left-0 z-40 w-64 lg:static lg:inset-auto lg:translate-x-0",
        "bg-[var(--bg-sidebar)] border-r border-[var(--border)]",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      ),
    [mobileOpen],
  );

  const onRename = async (event: FormEvent) => {
    event.preventDefault();
    if (!editingChatId || !titleDraft.trim() || !supabase || !userId) return;
    await renameChat(supabase, editingChatId, titleDraft.trim());
    setEditingChatId(null);
    setTitleDraft("");
  };

  const handleNewChat = () => {
    if (!isGuestMode && supabase && userId) {
      void createChat(supabase, userId);
    }
  };

  return (
    <>
      <aside className={panelClasses}>
        <div className="flex min-h-0 flex-1 flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3">
            <Image
              src="/logo.png"
              alt={t.appName}
              width={100}
              height={28}
              className="h-7 w-auto"
              priority
            />
            {onCloseMobile ? (
              <button
                type="button"
                onClick={onCloseMobile}
                className="rounded-md p-1 text-[var(--text-tertiary)] transition hover:bg-[var(--bg-active)] hover:text-[var(--text-primary)] lg:hidden"
              >
                <MessageSquarePlus className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          {/* New chat */}
          {!isGuestMode ? (
            <div className="px-3 pb-2">
              <button
                type="button"
                onClick={handleNewChat}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--text-secondary)] transition hover:bg-[var(--bg-active)] hover:text-[var(--text-primary)]"
              >
                <MessageSquarePlus className="h-4 w-4 shrink-0" />
                {t.newChat}
              </button>
            </div>
          ) : null}

          {/* Chat list */}
          <div className="flex-1 overflow-auto px-3 py-1 app-scrollbar">
            {loadingChats ? (
              <div className="space-y-1">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <div key={idx} className="h-8 rounded-lg bg-[var(--bg-active)] animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-0.5">
                {chats.map((chat) => {
                  const active = chat.id === activeChatId;
                  const isEditing = editingChatId === chat.id;
                  return (
                    <div key={chat.id} className="group relative">
                      {isEditing ? (
                        <form onSubmit={onRename} className="px-1 py-1 space-y-1.5">
                          <Input
                            value={titleDraft}
                            onChange={(e) => setTitleDraft(e.target.value)}
                            className="h-7 text-xs"
                            autoFocus
                          />
                          <div className="flex gap-1.5">
                            <button
                              type="submit"
                              className="text-xs font-medium text-[var(--accent-text)] hover:underline"
                            >
                              {t.save}
                            </button>
                            <button
                              type="button"
                              className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                              onClick={() => setEditingChatId(null)}
                            >
                              {t.cancel}
                            </button>
                          </div>
                        </form>
                      ) : (
                        <button
                          type="button"
                          className={cn(
                            "flex w-full items-center rounded-lg px-3 py-1.5 text-left text-sm transition",
                            active
                              ? "bg-[var(--bg-active)] text-[var(--text-primary)] font-medium"
                              : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]",
                          )}
                          onClick={() => {
                            setActiveChat(chat.id);
                            if (onCloseMobile) onCloseMobile();
                          }}
                        >
                          <span className="flex-1 truncate">{chat.title}</span>
                        </button>
                      )}
                      {!isEditing ? (
                        <div className="absolute right-1.5 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 group-hover:flex">
                          <button
                            type="button"
                            className="rounded p-1 text-[var(--text-tertiary)] transition hover:bg-[var(--bg-active)] hover:text-[var(--text-primary)]"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingChatId(chat.id);
                              setTitleDraft(chat.title);
                            }}
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            className="rounded p-1 text-[var(--text-tertiary)] transition hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]"
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (supabase) await deleteChat(supabase, chat.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer — user / sign-in */}
        <div className="border-t border-[var(--border)] p-3">
          {isGuestMode ? (
            <button
              type="button"
              onClick={() => setSignInOpen(true)}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition hover:bg-[var(--bg-hover)]"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--bg-active)]">
                <User className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
              </span>
              <div className="text-left">
                <p className="text-xs font-medium text-[var(--text-primary)]">{t.signIn}</p>
                <p className="text-[11px] text-[var(--text-tertiary)]">{t.signInSubtitle}</p>
              </div>
            </button>
          ) : (
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)]">
                <User className="h-3.5 w-3.5 text-[var(--accent-text)]" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-[var(--text-primary)]">
                  {userEmail ?? t.signedIn}
                </p>
              </div>
              <button
                type="button"
                onClick={onSignOut}
                className="rounded-md p-1.5 text-[var(--text-tertiary)] transition hover:bg-[var(--bg-hover)] hover:text-[var(--danger)]"
                title={t.signOut}
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          <p className="mt-3 text-[10px] text-[var(--text-tertiary)]">{t.footer}</p>
        </div>
      </aside>

      <SignInPanel
        open={signInOpen}
        onClose={() => setSignInOpen(false)}
        onSuccess={(uid) => {
          setSignInOpen(false);
          onSignIn(uid);
        }}
      />
    </>
  );
}
