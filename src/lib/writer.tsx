import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  clearDeskToken,
  readDeskToken,
  readLegacyPassword,
  writeDeskToken,
} from "@/lib/desk";

type WriterStatus = "checking" | "locked" | "unlocked";

type WriterContextValue = {
  status: WriterStatus;
  token: string;
  unlock: (code: string) => Promise<void>;
  lock: () => Promise<void>;
};

const WriterContext = createContext<WriterContextValue | null>(null);

export function WriterProvider({ children }: { children: ReactNode }) {
  const unlockDesk = useMutation(api.desk.unlock);
  const touchDesk = useMutation(api.desk.touch);
  const lockDesk = useMutation(api.desk.lock);
  const [status, setStatus] = useState<WriterStatus>("checking");
  const [token, setToken] = useState("");

  const unlock = useCallback(
    async (code: string) => {
      const result = await unlockDesk({ code });
      writeDeskToken(result.token);
      setToken(result.token);
      setStatus("unlocked");
    },
    [unlockDesk],
  );

  const lock = useCallback(async () => {
    const current = token || readDeskToken();
    if (current) {
      try {
        await lockDesk({ writerToken: current });
      } catch {
        // Still close the door on this device.
      }
    }
    clearDeskToken();
    setToken("");
    setStatus("locked");
  }, [lockDesk, token]);

  useEffect(() => {
    const stored = readDeskToken();
    const legacy = readLegacyPassword();

    if (stored) {
      void touchDesk({ writerToken: stored })
        .then(() => {
          writeDeskToken(stored);
          setToken(stored);
          setStatus("unlocked");
        })
        .catch(() => {
          clearDeskToken();
          setStatus("locked");
        });
      return;
    }

    if (legacy) {
      void unlockDesk({ code: legacy })
        .then((result) => {
          writeDeskToken(result.token);
          setToken(result.token);
          setStatus("unlocked");
        })
        .catch(() => {
          clearDeskToken();
          setStatus("locked");
        });
      return;
    }

    setStatus("locked");
  }, [touchDesk, unlockDesk]);

  const value = useMemo(
    () => ({ status, token, unlock, lock }),
    [status, token, unlock, lock],
  );

  return (
    <WriterContext.Provider value={value}>{children}</WriterContext.Provider>
  );
}

export function useWriter() {
  const context = useContext(WriterContext);
  if (!context) {
    throw new Error("useWriter must be used inside WriterProvider");
  }
  return context;
}
