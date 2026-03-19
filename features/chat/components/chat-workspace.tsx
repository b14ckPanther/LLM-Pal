"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PanelLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ChatThread } from "@/components/chat/chat-thread";
import { ChatComposer } from "@/components/chat/chat-composer";
import { LanguageSwitcher } from "@/components/chat/language-switcher";
import {
  getLanguageCode,
  getLanguageDirection,
  useLanguagePreference,
} from "@/hooks/use-language-preference";
import { useChatStore } from "@/features/chat/store/chat-store";
import { useTranslations } from "@/hooks/use-translations";

export function ChatWorkspace() {
  const supabase = useMemo(() => createClient(), []);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(true);
  const { language, setLanguage, fontClassName } = useLanguagePreference();
  const t = useTranslations();

  const isGuestMode = useChatStore((state) => state.isGuestMode);
  const activeChatId = useChatStore((state) => state.activeChatId);
  const messagesByChat = useChatStore((state) => state.messagesByChat);
  const loadingMessages = useChatStore((state) => state.loadingMessages);
  const error = useChatStore((state) => state.error);
  const clearError = useChatStore((state) => state.clearError);
  const loadChats = useChatStore((state) => state.loadChats);
  const createChat = useChatStore((state) => state.createChat);
  const loadMessages = useChatStore((state) => state.loadMessages);
  const initializeGuestMode = useChatStore((state) => state.initializeGuestMode);

  const bootstrapUser = useCallback(
    async (uid: string, email?: string | null) => {
      setUserId(uid);
      setUserEmail(email ?? undefined);
      await loadChats(supabase, uid);
      const currentChats = useChatStore.getState().chats;
      if (currentChats.length === 0) {
        await createChat(supabase, uid);
      }
      const active = useChatStore.getState().activeChatId;
      if (active) await loadMessages(supabase, active);
    },
    [createChat, loadChats, loadMessages, supabase],
  );

  useEffect(() => {
    let mounted = true;

    const { data: authSubscription } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!session?.user) {
          initializeGuestMode();
          setUserId(null);
          setUserEmail(undefined);
          if (mounted) setBootstrapping(false);
        } else {
          await bootstrapUser(session.user.id, session.user.email);
          if (mounted) setBootstrapping(false);
        }
      },
    );

    const init = async () => {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData.user;
      if (!user) {
        initializeGuestMode();
        if (mounted) setBootstrapping(false);
        return;
      }
      await bootstrapUser(user.id, user.email);
      if (mounted) setBootstrapping(false);
    };

    void init();
    return () => {
      mounted = false;
      authSubscription.subscription.unsubscribe();
    };
  }, [bootstrapUser, initializeGuestMode, supabase]);

  useEffect(() => {
    if (!activeChatId || !userId || isGuestMode) return;
    if (messagesByChat[activeChatId]) return;
    void loadMessages(supabase, activeChatId);
  }, [activeChatId, isGuestMode, loadMessages, messagesByChat, supabase, userId]);

  const handleSignIn = useCallback(
    async (uid: string) => {
      const { data } = await supabase.auth.getUser();
      await bootstrapUser(uid, data.user?.email);
    },
    [bootstrapUser, supabase],
  );

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    initializeGuestMode();
    setUserId(null);
    setUserEmail(undefined);
  }, [initializeGuestMode, supabase]);

  const activeMessages = activeChatId ? messagesByChat[activeChatId] ?? [] : [];
  const direction = getLanguageDirection(language);
  const languageCode = getLanguageCode(language);

  if (bootstrapping) {
    return (
      <main className="flex h-screen items-center justify-center bg-[var(--bg-base)]">
        <div className="flex items-center gap-2 text-sm text-[var(--text-tertiary)]">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--border-strong)] border-t-[var(--accent)]" />
          {t.loading}
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-screen overflow-hidden bg-[var(--bg-base)]">
      <ChatSidebar
        supabase={supabase ?? undefined}
        userId={userId ?? undefined}
        userEmail={userEmail}
        isGuestMode={isGuestMode}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
      />

      {/* Mobile sidebar backdrop */}
      {mobileSidebarOpen ? (
        <div
          className="fixed inset-0 z-30 bg-black/20 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
          role="presentation"
        />
      ) : null}

      <section
        className={`flex min-w-0 flex-1 flex-col overflow-hidden bg-[var(--bg-surface)] ${fontClassName}`}
        dir={direction}
        lang={languageCode}
      >
        {/* Topbar */}
        <header className="flex h-12 shrink-0 items-center justify-between border-b border-[var(--border)] px-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen((prev) => !prev)}
              className="rounded-md p-1.5 text-[var(--text-tertiary)] transition hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] lg:hidden"
            >
              <PanelLeft className="h-4 w-4" />
            </button>
            {isGuestMode ? (
              <span className="rounded-full border border-[var(--border)] bg-[var(--bg-hover)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-tertiary)]">
                {t.guestBadge}
              </span>
            ) : null}
          </div>
          <LanguageSwitcher value={language} onChange={setLanguage} />
        </header>

        {/* Error banner */}
        {error ? (
          <div className="mx-4 mt-3 flex items-center justify-between rounded-lg border border-[rgba(217,48,37,0.25)] bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
            <span>{error}</span>
            <button
              type="button"
              onClick={clearError}
              className="ml-4 text-xs underline-offset-2 hover:underline"
            >
              {t.dismiss}
            </button>
          </div>
        ) : null}

        <ChatThread messages={activeMessages} loading={loadingMessages} />

        {activeChatId ? (
          <ChatComposer
            supabase={supabase ?? undefined}
            chatId={activeChatId}
            userId={userId ?? undefined}
            selectedLanguage={language}
            isGuestMode={isGuestMode}
          />
        ) : null}
      </section>
    </main>
  );
}
