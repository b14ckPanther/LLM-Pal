"use client";

import { create } from "zustand";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AttachmentRecord,
  ChatRecord,
  ModelPreference,
  MessageRecord,
  MessageWithAttachments,
  SupportedLanguage,
} from "@/types/chat";

type ChatStore = {
  chats: ChatRecord[];
  activeChatId: string | null;
  messagesByChat: Record<string, MessageWithAttachments[]>;
  isGuestMode: boolean;
  loadingChats: boolean;
  loadingMessages: boolean;
  sending: boolean;
  error: string | null;
  setActiveChat: (chatId: string) => void;
  initializeGuestMode: () => void;
  clearError: () => void;
  loadChats: (supabase: SupabaseClient, userId: string) => Promise<void>;
  createChat: (supabase: SupabaseClient, userId: string) => Promise<ChatRecord | null>;
  renameChat: (
    supabase: SupabaseClient,
    chatId: string,
    title: string,
  ) => Promise<void>;
  deleteChat: (supabase: SupabaseClient, chatId: string) => Promise<void>;
  loadMessages: (supabase: SupabaseClient, chatId: string) => Promise<void>;
  sendMessage: (params: {
    supabase?: SupabaseClient;
    chatId: string;
    userId?: string;
    content: string;
    files: File[];
    modelPreference: ModelPreference;
    selectedLanguage: SupportedLanguage;
    isGuestMode: boolean;
  }) => Promise<void>;
};

function toMessageMap(
  messageRows: MessageRecord[],
  attachmentRows: AttachmentRecord[],
) {
  const attachmentsByMessage = new Map<string, AttachmentRecord[]>();
  for (const attachment of attachmentRows) {
    const existing = attachmentsByMessage.get(attachment.message_id) ?? [];
    existing.push(attachment);
    attachmentsByMessage.set(attachment.message_id, existing);
  }

  return messageRows.map((message) => ({
    ...message,
    attachments: attachmentsByMessage.get(message.id) ?? [],
  }));
}

export const useChatStore = create<ChatStore>((set) => ({
  chats: [],
  activeChatId: null,
  messagesByChat: {},
  isGuestMode: false,
  loadingChats: false,
  loadingMessages: false,
  sending: false,
  error: null,

  setActiveChat: (chatId) => set({ activeChatId: chatId }),
  initializeGuestMode: () =>
    set({
      isGuestMode: true,
      chats: [
        {
          id: "guest-chat",
          user_id: "guest",
          title: "Guest Chat",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_message_at: null,
        },
      ],
      activeChatId: "guest-chat",
      loadingChats: false,
      loadingMessages: false,
      error: null,
    }),
  clearError: () => set({ error: null }),

  async loadChats(supabase, userId) {
    set({ loadingChats: true, error: null });
    const { data, error } = await supabase
      .from("chats")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) {
      set({ loadingChats: false, error: error.message });
      return;
    }

    const chats = (data ?? []) as ChatRecord[];
    set((state) => ({
      isGuestMode: false,
      chats,
      loadingChats: false,
      activeChatId: state.activeChatId ?? chats[0]?.id ?? null,
    }));
  },

  async createChat(supabase, userId) {
    const { data, error } = await supabase
      .from("chats")
      .insert({ user_id: userId, title: "New Chat" })
      .select("*")
      .single();

    if (error || !data) {
      set({ error: error?.message ?? "Failed to create chat." });
      return null;
    }

    const chat = data as ChatRecord;
    set((state) => ({ chats: [chat, ...state.chats], activeChatId: chat.id }));
    return chat;
  },

  async renameChat(supabase, chatId, title) {
    const { error } = await supabase
      .from("chats")
      .update({ title, updated_at: new Date().toISOString() })
      .eq("id", chatId);

    if (error) {
      set({ error: error.message });
      return;
    }

    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.id === chatId ? { ...chat, title, updated_at: new Date().toISOString() } : chat,
      ),
    }));
  },

  async deleteChat(supabase, chatId) {
    const { error } = await supabase.from("chats").delete().eq("id", chatId);
    if (error) {
      set({ error: error.message });
      return;
    }

    set((state) => {
      const chats = state.chats.filter((chat) => chat.id !== chatId);
      const nextActive =
        state.activeChatId === chatId ? (chats.length ? chats[0].id : null) : state.activeChatId;
      const nextMessagesByChat = { ...state.messagesByChat };
      delete nextMessagesByChat[chatId];
      return {
        chats,
        activeChatId: nextActive,
        messagesByChat: nextMessagesByChat,
      };
    });
  },

  async loadMessages(supabase, chatId) {
    set({ loadingMessages: true, error: null });
    const [{ data: messageData, error: messageError }, { data: attachmentData, error: attachErr }] =
      await Promise.all([
        supabase.from("messages").select("*").eq("chat_id", chatId).order("created_at"),
        supabase.from("attachments").select("*").eq("chat_id", chatId).order("created_at"),
      ]);

    if (messageError || attachErr) {
      set({
        loadingMessages: false,
        error: messageError?.message ?? attachErr?.message ?? "Failed to load messages.",
      });
      return;
    }

    const messages = toMessageMap(
      (messageData ?? []) as MessageRecord[],
      (attachmentData ?? []) as AttachmentRecord[],
    );

    set((state) => ({
      loadingMessages: false,
      messagesByChat: {
        ...state.messagesByChat,
        [chatId]: messages,
      },
    }));
  },

  async sendMessage({
    supabase,
    chatId,
    userId,
    content,
    files,
    modelPreference,
    selectedLanguage,
    isGuestMode,
  }) {
    const trimmed = content.trim();
    if (!trimmed && files.length === 0) return;

    if (!isGuestMode && (!supabase || !userId)) {
      set({ sending: false, error: "Missing authenticated session." });
      return;
    }

    set({ sending: true, error: null });

    const uploadedAttachments: AttachmentRecord[] = [];
    const localUserMessageId = `local-user-${crypto.randomUUID()}`;

    let userMessage: MessageRecord;
    if (isGuestMode) {
      userMessage = {
        id: localUserMessageId,
        chat_id: chatId,
        user_id: null,
        role: "user",
        content: trimmed || null,
        status: "complete",
        created_at: new Date().toISOString(),
      };
    } else {
      const { data: insertedUserMessage, error: userMessageError } = await supabase!
        .from("messages")
        .insert({
          chat_id: chatId,
          user_id: userId!,
          role: "user",
          content: trimmed || null,
          status: "complete",
        })
        .select("*")
        .single();

      if (userMessageError || !insertedUserMessage) {
        set({ sending: false, error: userMessageError?.message ?? "Failed to send." });
        return;
      }

      userMessage = insertedUserMessage as MessageRecord;
    }

    if (isGuestMode && files.length > 0) {
      set({
        sending: false,
        error: "Image uploads require an account. Sign up for full multimodal access.",
      });
      return;
    }

    for (const file of files) {
      const ext = file.name.includes(".") ? file.name.split(".").pop() : "png";
      const path = `${userId!}/${chatId}/${userMessage.id}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase!
        .storage
        .from("chat-media")
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (uploadError) {
        set({ sending: false, error: uploadError.message });
        return;
      }

      const { data: urlData } = supabase!.storage.from("chat-media").getPublicUrl(path);

      const { data: insertedAttachment, error: attachInsertError } = await supabase!
        .from("attachments")
        .insert({
          message_id: userMessage.id,
          chat_id: chatId,
          user_id: userId!,
          kind: "image",
          storage_bucket: "chat-media",
          storage_path: path,
          public_url: urlData.publicUrl ?? null,
          mime_type: file.type || null,
        })
        .select("*")
        .single();

      if (attachInsertError || !insertedAttachment) {
        set({
          sending: false,
          error: attachInsertError?.message ?? "Failed to save attachment.",
        });
        return;
      }
      uploadedAttachments.push(insertedAttachment as AttachmentRecord);
    }

    const userMessageWithAttachments: MessageWithAttachments = {
      ...userMessage,
      attachments: uploadedAttachments,
    };

    const streamingAssistantId = `stream-${crypto.randomUUID()}`;
    const streamingMessage: MessageWithAttachments = {
      id: streamingAssistantId,
      chat_id: chatId,
      user_id: null,
      role: "assistant",
      content: "",
      status: "streaming",
      created_at: new Date().toISOString(),
      attachments: [],
    };

    set((state) => ({
      messagesByChat: {
        ...state.messagesByChat,
        [chatId]: [...(state.messagesByChat[chatId] ?? []), userMessageWithAttachments, streamingMessage],
      },
    }));

    const attachmentUrls = uploadedAttachments
      .map((item) => item.public_url)
      .filter((url): url is string => Boolean(url));

    try {
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: trimmed,
          chatId,
          attachmentUrls,
          modelPreference,
          selectedLanguage,
          guestMode: isGuestMode,
        }),
      });

      if (!response.body || !response.ok) {
        throw new Error("Streaming failed.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let streamedContent = "";

      while (!done) {
        const read = await reader.read();
        done = read.done;
        if (read.value) {
          streamedContent += decoder.decode(read.value, { stream: true });
          set((state) => ({
            messagesByChat: {
              ...state.messagesByChat,
              [chatId]: (state.messagesByChat[chatId] ?? []).map((message) =>
                message.id === streamingAssistantId
                  ? { ...message, content: streamedContent, status: "streaming" }
                  : message,
              ),
            },
          }));
        }
      }

      if (isGuestMode) {
        set((state) => ({
          sending: false,
          messagesByChat: {
            ...state.messagesByChat,
            [chatId]: (state.messagesByChat[chatId] ?? []).map((message) =>
              message.id === streamingAssistantId
                ? {
                    ...message,
                    id: `local-assistant-${crypto.randomUUID()}`,
                    content: streamedContent.trim(),
                    status: "complete",
                  }
                : message,
            ),
          },
          chats: state.chats.map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  updated_at: new Date().toISOString(),
                  last_message_at: new Date().toISOString(),
                }
              : chat,
          ),
        }));
      } else {
        const { data: insertedAssistant, error: assistantError } = await supabase!
          .from("messages")
          .insert({
            chat_id: chatId,
            user_id: null,
            role: "assistant",
            content: streamedContent.trim(),
            status: "complete",
          })
          .select("*")
          .single();

        if (assistantError || !insertedAssistant) {
          throw new Error(assistantError?.message ?? "Failed to persist assistant response.");
        }

        set((state) => ({
          sending: false,
          messagesByChat: {
            ...state.messagesByChat,
            [chatId]: (state.messagesByChat[chatId] ?? []).map((message) =>
              message.id === streamingAssistantId
                ? { ...(insertedAssistant as MessageRecord), attachments: [] }
                : message,
            ),
          },
          chats: state.chats.map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  updated_at: new Date().toISOString(),
                  last_message_at: new Date().toISOString(),
                }
              : chat,
          ),
        }));
      }
    } catch (error) {
      set((state) => ({
        sending: false,
        error: error instanceof Error ? error.message : "Failed to stream response.",
        messagesByChat: {
          ...state.messagesByChat,
          [chatId]: (state.messagesByChat[chatId] ?? []).map((message) =>
            message.id === streamingAssistantId
              ? { ...message, status: "error", content: (message.content ?? "") + "\n[stream failed]" }
              : message,
          ),
        },
      }));
    }
  },
}));
