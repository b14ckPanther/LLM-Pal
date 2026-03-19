import { NextRequest } from "next/server";
import { hasOpenAIKey, streamOpenAIResponseText } from "@/lib/llm/openai";
import { createSimulatedStream, streamTextByWord } from "@/lib/llm/stream";
import type { ModelPreference, SupportedLanguage } from "@/types/chat";

export const runtime = "edge";
const GUEST_COOKIE = "llmpal_guest_tokens_used";
const DEFAULT_GUEST_TOKEN_LIMIT = 2500;
const DEFAULT_GUEST_REQUEST_CAP = 220;

export async function POST(request: NextRequest) {
  const {
    prompt,
    chatId,
    attachmentUrls,
    modelPreference,
    selectedLanguage,
    guestMode,
  } = await request.json();

  if (!prompt || !chatId) {
    return new Response("Missing prompt or chatId", { status: 400 });
  }

  const safePreference: ModelPreference =
    modelPreference === "premium" ? "premium" : "affordable";
  const safeLanguage: SupportedLanguage =
    selectedLanguage === "arabic" || selectedLanguage === "hebrew"
      ? selectedLanguage
      : "english";
  const safeAttachmentUrls = Array.isArray(attachmentUrls)
    ? attachmentUrls.filter((url): url is string => typeof url === "string").slice(0, 4)
    : [];
  const isGuestMode = Boolean(guestMode);
  const guestTokenLimit = Number(process.env.GUEST_TOKEN_LIMIT ?? DEFAULT_GUEST_TOKEN_LIMIT);
  const guestPerRequestCap = Number(
    process.env.GUEST_MAX_OUTPUT_TOKENS_PER_REQUEST ?? DEFAULT_GUEST_REQUEST_CAP,
  );
  const cookieUsed = Number(request.cookies.get(GUEST_COOKIE)?.value ?? "0");
  const usedTokens = Number.isFinite(cookieUsed) && cookieUsed > 0 ? cookieUsed : 0;
  const remainingGuestTokens = Math.max(0, guestTokenLimit - usedTokens);

  if (isGuestMode && remainingGuestTokens <= 0) {
    const message =
      safeLanguage === "arabic"
        ? "تم الوصول إلى حد الضيف. يرجى إنشاء حساب للمتابعة."
        : safeLanguage === "hebrew"
          ? "הגעת למגבלת האורח. יש להירשם כדי להמשיך."
          : "Guest limit reached. Please sign up to continue.";
    return new Response(message, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  }

  const guestReservedTokens = isGuestMode
    ? Math.max(1, Math.min(remainingGuestTokens, guestPerRequestCap))
    : undefined;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        if (hasOpenAIKey()) {
          for await (const chunk of streamOpenAIResponseText({
            prompt,
            attachmentUrls: safeAttachmentUrls,
            modelPreference: safePreference,
            selectedLanguage: safeLanguage,
            maxOutputTokensOverride: guestReservedTokens,
          })) {
            controller.enqueue(encoder.encode(chunk));
          }
        } else {
          for await (const chunk of createSimulatedStream({
            prompt,
            chatId,
            attachmentUrls: safeAttachmentUrls,
            selectedLanguage: safeLanguage,
          })) {
            controller.enqueue(encoder.encode(chunk));
          }
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown provider error.";
        const prefix =
          safeLanguage === "arabic"
            ? "خطأ في مزود النموذج. تم التحويل إلى استجابة محلية."
            : safeLanguage === "hebrew"
              ? "שגיאת ספק מודל. עוברים לתגובה מקומית."
              : "Provider error. Falling back to offline response.";
        for await (const chunk of streamTextByWord(
          `${prefix} ${message}`,
        )) {
          controller.enqueue(encoder.encode(chunk));
        }
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      ...(isGuestMode
        ? {
            "Set-Cookie": `${GUEST_COOKIE}=${usedTokens + (guestReservedTokens ?? 0)}; Path=/; Max-Age=86400; SameSite=Lax`,
          }
        : {}),
    },
  });
}
