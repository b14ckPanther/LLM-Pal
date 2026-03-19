import type { ModelPreference, SupportedLanguage } from "@/types/chat";

type OpenAIResponsePayload = {
  prompt: string;
  attachmentUrls?: string[];
  modelPreference?: ModelPreference;
  selectedLanguage?: SupportedLanguage;
  maxOutputTokensOverride?: number;
};

const OPENAI_CHAT_COMPLETIONS_URL =
  "https://api.openai.com/v1/chat/completions";

function getConfiguredModel(preference: ModelPreference | undefined) {
  const explicit = process.env.OPENAI_MODEL?.trim();
  if (explicit) return explicit;

  if (preference === "premium") {
    return process.env.OPENAI_MODEL_PREMIUM?.trim() || "gpt-4.1";
  }

  return process.env.OPENAI_MODEL_AFFORDABLE?.trim() || "gpt-4.1-mini";
}

function getLanguageInstruction(language: SupportedLanguage | undefined) {
  if (language === "arabic") {
    return "Respond only in Arabic. Do not use English or Hebrew.";
  }
  if (language === "hebrew") {
    return "Respond only in Hebrew. Do not use English or Arabic.";
  }
  return "Respond only in English. Do not use Arabic or Hebrew.";
}

export function hasOpenAIKey() {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

function getMaxOutputTokens(override?: number) {
  if (typeof override === "number" && Number.isFinite(override) && override > 0) {
    return Math.floor(override);
  }
  const parsed = Number(process.env.OPENAI_MAX_OUTPUT_TOKENS ?? "700");
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 700;
}

function extractDeltaContent(json: unknown): string {
  if (!json || typeof json !== "object") return "";
  const root = json as {
    choices?: Array<{ delta?: { content?: unknown } }>;
  };
  const deltaContent = root.choices?.[0]?.delta?.content;

  if (typeof deltaContent === "string") return deltaContent;
  if (Array.isArray(deltaContent)) {
    return deltaContent
      .map((item) => {
        if (!item || typeof item !== "object") return "";
        const entry = item as { text?: unknown };
        return typeof entry.text === "string" ? entry.text : "";
      })
      .join("");
  }
  return "";
}

export async function* streamOpenAIResponseText(
  payload: OpenAIResponsePayload,
): AsyncGenerator<string> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY.");
  }

  const content: Array<Record<string, unknown>> = [
    { type: "text", text: payload.prompt },
  ];

  for (const url of payload.attachmentUrls ?? []) {
    content.push({ type: "image_url", image_url: { url } });
  }

  const res = await fetch(OPENAI_CHAT_COMPLETIONS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: getConfiguredModel(payload.modelPreference),
      stream: true,
      messages: [
        {
          role: "system",
          content: getLanguageInstruction(payload.selectedLanguage),
        },
        { role: "user", content },
      ],
      max_tokens: getMaxOutputTokens(payload.maxOutputTokensOverride),
    }),
  });

  if (!res.ok) {
    const details = await res.text();
    throw new Error(`OpenAI request failed (${res.status}): ${details}`);
  }

  if (!res.body) {
    throw new Error("OpenAI stream body is empty.");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let done = false;

  while (!done) {
    const read = await reader.read();
    done = read.done;
    if (read.value) {
      buffer += decoder.decode(read.value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line.startsWith("data:")) continue;
        const data = line.slice(5).trim();
        if (!data || data === "[DONE]") continue;

        try {
          const parsed = JSON.parse(data) as unknown;
          const text = extractDeltaContent(parsed);
          if (text) yield text;
        } catch {
          // Ignore malformed non-JSON heartbeat lines.
        }
      }
    }
  }
}
