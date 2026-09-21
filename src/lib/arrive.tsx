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
import { BOOK_OVER_MS, isDoorFlip, prefersReducedMotion } from "@/lib/bookPages";
import { useFamily } from "@/lib/family";
import { clearOAuthReturn, isOAuthReturn } from "@/lib/oauthReturn";

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

/** Skip the first-load book-land when flipping back to the Join cover. */
function writeLand(mode: "skip" | null) {
  if (mode) {
    document.documentElement.dataset.land = mode;
  } else {
    delete document.documentElement.dataset.land;
  }
}

export function ArriveProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { status } = useFamily();
  const reduced = typeof window !== "undefined" && prefersReducedMotion();
  const landingLocked = pathname === "/join" && status !== "in";
  const signingIn = pathname === "/join" && status === "in" && isOAuthReturn();
  const wasLanding = useRef(pathname === "/join");
  const prevPath = useRef(pathname);
  const [phase, setPhase] = useState<ArrivePhase>(
    landingLocked || signingIn ? "arrive" : "in",
  );

  useLayoutEffect(() => {
    writeArrive(phase);
  }, [phase]);

  const skip = useCallback(() => {
    writeLand(null);
    setPhase("in");
  }, []);

  useEffect(() => {
    const from = prevPath.current;
    const to = pathname;
    prevPath.current = to;

    // Front ↔ Back: whole-book flip — never open the cover like a door.
    if (from !== to && isDoorFlip(from, to)) {
      if (reduced) {
        wasLanding.current = to === "/join";
        writeLand(to === "/join" ? "skip" : null);
        setPhase(to === "/join" ? "arrive" : "in");
        return;
      }

      if (to === "/faq") {
        wasLanding.current = false;
        writeLand(null);
        setPhase("arrive");
        const mid = window.setTimeout(() => {
          writeArrive("in");
          setPhase("in");
        }, BOOK_OVER_MS / 2);
        return () => {
          window.clearTimeout(mid);
        };
      }

      // Back → Front: keep the FAQ face until edge-on, then settle on the
      // cover without replaying the first-load land animation.
      wasLanding.current = true;
      const mid = window.setTimeout(() => {
        writeLand("skip");
        writeArrive("arrive");
        setPhase("arrive");
      }, BOOK_OVER_MS / 2);
      return () => {
        window.clearTimeout(mid);
      };
    }

    if (landingLocked) {
      wasLanding.current = true;
      // Fresh visit to Join still lands; a flip-back already set skip.
      setPhase("arrive");
      return;
    }

    writeLand(null);

    if (reduced) {
      clearOAuthReturn();
      writeArrive("in");
      setPhase("in");
      return;
    }

    const openingDelay = wasLanding.current ? 180 : LAND_MS;
    const openAt = window.setTimeout(() => {
      setPhase((current) => (current === "in" ? current : "opening"));
    }, openingDelay);
    const doneAt = window.setTimeout(() => {
      clearOAuthReturn();
      setPhase("in");
      wasLanding.current = false;
    }, openingDelay + OPEN_MS);

    return () => {
      window.clearTimeout(openAt);
      window.clearTimeout(doneAt);
    };
  }, [landingLocked, pathname, reduced]);

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
