import { useEffect, useState } from "react";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useInkReveal(letter: string | null) {
  const [shown, setShown] = useState("");

  useEffect(() => {
    if (!letter) {
      setShown("");
      return;
    }
    if (prefersReducedMotion()) {
      setShown(letter);
      return;
    }

    const words = letter.split(/(\s+)/);
    let index = 0;
    let frame = 0;
    setShown("");

    const tick = () => {
      index += 1;
      setShown(words.slice(0, index).join(""));
      if (index < words.length) {
        frame = window.setTimeout(tick, words[index - 1]?.trim() ? 28 : 8);
      }
    };

    frame = window.setTimeout(tick, 120);
    return () => window.clearTimeout(frame);
  }, [letter]);

  return shown;
}
