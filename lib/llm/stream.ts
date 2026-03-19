import type { SupportedLanguage } from "@/types/chat";

type StreamPayload = {
  prompt: string;
  chatId: string;
  attachmentUrls?: string[];
  selectedLanguage?: SupportedLanguage;
};

function getFallbackPrefix(language: SupportedLanguage | undefined) {
  if (language === "arabic") {
    return "استجابة تجريبية: يرجى إعداد مفتاح مزود النموذج لتفعيل الردود الحقيقية.";
  }
  if (language === "hebrew") {
    return "תגובה מדומה: יש להגדיר מפתח ספק מודל כדי להפעיל תגובות אמיתיות.";
  }
  return "Simulated response: configure an LLM provider key to enable real completions.";
}

export async function* createSimulatedStream(payload: StreamPayload) {
  const fallbackPrefix = getFallbackPrefix(payload.selectedLanguage);
  const attachmentNotice =
    payload.selectedLanguage === "arabic"
      ? ` استلمت أيضا ${payload.attachmentUrls?.length ?? 0} مرفق(ات) صورة.`
      : payload.selectedLanguage === "hebrew"
        ? ` קיבלתי גם ${payload.attachmentUrls?.length ?? 0} קבצי תמונה מצורפים.`
        : ` I also received ${payload.attachmentUrls?.length ?? 0} image attachment(s).`;
  const attachmentText =
    payload.attachmentUrls && payload.attachmentUrls.length > 0
      ? attachmentNotice
      : "";

  const finalText = `${fallbackPrefix} You said: "${payload.prompt}".${attachmentText}`;
  const chunks = finalText.split(" ");

  for (const word of chunks) {
    await new Promise((resolve) => setTimeout(resolve, 45));
    yield `${word} `;
  }
}

export async function* streamTextByWord(text: string) {
  const chunks = text.split(" ");
  for (const word of chunks) {
    // Tiny delay keeps perceived streaming behavior smooth.
    await new Promise((resolve) => setTimeout(resolve, 16));
    yield `${word} `;
  }
}
