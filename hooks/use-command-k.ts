"use client";

import { useEffect } from "react";

type UseCommandKOptions = {
  onTrigger: () => void;
};

export function useCommandK({ onTrigger }: UseCommandKOptions) {
  useEffect(() => {
    const onKeydown = (event: KeyboardEvent) => {
      const isK = event.key.toLowerCase() === "k";
      const withMeta = event.metaKey || event.ctrlKey;
      if (!isK || !withMeta) return;
      event.preventDefault();
      onTrigger();
    };

    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
  }, [onTrigger]);
}
