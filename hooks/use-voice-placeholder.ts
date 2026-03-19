"use client";

import { useMemo, useState } from "react";
import type { VoiceInputState } from "@/types/chat";

export function useVoicePlaceholder() {
  const [state, setState] = useState<VoiceInputState>({
    enabled: false,
    recording: false,
    durationMs: 0,
  });

  const reason = useMemo(
    () => "Voice capture is planned and reserved in architecture.",
    [],
  );

  const toggleEnabled = () =>
    setState((prev) => ({
      ...prev,
      enabled: !prev.enabled,
      recording: false,
      durationMs: 0,
    }));

  return { state, reason, toggleEnabled };
}
