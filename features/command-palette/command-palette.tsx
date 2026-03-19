"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { MessageSquarePlus, PanelLeft, Plus, Settings } from "lucide-react";
import { useCommandK } from "@/hooks/use-command-k";
import { useChatStore } from "@/features/chat/store/chat-store";

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const chats = useChatStore((state) => state.chats);
  const setActiveChat = useChatStore((state) => state.setActiveChat);

  useCommandK({ onTrigger: () => setOpen((prev) => !prev) });

  const quickActions = useMemo(
    () => [
      {
        id: "new-chat",
        label: "New chat",
        icon: Plus,
        action: () => router.push("/chat"),
      },
      {
        id: "go-chat",
        label: "Open chat workspace",
        icon: MessageSquarePlus,
        action: () => router.push("/chat"),
      },
      {
        id: "focus-sidebar",
        label: "Focus sidebar",
        icon: PanelLeft,
        action: () => router.push("/chat"),
      },
      {
        id: "settings",
        label: "Settings (coming soon)",
        icon: Settings,
        action: () => {},
      },
    ],
    [router],
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-[rgba(8,12,24,0.65)] p-4 pt-24"
      onClick={() => setOpen(false)}
      role="presentation"
    >
      <Command
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[rgba(12,18,36,0.95)] shadow-[0_24px_60px_rgba(0,0,0,0.45)]"
        onClick={(event) => event.stopPropagation()}
      >
        <Command.Input
          placeholder="Search chats or run action..."
          className="h-12 w-full border-b border-[var(--border-subtle)] bg-transparent px-4 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)]"
        />
        <Command.List className="max-h-80 overflow-auto p-2 premium-scrollbar">
          <Command.Empty className="p-3 text-sm text-[var(--text-secondary)]">
            No results found.
          </Command.Empty>
          <Command.Group heading="Actions" className="p-1 text-[var(--text-secondary)]">
            {quickActions.map((item) => (
              <Command.Item
                key={item.id}
                className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] data-[selected=true]:bg-white/10"
                onSelect={() => {
                  item.action();
                  setOpen(false);
                }}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Command.Item>
            ))}
          </Command.Group>
          <Command.Group heading="Chats" className="p-1 text-[var(--text-secondary)]">
            {chats.slice(0, 8).map((chat) => (
              <Command.Item
                key={chat.id}
                className="cursor-pointer rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] data-[selected=true]:bg-white/10"
                onSelect={() => {
                  setActiveChat(chat.id);
                  router.push("/chat");
                  setOpen(false);
                }}
              >
                {chat.title || "Untitled Chat"}
              </Command.Item>
            ))}
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}
