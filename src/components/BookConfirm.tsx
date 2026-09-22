import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

export type BookConfirmProps = {
  open: boolean;
  title: string;
  body: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Destructive confirm (delete / discard). */
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/** In-book confirmation slip — paper and cinnamon, not a browser alert. */
export function BookConfirm({
  open,
  title,
  body,
  confirmLabel = "Continue",
  cancelLabel = "Keep working",
  danger = false,
  busy = false,
  onConfirm,
  onCancel,
}: BookConfirmProps) {
  const titleId = useId();
  const bodyId = useId();
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const previous = document.activeElement;
    confirmRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !busy) {
        event.preventDefault();
        onCancel();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (previous instanceof HTMLElement) {
        previous.focus();
      }
    };
  }, [open, busy, onCancel]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="book-confirm-root" role="presentation">
      <button
        type="button"
        className="book-confirm-scrim"
        aria-label="Dismiss"
        disabled={busy}
        onClick={() => {
          if (!busy) {
            onCancel();
          }
        }}
      />
      <div
        className="book-confirm"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        data-danger={danger ? "true" : undefined}
      >
        <h2 id={titleId} className="book-confirm-title">
          {title}
        </h2>
        <div id={bodyId} className="book-confirm-body">
          {body}
        </div>
        <div className="book-confirm-actions">
          <button
            type="button"
            className="book-press book-press-text"
            disabled={busy}
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            className={
              danger ? "book-press book-confirm-danger" : "book-press"
            }
            disabled={busy}
            aria-busy={busy}
            onClick={onConfirm}
          >
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
