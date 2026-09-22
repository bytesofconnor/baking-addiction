import {
  type KeyboardEvent,
  type ReactNode,
  useRef,
} from "react";

export function FilterBlock({
  label,
  labelId,
  note,
  action,
  children,
}: {
  label: string;
  labelId: string;
  note?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="book-filter-block-head">
        <div>
          <p id={labelId} className="book-filter-kicker">
            {label}
          </p>
          {note ? <p className="book-filter-note">{note}</p> : null}
        </div>
        {action}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

export function FilterCheck({
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
      role="checkbox"
      aria-checked={checked}
      className="book-check"
      onClick={onChange}
    >
      <span className="book-check-box" aria-hidden="true" />
      {children}
    </button>
  );
}

export function FilterChecks({
  labelledBy,
  children,
}: {
  labelledBy: string;
  children: ReactNode;
}) {
  return (
    <div role="group" aria-labelledby={labelledBy} className="book-checks">
      {children}
    </div>
  );
}

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
  children: string;
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

export function FilterTabs({
  labelledBy,
  children,
}: {
  labelledBy: string;
  children: ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={root}
      role="radiogroup"
      aria-labelledby={labelledBy}
      className="book-tabs"
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

export function FilterTab({
  checked,
  onChange,
  children,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  children: ReactNode;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      aria-label={label}
      className="book-tab"
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
