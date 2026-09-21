import { useLayoutEffect, useRef, useState } from "react";

/** Ring height — keep in sync with `.book-hole` / `.book-coil-ring`. */
const RING_REM = 0.82;
/** Open space between rings — matches the cover’s look with ~22 rings. */
const GAP_REM = 0.68;

function remPx(): number {
  return Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
}

function ringsForHeight(heightPx: number): number {
  const rem = remPx();
  const pitch = (RING_REM + GAP_REM) * rem;
  const inset = 0.9 * rem; // top + bottom padding on the coil column
  const usable = Math.max(0, heightPx - inset);
  return Math.max(10, Math.floor((usable + GAP_REM * rem) / pitch));
}

export function BookBinding() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [rings, setRings] = useState(22);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    let frame = 0;
    let timer = 0;

    function measure() {
      const height = root?.clientHeight ?? 0;
      if (height <= 0) {
        return;
      }
      const next = ringsForHeight(height);
      setRings((current) => (current === next ? current : next));
    }

    function schedule() {
      window.clearTimeout(timer);
      // Coalesce resize storms from page turns so the coil doesn’t
      // rebuild mid-settle and look like a second paint.
      timer = window.setTimeout(() => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(measure);
      }, 120);
    }

    measure();
    const observer = new ResizeObserver(schedule);
    observer.observe(root);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={rootRef} className="book-binding" aria-hidden="true">
      <div className="book-holes">
        {Array.from({ length: rings }, (_, index) => (
          <span key={`hole-${index}`} className="book-hole" />
        ))}
      </div>
      <div className="book-coil">
        {Array.from({ length: rings }, (_, index) => (
          <span key={`ring-${index}`} className="book-coil-ring" />
        ))}
      </div>
    </div>
  );
}
