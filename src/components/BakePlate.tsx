import type { BakeKind } from "../../convex/lib/kinds";

const QUOTES: Record<BakeKind, string[]> = {
  muffins: [
    "The crumb should stay put.",
    "Warm the chips so they don’t sink.",
  ],
  cookies: [
    "Salt while they’re still warm.",
    "The ugly ones taste the same.",
  ],
  cake: [
    "A thin swirl is enough.",
    "Let it sit before you cut.",
  ],
  bread: [
    "The loaf tells you when it’s ready.",
    "Tear, don’t slice, if you’re hungry.",
  ],
  crisp: [
    "Wait till the edges go jammy.",
    "Cream on the side, not ice cream.",
  ],
  bars: [
    "The first one is eaten standing up.",
    "Corner or middle. That’s the house rule.",
  ],
  other: [
    "Write it down while the kitchen’s still warm.",
    "Come back for the next one.",
  ],
};

function pickQuote(kind: BakeKind, seed: string) {
  const quotes = QUOTES[kind];
  let hash = 0;
  for (const char of seed) {
    hash = (hash + char.charCodeAt(0)) % quotes.length;
  }
  return quotes[hash] ?? quotes[0];
}

function KindMark({ kind }: { kind: BakeKind }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (kind === "muffins") {
    return (
      <g {...common}>
        <path d="M18 38c0-7 4-12 10-12s10 5 10 12v10H18V38Z" />
        <path d="M22 26c1-8 5-14 6-14s5 6 6 14" />
        <path d="M46 40c0-6 3-10 8-10s8 4 8 10v8H46v-8Z" />
        <path d="M49 30c1-6 4-11 5-11s4 5 5 11" />
        <path d="M70 36c0-5 3-9 7-9s7 4 7 9v9H70v-9Z" />
        <path d="M73 27c1-6 3-10 4-10s3 4 4 10" />
      </g>
    );
  }

  if (kind === "cookies") {
    return (
      <g {...common}>
        <circle cx="28" cy="36" r="14" />
        <circle cx="24" cy="32" r="1.2" fill="currentColor" stroke="none" />
        <circle cx="33" cy="38" r="1.2" fill="currentColor" stroke="none" />
        <circle cx="27" cy="42" r="1.2" fill="currentColor" stroke="none" />
        <circle cx="58" cy="30" r="11" />
        <circle cx="54" cy="27" r="1.1" fill="currentColor" stroke="none" />
        <circle cx="62" cy="33" r="1.1" fill="currentColor" stroke="none" />
        <circle cx="72" cy="48" r="9" />
        <circle cx="70" cy="46" r="1" fill="currentColor" stroke="none" />
      </g>
    );
  }

  if (kind === "cake") {
    return (
      <g {...common}>
        <ellipse cx="48" cy="50" rx="22" ry="7" />
        <path d="M26 50v-8c0-4 10-7 22-7s22 3 22 7v8" />
        <path d="M30 42c4-6 10-16 18-16 7 0 12 8 16 16" />
        <path d="M48 18v6" />
      </g>
    );
  }

  if (kind === "bread") {
    return (
      <g {...common}>
        <path d="M18 48c0-12 8-22 30-22s30 10 30 22v6H18v-6Z" />
        <path d="M28 30c4-6 10-10 20-10" />
        <path d="M26 44h44" />
      </g>
    );
  }

  if (kind === "crisp") {
    return (
      <g {...common}>
        <path d="M22 28h52v22a8 8 0 0 1-8 8H30a8 8 0 0 1-8-8V28Z" />
        <path d="M22 36c6-4 12 2 18-1 7-3 12 3 18 0 6-3 11 2 16 0" />
        <path d="M30 24c4 2 8-2 12 1M48 23c3 2 7-1 10 2" />
      </g>
    );
  }

  if (kind === "bars") {
    return (
      <g {...common}>
        <rect x="22" y="24" width="52" height="32" rx="2" />
        <path d="M39 24v32M56 24v32M22 40h52" />
      </g>
    );
  }

  return (
    <g {...common}>
      <ellipse cx="38" cy="46" rx="16" ry="7" />
      <path d="M22 46c0-10 7-18 16-18s16 8 16 18" />
      <path d="M54 28c10-8 22-4 24 8" />
      <path d="M70 24v8M66 28h8" />
    </g>
  );
}

export function BakePlate({
  kind,
  seed,
}: {
  kind: BakeKind;
  seed: string;
}) {
  const line = pickQuote(kind, seed);

  return (
    <div className="book-portal-plate">
      <svg
        viewBox="0 0 96 72"
        className="book-portal-plate-mark"
        aria-hidden="true"
      >
        <KindMark kind={kind} />
      </svg>
      <p className="book-portal-plate-line">{line}</p>
    </div>
  );
}
