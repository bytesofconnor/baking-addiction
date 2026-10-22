import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type ToastTone = "success" | "error" | "note";

type Toast = {
  id: number;
  message: string;
  tone: ToastTone;
};

type ToastOptions = {
  duration?: number;
  tone?: ToastTone;
};

type ToastContextValue = {
  dismiss: (id: number) => void;
  show: (message: string, options?: ToastOptions) => number;
  success: (message: string, duration?: number) => number;
  error: (message: string, duration?: number) => number;
};

const ToastContext = createContext<ToastContextValue | null>(null);
let nextToastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef(new Map<number, number>());

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer !== undefined) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    (message: string, options: ToastOptions = {}) => {
      const id = ++nextToastId;
      const tone = options.tone ?? "note";
      const duration = options.duration ?? (tone === "error" ? 5200 : 3400);
      setToasts((current) => [
        ...current.filter((toast) => toast.message !== message).slice(-2),
        { id, message, tone },
      ]);
      timers.current.set(
        id,
        window.setTimeout(() => dismiss(id), duration),
      );
      return id;
    },
    [dismiss],
  );

  useEffect(
    () => () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
      timers.current.clear();
    },
    [],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      dismiss,
      show,
      success: (message, duration) =>
        show(message, { tone: "success", duration }),
      error: (message, duration) =>
        show(message, { tone: "error", duration }),
    }),
    [dismiss, show],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <section className="book-toast-region" aria-label="Notifications">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="book-toast"
            data-tone={toast.tone}
            role={toast.tone === "error" ? "alert" : "status"}
            aria-live={toast.tone === "error" ? "assertive" : "polite"}
            aria-atomic="true"
          >
            <span className="book-toast-mark" aria-hidden="true">
              {toast.tone === "success"
                ? "✓"
                : toast.tone === "error"
                  ? "!"
                  : "•"}
            </span>
            <span className="book-toast-message">{toast.message}</span>
            <button
              type="button"
              className="book-toast-close"
              aria-label="Dismiss notification"
              onClick={() => dismiss(toast.id)}
            >
              ×
            </button>
          </div>
        ))}
      </section>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }
  return context;
}
