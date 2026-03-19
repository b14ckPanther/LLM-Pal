"use client";

import { RefObject, useEffect, useRef, useState } from "react";

export function useAutoScroll<T extends HTMLElement>(
  ref: RefObject<T | null>,
  deps: unknown[],
) {
  const [isPinnedToBottom, setIsPinnedToBottom] = useState(true);
  const isUserScrollingRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onScroll = () => {
      const threshold = 80;
      const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      const pinned = distanceFromBottom < threshold;
      setIsPinnedToBottom(pinned);
      isUserScrollingRef.current = !pinned;
    };

    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [ref]);

  useEffect(() => {
    const el = ref.current;
    if (!el || isUserScrollingRef.current) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  return { isPinnedToBottom };
}
