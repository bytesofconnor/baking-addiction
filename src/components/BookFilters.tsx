import {
  type KeyboardEvent,
  type ReactNode,
  useRef,
} from "react";

function moveRadio(
  event: KeyboardEvent<HTMLDivElement>,
  buttons: HTMLButtonElement[],
) {
  if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
    return;
  }
  const current = buttons.indexOf(event.target as HTMLButtonElement);
  if (current < 0) {
    return;
  }
  event.preventDefault();
  const step = event.key === "ArrowRight" ? 1 : -1;
  const next = buttons[(current + step + buttons.length) % buttons.length];
  next?.focus();
  next?.click();
}

export function FilterSegments({
  labelledBy,
  children,
}: {
  labelledBy?: string;
  children: ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={root}
      role="radiogroup"
      aria-labelledby={labelledBy}
      className="book-marks"
      onKeyDown={(event) => {
        const buttons = [
          ...(root.current?.querySelectorAll<HTMLButtonElement>(
            '[role="radio"]',
          ) ?? []),
        ];
        moveRadio(event, buttons);
      }}
    >
      {children}
    </div>
  );
}

export function FilterSegment({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      className="book-mark"
      tabIndex={checked ? 0 : -1}
      onClick={onChange}
    >
      {children}
    </button>
  );
}

export function FilterSorts({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={root}
      role="radiogroup"
      aria-label={label}
      className="book-sorts"
      onKeyDown={(event) => {
        const buttons = [
          ...(root.current?.querySelectorAll<HTMLButtonElement>(
            '[role="radio"]',
          ) ?? []),
        ];
        moveRadio(event, buttons);
      }}
    >
      {children}
    </div>
  );
}

export function FilterSort({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      className="book-sort"
      tabIndex={checked ? 0 : -1}
      onClick={onChange}
    >
      {children}
    </button>
  );
}
