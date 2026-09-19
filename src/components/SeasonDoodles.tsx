import type { ReactElement, ReactNode } from "react";
import { useSeason } from "@/lib/SeasonTheme";
import type { DoodleName, DoodleSpot } from "@/lib/season";

function DoodleSvg({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.15"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

function Apple({ className }: { className?: string }) {
  return (
    <DoodleSvg className={className}>
      <path
        fill="currentColor"
        fillOpacity="0.28"
        d="M32 20c-2.5-6-8-9-13-7-7 3-9 14-5 24 4 11 12 17 18 17s14-6 18-17c4-10 2-21-5-24-5-2-10.5 1-13 7Z"
      />
      <path d="M32 20c1-8 6-12 11-13" />
      <path d="M32 22c-5 3-9 3-13 1" />
    </DoodleSvg>
  );
}

function Leaf({ className }: { className?: string }) {
  return (
    <DoodleSvg className={className}>
      <path
        fill="currentColor"
        fillOpacity="0.28"
        d="M12 46c10-24 28-34 44-38-2 18-8 34-28 42-6 2-16 2-16-4Z"
      />
      <path d="M16 44c10-12 22-22 36-28" />
    </DoodleSvg>
  );
}

function Maple({ className }: { className?: string }) {
  return (
    <DoodleSvg className={className}>
      <path d="M32 58V36" />
      <path
        fill="currentColor"
        fillOpacity="0.28"
        d="M32 18 18 26l6-12L14 10l16 4L32 4l2 10 16-4-10 4 6 12-14-8Z"
      />
    </DoodleSvg>
  );
}

function Squash({ className }: { className?: string }) {
  return (
    <DoodleSvg className={className}>
      <path d="M31 10c2 5 2 9 0 12" />
      <path
        fill="currentColor"
        fillOpacity="0.28"
        d="M20 26c-7 9-6 24 3 30 7 5 18 4 22-3 7-10 4-24-5-30-5-4-14-4-20 3Z"
      />
      <path d="M26 34c2 9 5 16 5 20" />
    </DoodleSvg>
  );
}

function Corn({ className }: { className?: string }) {
  return (
    <DoodleSvg className={className}>
      <path
        fill="currentColor"
        fillOpacity="0.28"
        d="M32 8c9 8 11 34 0 50-11-16-9-42 0-50Z"
      />
      <path d="M26 22c2 1 4 1 6 0M32 22c2 1 4 1 6 0" />
      <path d="M25 30c2 1 5 1 7 0M32 30c2 1 5 1 7 0" />
      <path d="M26 38c2 1 4 1 6 0M32 38c2 1 4 1 6 0" />
      <path d="M18 20c-5 12-2 24 8 30" />
      <path d="M46 20c5 12 2 24-8 30" />
    </DoodleSvg>
  );
}

function Tomato({ className }: { className?: string }) {
  return (
    <DoodleSvg className={className}>
      <path
        fill="currentColor"
        fillOpacity="0.28"
        d="M16 30c0-10 8-16 16-16s16 6 16 16-6 20-16 20-16-10-16-20Z"
      />
      <path d="M32 14c-4-6-10-6-12-4 4 2 8 4 12 4 4 0 8-2 12-4-2-2-8-2-12 4Z" />
    </DoodleSvg>
  );
}

function Rain({ className }: { className?: string }) {
  return (
    <DoodleSvg className={className}>
      <path d="M18 18c0 6 4 12 6 12s6-6 6-12-4-8-6-8-6 2-6 8Z" />
      <path d="M34 28c0 6 4 12 6 12s6-6 6-12-4-8-6-8-6 2-6 8Z" />
      <path d="M24 42c0 5 3 10 5 10s5-5 5-10-3-7-5-7-5 2-5 7Z" />
    </DoodleSvg>
  );
}

function Pumpkin({ className }: { className?: string }) {
  return (
    <DoodleSvg className={className}>
      <path d="M32 16c2 4 2 8 0 10" />
      <path
        fill="currentColor"
        fillOpacity="0.28"
        d="M16 34c0-12 8-18 16-18s16 6 16 18-6 18-16 18-16-6-16-18Z"
      />
      <path d="M24 20c-4 6-4 20 0 28" />
      <path d="M40 20c4 6 4 20 0 28" />
    </DoodleSvg>
  );
}

function Pine({ className }: { className?: string }) {
  return (
    <DoodleSvg className={className}>
      <path d="M32 58V40" />
      <path
        fill="currentColor"
        fillOpacity="0.28"
        d="M32 10 16 28h8l-10 10h10l-8 10h28l-8-10h10L40 28h8L32 10Z"
      />
    </DoodleSvg>
  );
}

function Snow({ className }: { className?: string }) {
  return (
    <DoodleSvg className={className}>
      <path d="M32 10v44M12 32h40M18 18l28 28M46 18 18 46" />
    </DoodleSvg>
  );
}

function Mug({ className }: { className?: string }) {
  return (
    <DoodleSvg className={className}>
      <path
        fill="currentColor"
        fillOpacity="0.28"
        d="M16 24h26v22c0 6-6 10-13 10s-13-4-13-10V24Z"
      />
      <path d="M42 28h6c4 0 6 4 6 8s-2 8-6 8h-6" />
      <path d="M24 14c0-4 4-6 4-10" />
      <path d="M32 14c0-4 4-6 4-10" />
    </DoodleSvg>
  );
}

function Berry({ className }: { className?: string }) {
  return (
    <DoodleSvg className={className}>
      <path d="M24 36a8 8 0 1 1 0.1 0Z" />
      <path d="M38 30a8 8 0 1 1 0.1 0Z" />
      <path d="M36 44a7 7 0 1 1 0.1 0Z" />
      <path d="M32 22c2 4 6 6 10 6" />
    </DoodleSvg>
  );
}

function Strawberry({ className }: { className?: string }) {
  return (
    <DoodleSvg className={className}>
      <path
        fill="currentColor"
        fillOpacity="0.28"
        d="M32 18c-10 4-16 16-12 26 4 8 20 8 24 0 4-10-2-22-12-26Z"
      />
      <path d="M22 18c4 2 7 2 10 0 3 2 6 2 10 0-2-6-8-8-10-8s-8 2-10 8Z" />
      <path d="M26 30h.1M34 36h.1M28 42h.1M36 28h.1" />
    </DoodleSvg>
  );
}

function Lilac({ className }: { className?: string }) {
  return (
    <DoodleSvg className={className}>
      <path d="M32 58V30" />
      <path fill="currentColor" fillOpacity="0.28" d="M24 22a6 6 0 1 1 0.1 0Z" />
      <path fill="currentColor" fillOpacity="0.28" d="M32 16a6 6 0 1 1 0.1 0Z" />
      <path fill="currentColor" fillOpacity="0.28" d="M40 22a6 6 0 1 1 0.1 0Z" />
      <path fill="currentColor" fillOpacity="0.28" d="M28 30a5 5 0 1 1 0.1 0Z" />
      <path fill="currentColor" fillOpacity="0.28" d="M36 30a5 5 0 1 1 0.1 0Z" />
      <path d="M20 36c6-2 10-2 12 2" />
    </DoodleSvg>
  );
}

function Rhubarb({ className }: { className?: string }) {
  return (
    <DoodleSvg className={className}>
      <path d="M24 54c-2-16 0-28 2-36 6-2 8 2 6 8" />
      <path d="M36 54c2-18 4-30 8-36 6 0 6 6 2 10" />
      <path d="M18 16c6-6 12-6 16-2" />
      <path d="M36 16c6-4 12-2 14 4" />
    </DoodleSvg>
  );
}

function Robin({ className }: { className?: string }) {
  return (
    <DoodleSvg className={className}>
      <path d="M14 36c6-10 18-14 28-8 6 4 8 12 2 16-8 6-22 4-28-2-2-2-4-4-2-6Z" />
      <path d="M40 30c4-2 10-2 12 2" />
      <path d="M18 34c6 2 12 2 16-2" />
      <path d="M22 44l-4 8M30 46l2 8" />
    </DoodleSvg>
  );
}

function Wave({ className }: { className?: string }) {
  return (
    <DoodleSvg className={className}>
      <path
        fill="currentColor"
        fillOpacity="0.2"
        d="M6 28c8 8 14 8 22 0s14-8 22 0 8 8 10 8v12c-2 0-2-8-10-8s-14 8-22 0-14 8-22 0V28Z"
      />
      <path d="M6 28c8 8 14 8 22 0s14-8 22 0 8 8 10 8" />
      <path d="M6 40c8 8 14 8 22 0s14-8 22 0 8 8 10 8" />
    </DoodleSvg>
  );
}

function Cookie({ className }: { className?: string }) {
  return (
    <DoodleSvg className={className}>
      <path
        fill="currentColor"
        fillOpacity="0.28"
        d="M14 32c0-12 10-20 20-18 8 2 16 10 14 20-2 12-14 18-24 14-8-2-10-8-10-16Z"
      />
      <path d="M24 26h.2M34 22h.2M30 34h.2M40 32h.2M26 40h.2" />
    </DoodleSvg>
  );
}

function Pie({ className }: { className?: string }) {
  return (
    <DoodleSvg className={className}>
      <path
        fill="currentColor"
        fillOpacity="0.28"
        d="M12 40c4 10 16 16 28 12 6-2 10-8 8-14L32 18 12 40Z"
      />
      <path d="M14 38c10-4 22-6 32 0" />
      <path d="M32 18v10" />
    </DoodleSvg>
  );
}

function Tap({ className }: { className?: string }) {
  return (
    <DoodleSvg className={className}>
      <path d="M18 14h8v18" />
      <path d="M22 32c0 8 4 14 4 14" />
      <path d="M16 48h20c2 6-2 10-10 10s-12-4-10-10Z" />
      <path d="M20 48c2 4 8 4 12 0" />
    </DoodleSvg>
  );
}

const DOODLES: Record<
  DoodleName,
  (props: { className?: string }) => ReactElement
> = {
  apple: Apple,
  berry: Berry,
  cookie: Cookie,
  corn: Corn,
  leaf: Leaf,
  lilac: Lilac,
  maple: Maple,
  mug: Mug,
  pie: Pie,
  pine: Pine,
  pumpkin: Pumpkin,
  rain: Rain,
  rhubarb: Rhubarb,
  robin: Robin,
  snow: Snow,
  squash: Squash,
  strawberry: Strawberry,
  tap: Tap,
  tomato: Tomato,
  wave: Wave,
};

const TONE_CLASS: Record<DoodleSpot["tone"], string> = {
  action: "season-doodle-action",
  cocoa: "season-doodle-cocoa",
  leaf: "season-doodle-leaf",
  cool: "season-doodle-cool",
};

function Spot({ spot }: { spot: DoodleSpot }) {
  const Graphic = DOODLES[spot.doodle];
  return (
    <div
      className={`season-doodle absolute max-md:[&:nth-child(n+5)]:hidden ${TONE_CLASS[spot.tone]}`}
      style={{
        top: spot.top,
        right: spot.right,
        left: spot.left,
        width: spot.size,
        height: spot.size,
        transform: `rotate(${spot.rotate}deg)`,
      }}
    >
      <Graphic className="h-full w-full" />
    </div>
  );
}

export function SeasonDoodles() {
  const theme = useSeason();

  return (
    <div
      aria-hidden="true"
      className="season-doodles pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {theme.doodles.map((spot, index) => (
        <Spot key={`${theme.month}-${spot.doodle}-${index}`} spot={spot} />
      ))}
    </div>
  );
}
