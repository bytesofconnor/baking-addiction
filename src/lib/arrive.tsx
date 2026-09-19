import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { prefersReducedMotion } from "@/lib/bookPages";

export type ArrivePhase = "arrive" | "opening" | "in";

const LAND_MS = 720;
const OPEN_MS = 1000;

type ArriveContextValue = {
  phase: ArrivePhase;
  skip: () => void;
};

const ArriveContext = createContext<ArriveContextValue | null>(null);

function writeArrive(phase: ArrivePhase) {
  document.documentElement.dataset.arrive = phase;
}

export function ArriveProvider({ children }: { children: ReactNode }) {
  const reduced = typeof window !== "undefined" && prefersReducedMotion();
  const [phase, setPhase] = useState<ArrivePhase>(reduced ? "in" : "arrive");

  useLayoutEffect(() => {
    writeArrive(phase);
  }, [phase]);

  const skip = useCallback(() => {
    setPhase("in");
  }, []);

  useEffect(() => {
    if (reduced) {
      writeArrive("in");
      return;
    }

    const openAt = window.setTimeout(() => {
      setPhase((current) => (current === "in" ? current : "opening"));
    }, LAND_MS);
    const doneAt = window.setTimeout(() => {
      setPhase("in");
    }, LAND_MS + OPEN_MS);

    return () => {
      window.clearTimeout(openAt);
      window.clearTimeout(doneAt);
    };
  }, [reduced]);

  const value = useMemo(() => ({ phase, skip }), [phase, skip]);

  return (
    <ArriveContext.Provider value={value}>{children}</ArriveContext.Provider>
  );
}

export function useArrive(): ArriveContextValue {
  const context = useContext(ArriveContext);
  if (!context) {
    throw new Error("useArrive must be used inside ArriveProvider");
  }
  return context;
}

export const ARRIVE_OPEN_MS = OPEN_MS;
