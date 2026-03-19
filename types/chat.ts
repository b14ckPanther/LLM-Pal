export type MessageRole = "user" | "assistant" | "media";
export type MessageStatus = "streaming" | "complete" | "error";
export type ModelPreference = "affordable" | "premium";
export type SupportedLanguage = "english" | "arabic" | "hebrew";

export type ChatRecord = {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  last_message_at: string | null;
};

export type MessageRecord = {
  id: string;
  chat_id: string;
  user_id: string | null;
  role: MessageRole;
  content: string | null;
  status: MessageStatus;
  created_at: string;
};

export type AttachmentRecord = {
  id: string;
  message_id: string;
  chat_id: string;
  user_id: string;
  kind: "image";
  storage_bucket: string;
  storage_path: string;
  public_url: string | null;
  mime_type: string | null;
  width: number | null;
  height: number | null;
  created_at: string;
};

export type MessageWithAttachments = MessageRecord & {
  attachments: AttachmentRecord[];
};

export type VoiceInputState = {
  enabled: boolean;
  recording: boolean;
  durationMs: number;
};

export type AudioAttachment = {
  kind: "audio";
  url: string;
  mimeType: string;
  durationMs: number;
};
