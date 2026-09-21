import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLocation } from "react-router";
import { prefersReducedMotion } from "@/lib/bookPages";
import { useFamily } from "@/lib/family";

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
  const { pathname } = useLocation();
  const { status } = useFamily();
  const reduced = typeof window !== "undefined" && prefersReducedMotion();
  const landingLocked = pathname === "/join" && status !== "in";
  const wasLanding = useRef(pathname === "/join");
  const [phase, setPhase] = useState<ArrivePhase>(
    landingLocked ? "arrive" : reduced ? "in" : "arrive",
  );

  useLayoutEffect(() => {
    writeArrive(phase);
  }, [phase]);

  const skip = useCallback(() => {
    setPhase("in");
  }, []);

  useEffect(() => {
    if (landingLocked) {
      wasLanding.current = true;
      setPhase("arrive");
      return;
    }

    if (reduced) {
      writeArrive("in");
      setPhase("in");
      return;
    }

    const openingDelay = wasLanding.current ? 180 : LAND_MS;
    const openAt = window.setTimeout(() => {
      setPhase((current) => (current === "in" ? current : "opening"));
    }, openingDelay);
    const doneAt = window.setTimeout(() => {
      setPhase("in");
      wasLanding.current = false;
    }, openingDelay + OPEN_MS);

    return () => {
      window.clearTimeout(openAt);
      window.clearTimeout(doneAt);
    };
  }, [landingLocked, reduced]);

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
